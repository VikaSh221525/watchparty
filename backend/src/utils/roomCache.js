import { getRedisClient } from '../config/redis.js';
import { logger } from './logger.js';

const ROOM_TTL = 60 * 30; // 30 minutes in seconds
const ROOM_KEY_PREFIX = 'room:';

/**
 * Get room from Redis cache
 * @param {string} roomCode
 * @returns {Object|null} - Parsed room object or null on miss/error
 */
export const getCachedRoom = async (roomCode) => {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(`${ROOM_KEY_PREFIX}${roomCode}`);
    if (!cached) return null;

    logger.debug('Room cache HIT', { roomCode });
    return JSON.parse(cached);
  } catch (error) {
    logger.warn('Redis getCachedRoom error - falling back to MongoDB', {
      roomCode,
      error: error.message
    });
    return null;
  }
};

/**
 * Save room to Redis cache with 30 min TTL
 * @param {string} roomCode
 * @param {Object} roomData - Plain room object (not Mongoose doc)
 */
export const setCachedRoom = async (roomCode, roomData) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    // Convert Mongoose doc to plain object if needed
    const plainData = roomData.toObject ? roomData.toObject() : roomData;
    await redis.setex(
      `${ROOM_KEY_PREFIX}${roomCode}`,
      ROOM_TTL,
      JSON.stringify(plainData)
    );
    logger.debug('Room cached', { roomCode, ttl: ROOM_TTL });
  } catch (error) {
    logger.warn('Redis setCachedRoom error', {
      roomCode,
      error: error.message
    });
  }
};

/**
 * Invalidate room cache
 * @param {string} roomCode
 */
export const invalidateRoomCache = async (roomCode) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(`${ROOM_KEY_PREFIX}${roomCode}`);
    logger.debug('Room cache invalidated', { roomCode });
  } catch (error) {
    logger.warn('Redis invalidateRoomCache error', {
      roomCode,
      error: error.message
    });
  }
};
