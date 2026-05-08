import Room from '../models/Room.js';
import User from '../models/User.js';
import { generateRoomCode } from '../utils/roomCodeGenerator.js';
import { ERROR_CODES, ROLES } from '../utils/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new room
 */
export const createRoom = async (req, res, next) => {
  try {
    const userId = req.auth().userId;

    // Get user info from database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND);
    }

    // Generate unique room code
    let roomCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      roomCode = generateRoomCode();
      const existingRoom = await Room.findOne({ roomCode });
      if (!existingRoom) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new AppError('Failed to generate unique room code', 500, ERROR_CODES.INTERNAL_ERROR);
    }

    // Create room with host as first participant
    const room = new Room({
      roomCode,
      hostId: userId,
      participants: [{
        userId,
        username: user.username,
        role: ROLES.HOST
      }]
    });

    await room.save();

    logger.info('Room created', {
      roomCode,
      hostId: userId,
      username: user.username
    });

    res.status(201).json({
      roomCode: room.roomCode,
      shareableLink: room.shareableLink,
      hostId: room.hostId,
      createdAt: room.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room details
 */
export const getRoomDetails = async (req, res, next) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });
    if (!room) {
      throw new AppError('Room not found', 404, ERROR_CODES.ROOM_NOT_FOUND);
    }

    res.json({
      roomCode: room.roomCode,
      hostId: room.hostId,
      participants: room.participants,
      currentVideo: room.currentVideo,
      playbackState: room.playbackState
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a room
 */
export const joinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const userId = req.auth().userId;

    // Get user info
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND);
    }

    // Find room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      throw new AppError('Room not found', 404, ERROR_CODES.ROOM_NOT_FOUND);
    }

    // Check if user is already in the room
    const existingParticipant = room.participants.find(p => p.userId === userId);
    if (!existingParticipant) {
      // If room is empty, the first person to rejoin becomes the host
      const isEmptyRoom = room.participants.length === 0;
      const role = isEmptyRoom ? ROLES.HOST : ROLES.PARTICIPANT;

      if (isEmptyRoom) {
        room.hostId = userId;
      }

      room.participants.push({
        userId,
        username: user.username,
        role
      });

      room.lastActivityAt = Date.now();
      await room.save();

      logger.info('User joined room', {
        roomCode,
        userId,
        username: user.username,
        role
      });
    }

    res.json({
      roomCode: room.roomCode,
      hostId: room.hostId,
      participants: room.participants,
      currentVideo: room.currentVideo,
      playbackState: room.playbackState
    });
  } catch (error) {
    next(error);
  }
};
