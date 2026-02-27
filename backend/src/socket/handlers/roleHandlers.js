import Room from '../../models/Room.js';
import { SERVER_EVENTS, ERROR_CODES, ROLES } from '../../utils/constants.js';
import { validateRole } from '../../middleware/validation.js';
import { logger } from '../../utils/logger.js';

/**
 * Check if user is the host
 */
const isHost = (room, userId) => {
  return room.hostId === userId;
};

/**
 * Handle assign role event
 */
export const handleAssignRole = async (socket, io, data) => {
  try {
    const { roomCode, targetUserId, role } = data;
    const userId = socket.data.userId;

    // Validate role
    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      socket.emit(SERVER_EVENTS.ERROR, roleValidation.error);
      return;
    }

    // Find room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Room not found',
        code: ERROR_CODES.ROOM_NOT_FOUND
      });
      return;
    }

    // Check if requester is host
    if (!isHost(room, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Only the host can assign roles',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Cannot assign host role (use transfer_host instead)
    if (role === ROLES.HOST) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Use transfer_host to change the host',
        code: ERROR_CODES.INVALID_INPUT
      });
      return;
    }

    // Find target participant
    const targetParticipant = room.participants.find(p => p.userId === targetUserId);
    if (!targetParticipant) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Participant not found in room',
        code: ERROR_CODES.PARTICIPANT_NOT_FOUND
      });
      return;
    }

    // Update role
    targetParticipant.role = role;
    room.lastActivityAt = Date.now();
    await room.save();

    // Broadcast role assignment to all participants
    io.to(roomCode).emit(SERVER_EVENTS.ROLE_ASSIGNED, {
      userId: targetUserId,
      username: targetParticipant.username,
      role
    });

    logger.info('Role assigned', {
      roomCode,
      hostId: userId,
      targetUserId,
      role
    });
  } catch (error) {
    logger.error('Error in handleAssignRole', {
      error: error.message,
      socketId: socket.id
    });
    socket.emit(SERVER_EVENTS.ERROR, {
      message: 'Failed to assign role',
      code: ERROR_CODES.INTERNAL_ERROR
    });
  }
};

/**
 * Handle transfer host event
 */
export const handleTransferHost = async (socket, io, data) => {
  try {
    const { roomCode, targetUserId } = data;
    const userId = socket.data.userId;

    // Find room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Room not found',
        code: ERROR_CODES.ROOM_NOT_FOUND
      });
      return;
    }

    // Check if requester is host
    if (!isHost(room, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Only the host can transfer host privileges',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Find current host and target participant
    const currentHost = room.participants.find(p => p.userId === userId);
    const targetParticipant = room.participants.find(p => p.userId === targetUserId);

    if (!targetParticipant) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Target participant not found in room',
        code: ERROR_CODES.PARTICIPANT_NOT_FOUND
      });
      return;
    }

    // Swap roles
    currentHost.role = ROLES.PARTICIPANT;
    targetParticipant.role = ROLES.HOST;
    room.hostId = targetUserId;
    room.lastActivityAt = Date.now();
    await room.save();

    // Broadcast host transfer to all participants
    io.to(roomCode).emit(SERVER_EVENTS.HOST_TRANSFERRED, {
      newHostId: targetUserId,
      newHostUsername: targetParticipant.username,
      previousHostId: userId
    });

    logger.info('Host transferred', {
      roomCode,
      previousHostId: userId,
      newHostId: targetUserId
    });
  } catch (error) {
    logger.error('Error in handleTransferHost', {
      error: error.message,
      socketId: socket.id
    });
    socket.emit(SERVER_EVENTS.ERROR, {
      message: 'Failed to transfer host',
      code: ERROR_CODES.INTERNAL_ERROR
    });
  }
};

/**
 * Handle remove participant event
 */
export const handleRemoveParticipant = async (socket, io, data) => {
  try {
    const { roomCode, targetUserId } = data;
    const userId = socket.data.userId;

    // Find room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Room not found',
        code: ERROR_CODES.ROOM_NOT_FOUND
      });
      return;
    }

    // Check if requester is host
    if (!isHost(room, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Only the host can remove participants',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Cannot remove self
    if (targetUserId === userId) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Host cannot remove themselves',
        code: ERROR_CODES.INVALID_INPUT
      });
      return;
    }

    // Find target participant
    const targetParticipant = room.participants.find(p => p.userId === targetUserId);
    if (!targetParticipant) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Participant not found in room',
        code: ERROR_CODES.PARTICIPANT_NOT_FOUND
      });
      return;
    }

    // Remove participant from room
    room.participants = room.participants.filter(p => p.userId !== targetUserId);
    room.lastActivityAt = Date.now();
    await room.save();

    // Find target socket and force disconnect
    const sockets = await io.in(roomCode).fetchSockets();
    const targetSocket = sockets.find(s => s.data.userId === targetUserId);
    if (targetSocket) {
      targetSocket.emit(SERVER_EVENTS.FORCE_DISCONNECT, {
        reason: 'Removed from room by host'
      });
      targetSocket.leave(roomCode);
      targetSocket.disconnect(true);
    }

    // Broadcast participant removal to remaining participants
    io.to(roomCode).emit(SERVER_EVENTS.PARTICIPANT_REMOVED, {
      userId: targetUserId,
      username: targetParticipant.username
    });

    logger.info('Participant removed', {
      roomCode,
      hostId: userId,
      removedUserId: targetUserId
    });
  } catch (error) {
    logger.error('Error in handleRemoveParticipant', {
      error: error.message,
      socketId: socket.id
    });
    socket.emit(SERVER_EVENTS.ERROR, {
      message: 'Failed to remove participant',
      code: ERROR_CODES.INTERNAL_ERROR
    });
  }
};
