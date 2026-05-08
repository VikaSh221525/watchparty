import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisReady } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Normalize IP for use as a rate limit key.
 * express-rate-limit v8 requires ipKeyGenerator for correct IPv6 handling.
 * Without it, raw IPv6 addresses (e.g. "::ffff:127.0.0.1") can cause
 * validation errors or inconsistent keying.
 *
 * @param {import('express').Request} req
 * @returns {string} normalized IP string safe for use as a Redis key
 */
const normalizeIp = (req) => ipKeyGenerator(req);

/**
 * Build a rate limiter - uses Redis store if available, memory store as fallback
 */
const buildLimiter = ({ windowMs, max, message, keyPrefix }) => {
  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Key by userId if authenticated, else by normalized IP
      const userId = req.auth?.()?.userId ?? null;
      return userId
        ? `${keyPrefix}:${userId}`
        : `${keyPrefix}:${normalizeIp(req)}`;
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        keyPrefix,
        ip: req.ip,
        path: req.path
      });
      res.status(429).json({
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED'
        }
      });
    }
  };

  // Use Redis store if available
  if (isRedisReady()) {
    try {
      options.store = new RedisStore({
        sendCommand: (...args) => getRedisClient().call(...args),
        prefix: keyPrefix
      });
      logger.debug('Rate limiter using Redis store', { keyPrefix });
    } catch (error) {
      logger.warn('Failed to create Redis rate limit store - using memory', {
        error: error.message
      });
    }
  }

  return rateLimit(options);
};

/**
 * Room creation: max 5 rooms per hour per user
 */
export const roomCreationLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many rooms created. You can create up to 5 rooms per hour.',
  keyPrefix: 'rl:room_create'
});

/**
 * Chat messages: max 30 messages per minute per user
 * Used in socket handler (not Express middleware)
 */
const chatLimiterMap = new Map(); // In-memory fallback for socket rate limiting

export const checkChatRateLimit = async (userId) => {
  const redis = getRedisClient();
  const key = `rl:chat:${userId}`;
  const max = 30;
  const windowSec = 60;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }
      return count <= max;
    } catch (error) {
      logger.warn('Redis chat rate limit error - allowing request', {
        error: error.message
      });
      return true; // Fail open
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = chatLimiterMap.get(userId) || { count: 0, resetAt: now + windowSec * 1000 };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowSec * 1000;
  }

  entry.count++;
  chatLimiterMap.set(userId, entry);
  return entry.count <= max;
};

/**
 * Seek events: max 20 seeks per minute per user
 * Used in socket handler
 */
const seekLimiterMap = new Map();

export const checkSeekRateLimit = async (userId) => {
  const redis = getRedisClient();
  const key = `rl:seek:${userId}`;
  const max = 20;
  const windowSec = 60;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }
      return count <= max;
    } catch (error) {
      logger.warn('Redis seek rate limit error - allowing request', {
        error: error.message
      });
      return true; // Fail open
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = seekLimiterMap.get(userId) || { count: 0, resetAt: now + windowSec * 1000 };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowSec * 1000;
  }

  entry.count++;
  seekLimiterMap.set(userId, entry);
  return entry.count <= max;
};
