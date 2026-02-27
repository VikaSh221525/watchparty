import Room from '../../models/Room.js';
import { SERVER_EVENTS, ERROR_CODES } from '../../utils/constants.js';
import { validateChatMessage } from '../../middleware/validation.js';
import { createMessage } from '../../controllers/messageController.js';
import { logger } from '../../utils/logger.js';

/**
 * Handle send message event
 */
export const handleSendMessage = async (socket, io, data) => {
  try {
    const { roomCode, content } = data;
    const userId = socket.data.userId;
    const username = socket.data.username;

    // Validate message
    const messageValidation = validateChatMessage(content);
    if (!messageValidation.valid) {
      socket.emit(SERVER_EVENTS.ERROR, messageValidation.error);
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

    // Create message in database
    const message = await createMessage(room._id, roomCode, userId, username, content);

    // Broadcast message to all participants
    io.to(roomCode).emit(SERVER_EVENTS.NEW_MESSAGE, {
      id: message._id,
      userId: message.userId,
      username: message.username,
      content: message.content,
      type: message.type,
      timestamp: message.timestamp
    });

    logger.info('Message sent', {
      roomCode,
      userId,
      username,
      messageLength: content.length
    });
  } catch (error) {
    logger.error('Error in handleSendMessage', {
      error: error.message,
      socketId: socket.id
    });
    socket.emit(SERVER_EVENTS.ERROR, {
      message: 'Failed to send message',
      code: ERROR_CODES.INTERNAL_ERROR
    });
  }
};
