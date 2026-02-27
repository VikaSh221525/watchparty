import Room from '../../models/Room.js';
import { SERVER_EVENTS, ERROR_CODES } from '../../utils/constants.js';
import { createSystemMessage } from '../../controllers/messageController.js';
import { logger } from '../../utils/logger.js';

/**
 * Handle user joining a room
 */
export const handleJoinRoom = async (socket, io, data) => {
  try {
    const { roomCode } = data;
    const userId = socket.data.userId;
    const username = socket.data.username;

    // Find room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Room not found',
        code: ERROR_CODES.ROOM_NOT_FOUND
      });
      return;
    }

    // Check if room is active
    if (!room.isActive) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Room is no longer active',
        code: ERROR_CODES.ROOM_INACTIVE
      });
      return;
    }

    // Join socket room
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    // Send current state to joining user
    socket.emit(SERVER_EVENTS.SYNC_STATE, {
      currentVideo: room.currentVideo || null,
      playbackState: room.playbackState,
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
 * Handle user leaving a room
 */
export const handleLeaveRoom = async (socket, io, data) => {
  try {
    const { roomCode } = data;
    const userId = socket.data.userId;
    const username = socket.data.username;

    // Find room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return;
    }

    // Remove user from participants
    room.participants = room.participants.filter(p => p.userId !== userId);
    room.lastActivityAt = Date.now();
    await room.save();

    // Leave socket room
    socket.leave(roomCode);
    socket.data.roomCode = null;

    // Create and broadcast system message
    await createSystemMessage(room._id, roomCode, `${username} left the room`);

    // Broadcast to others that user left
    socket.to(roomCode).emit(SERVER_EVENTS.USER_LEFT, {
      userId,
      username
    });

    // Broadcast new message to remaining users
    io.to(roomCode).emit(SERVER_EVENTS.NEW_MESSAGE, {
      type: 'system',
      content: `${username} left the room`,
      timestamp: new Date()
    });

    logger.info('User left room via socket', {
      roomCode,
      userId,
      username,
      socketId: socket.id
    });
  } catch (error) {
    logger.error('Error in handleLeaveRoom', {
      error: error.message,
      socketId: socket.id
    });
  }
};

/**
 * Handle socket disconnect
 */
export const handleDisconnect = async (socket, io) => {
  try {
    const roomCode = socket.data.roomCode;
    if (!roomCode) {
      return;
    }

    // Treat disconnect as leave room
    await handleLeaveRoom(socket, io, { roomCode });

    logger.info('Socket disconnected', {
      socketId: socket.id,
      userId: socket.data.userId,
      roomCode
    });
  } catch (error) {
    logger.error('Error in handleDisconnect', {
      error: error.message,
      socketId: socket.id
    });
  }
};
