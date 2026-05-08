import Room from '../../models/Room.js';
import { SERVER_EVENTS, ERROR_CODES, ROLES } from '../../utils/constants.js';
import { createSystemMessage } from '../../controllers/messageController.js';
import { getCachedRoom, setCachedRoom, invalidateRoomCache } from '../../utils/roomCache.js';
import { logger } from '../../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared leave logic (used by both explicit leave and disconnect timeout)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Core leave decision tree.
 *
 * Decision tree:
 *  Is the leaving user the host?
 *   ├── NO  → remove from participants, broadcast USER_LEFT + system msg
 *   └── YES
 *         ↓
 *    Is anyone else in the room?
 *     ├── NO  → mark isActive: false, invalidate cache (cron will delete later)
 *     └── YES → auto-promote (first moderator, else first participant) to host
 *               → remove old host from participants
 *               → broadcast HOST_TRANSFERRED + USER_LEFT + system msg
 *
 * @param {string} roomCode
 * @param {string} userId      - leaving user's clerkId
 * @param {string} username    - leaving user's display name
 * @param {object} io          - Socket.io server instance
 */
const processLeave = async (roomCode, userId, username, io) => {
  // Always fetch fresh from MongoDB to avoid stale cached role data
  const room = await Room.findOne({ roomCode });
  if (!room) return;

  const leavingParticipant = room.participants.find(p => p.userId === userId);
  if (!leavingParticipant) {
    // User not in participants array — nothing to do
    return;
  }

  const isLeavingUserHost = leavingParticipant.role === ROLES.HOST;
  const othersInRoom = room.participants.filter(p => p.userId !== userId);

  // ── Case 1: Non-host leaving ───────────────────────────────────────────────
  if (!isLeavingUserHost) {
    room.participants = othersInRoom;
    room.lastActivityAt = Date.now();
    await room.save();
    await setCachedRoom(roomCode, room);

    await createSystemMessage(room._id, roomCode, `${username} left the room`);

    io.to(roomCode).emit(SERVER_EVENTS.USER_LEFT, { userId, username });
    io.to(roomCode).emit(SERVER_EVENTS.NEW_MESSAGE, {
      type: 'system',
      content: `${username} left the room`,
      timestamp: new Date()
    });

    logger.info('Non-host left room', { roomCode, userId, username });
    return;
  }

  // ── Case 2: Host leaving alone (no other participants) ────────────────────
  if (othersInRoom.length === 0) {
    // Clear participants so the cron job can find this room
    // (query: participants empty + lastActivityAt older than 7 days)
    room.participants = [];
    room.lastActivityAt = Date.now();
    await room.save();
    await invalidateRoomCache(roomCode);

    logger.info('Host left as only participant — room is now empty', {
      roomCode,
      userId,
      username
    });
    return;
  }

  // ── Case 3: Host leaving while others remain → auto-promote ───────────────
  // Prefer first moderator, fall back to first remaining participant
  const nextHost =
    othersInRoom.find(p => p.role === ROLES.MODERATOR) ||
    othersInRoom[0];

  // Mutate roles on the participants array directly (Mongoose subdocs)
  room.participants = room.participants.map(p => {
    if (p.userId === nextHost.userId) {
      return { ...p.toObject(), role: ROLES.HOST };
    }
    return p;
  });

  // Remove the leaving host
  room.participants = room.participants.filter(p => p.userId !== userId);

  // Update the room-level hostId to the new host
  room.hostId = nextHost.userId;
  room.lastActivityAt = Date.now();
  await room.save();
  await setCachedRoom(roomCode, room);

  const systemMsg = `${username} left. ${nextHost.username} is now the host.`;
  await createSystemMessage(room._id, roomCode, systemMsg);

  // Broadcast host promotion first so clients can update role UI
  io.to(roomCode).emit(SERVER_EVENTS.HOST_TRANSFERRED, {
    newHostId: nextHost.userId,
    newHostUsername: nextHost.username,
    newHostRole: ROLES.HOST,
    previousHostId: userId
  });

  // Then broadcast that the old host left
  io.to(roomCode).emit(SERVER_EVENTS.USER_LEFT, { userId, username });

  // System message in chat
  io.to(roomCode).emit(SERVER_EVENTS.NEW_MESSAGE, {
    type: 'system',
    content: systemMsg,
    timestamp: new Date()
  });

  logger.info('Host left — auto-promoted new host', {
    roomCode,
    previousHostId: userId,
    newHostId: nextHost.userId,
    newHostUsername: nextHost.username
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Exported handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle user joining a room
 */
export const handleJoinRoom = async (socket, io, data) => {
  try {
    const { roomCode } = data;
    const userId = socket.data.userId;
    const username = socket.data.username;

    // Find room (always fresh — joining needs live state)
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Room not found',
        code: ERROR_CODES.ROOM_NOT_FOUND
      });
      return;
    }

    // Join socket room
    await socket.join(roomCode);
    socket.data.roomCode = roomCode;

    logger.info('Socket joined room', {
      roomCode,
      socketId: socket.id,
      userId,
      username,
      socketRooms: Array.from(socket.rooms),
      socketsInRoom: io.sockets.adapter.rooms.get(roomCode)?.size || 0
    });

    // Calculate current timestamp if video is playing
    let currentTimestamp = room.playbackState.timestamp;
    if (room.playbackState.isPlaying) {
      // Prevent drift by capping calculated timestamp at video duration
      const elapsedSeconds = (Date.now() - room.playbackState.lastUpdated) / 1000;
      currentTimestamp = room.playbackState.timestamp + elapsedSeconds;
      logger.info('Calculated current timestamp for playing video', {
        storedTimestamp: room.playbackState.timestamp,
        elapsedSeconds,
        currentTimestamp
      });
    }

    // If the room is empty (first person rejoining), reset playback to 0:00
    // so they don't resume from a stale timestamp left by the previous session
    const isEmptyRoom = room.participants.length === 0;
    if (isEmptyRoom) {
      currentTimestamp = 0;
    }

    // Send current state to joining user
    socket.emit(SERVER_EVENTS.SYNC_STATE, {
      currentVideo: room.currentVideo || null,
      playbackState: {
        isPlaying: isEmptyRoom ? false : room.playbackState.isPlaying,
        timestamp: currentTimestamp,
        lastUpdated: Date.now()
      },
      participants: room.participants
    });

    // Create and broadcast system message
    await createSystemMessage(room._id, roomCode, `${username} joined the room`);

    // Broadcast to others that user joined
    socket.to(roomCode).emit(SERVER_EVENTS.USER_JOINED, {
      userId,
      username,
      role: room.participants.find(p => p.userId === userId)?.role || 'participant'
    });

    // Broadcast new message to all (including joiner)
    io.to(roomCode).emit(SERVER_EVENTS.NEW_MESSAGE, {
      type: 'system',
      content: `${username} joined the room`,
      timestamp: new Date()
    });

    logger.info('User joined room via socket', {
      roomCode,
      userId,
      username,
      socketId: socket.id
    });
  } catch (error) {
    logger.error('Error in handleJoinRoom', {
      error: error.message,
      socketId: socket.id
    });
    socket.emit(SERVER_EVENTS.ERROR, {
      message: 'Failed to join room',
      code: ERROR_CODES.INTERNAL_ERROR
    });
  }
};

