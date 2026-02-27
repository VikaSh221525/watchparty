import Message from '../models/Message.js';
import Room from '../models/Room.js';
import { ERROR_CODES, MESSAGE_TYPES } from '../utils/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Create a user message
 */
export const createMessage = async (roomId, roomCode, userId, username, content) => {
  try {
    const message = new Message({
      roomId,
      roomCode,
      userId,
      username,
      content,
      type: MESSAGE_TYPES.USER
    });

    await message.save();

    logger.info('Message created', {
      roomCode,
      userId,
      username,
      messageLength: content.length
    });

    return message;
  } catch (error) {
    logger.error('Failed to create message', {
      error: error.message,
      roomCode,
      userId
    });
    throw error;
  }
};

/**
 * Create a system message
 */
export const createSystemMessage = async (roomId, roomCode, content) => {
  try {
    const message = new Message({
      roomId,
      roomCode,
      content,
      type: MESSAGE_TYPES.SYSTEM
    });

    await message.save();

    logger.info('System message created', {
      roomCode,
      content
    });

    return message;
  } catch (error) {
    logger.error('Failed to create system message', {
      error: error.message,
      roomCode
    });
    throw error;
  }
};

/**
 * Get message history for a room
 */
export const getMessageHistory = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const before = req.query.before ? new Date(req.query.before) : new Date();

    // Verify room exists
    const room = await Room.findOne({ roomCode });
    if (!room) {
      throw new AppError('Room not found', 404, ERROR_CODES.ROOM_NOT_FOUND);
    }

    // Fetch messages
    const messages = await Message.find({
      roomCode,
      timestamp: { $lt: before }
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      messages: messages.map(msg => ({
        id: msg._id,
        userId: msg.userId,
        username: msg.username,
        content: msg.content,
        type: msg.type,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
};
