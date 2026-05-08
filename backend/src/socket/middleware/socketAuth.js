import { verifyToken } from '@clerk/express';
import { config } from '../../config/env.js';
import User from '../../models/User.js';
import { getRedisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';

const USER_TTL = 60 * 60; // 1 hour in seconds
const USER_KEY_PREFIX = 'user:';

/**
 * Get user from Redis cache
 */
const getCachedUser = async (clerkId) => {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(`${USER_KEY_PREFIX}${clerkId}`);
    if (!cached) return null;
    logger.debug('User cache HIT', { clerkId });
    return JSON.parse(cached);
  } catch (error) {
    logger.warn('Redis getCachedUser error', { error: error.message });
    return null;
  }
};

/**
 * Save user to Redis cache with 1 hour TTL
 */
const setCachedUser = async (clerkId, userData) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const plainData = userData.toObject ? userData.toObject() : userData;
    await redis.setex(
      `${USER_KEY_PREFIX}${clerkId}`,
      USER_TTL,
      JSON.stringify(plainData)
    );
    logger.debug('User cached', { clerkId });
  } catch (error) {
    logger.warn('Redis setCachedUser error', { error: error.message });
  }
};

/**
 * Socket.io authentication middleware
 * Verifies Clerk token from handshake and attaches user info to socket.data
 * Uses Redis cache to avoid MongoDB lookups on every connection
 */
export const authenticateSocket = async (socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn('Socket connection without token', { socketId: socket.id });
      return next(new Error('Authentication token required'));
    }

    // Verify token with Clerk
    try {
      const payload = await verifyToken(token, {
        secretKey: config.clerk.secretKey
      });

      if (!payload || !payload.sub) {
        return next(new Error('Invalid authentication token'));
      }

      const clerkId = payload.sub;

      // 1. Check Redis cache first
      let user = await getCachedUser(clerkId);

      // 2. Cache MISS → fetch from MongoDB and cache it
      if (!user) {
        logger.debug('User cache MISS - fetching from MongoDB', { clerkId });
        user = await User.findOne({ clerkId });

        if (!user) {
          logger.warn('Socket connection for non-existent user', {
            clerkId,
            socketId: socket.id
          });
          return next(new Error('User not found'));
        }

        // Store in Redis for future connections
        await setCachedUser(clerkId, user);
      }

      // Attach user info to socket
      socket.data.userId = user.clerkId;
      socket.data.username = user.username;
      socket.data.email = user.email;

      logger.info('Socket authenticated', {
        socketId: socket.id,
        userId: user.clerkId,
        username: user.username
      });

      next();
    } catch (error) {
      logger.error('Socket authentication error', {
        error: error.message,
        socketId: socket.id
      });
      return next(new Error('Authentication failed'));
    }
  } catch (error) {
    logger.error('Socket middleware error', {
      error: error.message,
      socketId: socket.id
    });
    return next(new Error('Authentication error'));
  }
};

/**
 * Invalidate user cache - called from webhookController on user.updated/deleted
 */
export const invalidateUserCache = async (clerkId) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(`${USER_KEY_PREFIX}${clerkId}`);
    logger.debug('User cache invalidated', { clerkId });
  } catch (error) {
    logger.warn('Redis invalidateUserCache error', { error: error.message });
  }
};