/**
 * Handle user leaving a room (explicit leave button click).
 * Applies the full leave decision tree.
 */
export const handleLeaveRoom = async (socket, io, data) => {
  try {
    const { roomCode } = data;
    const userId = socket.data.userId;
    const username = socket.data.username;

    await processLeave(roomCode, userId, username, io);

    // Leave the socket room
    socket.leave(roomCode);
    socket.data.roomCode = null;
  } catch (error) {
    logger.error('Error in handleLeaveRoom', {
      error: error.message,
      socketId: socket.id
    });
  }
};

/**
 * Handle socket disconnect (page refresh, network issues, tab close, etc.)
 * Waits 10 seconds to allow reconnection before applying the leave decision tree.
 */
export const handleDisconnect = async (socket, io) => {
  try {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;
    const username = socket.data.username;

    if (!roomCode) {
      return;
    }

    logger.info('Socket disconnected — starting 10s reconnect window', {
      socketId: socket.id,
      userId,
      username,
      roomCode
    });

    // Leave socket room immediately so fetchSockets() below is accurate
    socket.leave(roomCode);
    socket.data.roomCode = null;

    // Wait 10 seconds before removing participant
    // This allows page refresh / brief network blip to reconnect without eviction
    setTimeout(async () => {
      try {
        // Check if the user has reconnected (same userId active in the room)
        const socketsInRoom = await io.in(roomCode).fetchSockets();
        const userStillConnected = socketsInRoom.some(s => s.data.userId === userId);

        if (userStillConnected) {
          logger.info('User reconnected during grace period — not removing', {
            userId,
            username,
            roomCode
          });
          return;
        }

        // User did not reconnect — apply the same decision tree as explicit leave
        logger.info('User did not reconnect — applying leave logic', {
          userId,
          username,
          roomCode
        });

        await processLeave(roomCode, userId, username, io);
      } catch (error) {
        logger.error('Error removing user after disconnect timeout', {
          error: error.message,
          userId,
          roomCode
        });
      }
    }, 10000); // 10-second grace period
  } catch (error) {
    logger.error('Error in handleDisconnect', {
      error: error.message,
      socketId: socket.id
    });
  }
};
