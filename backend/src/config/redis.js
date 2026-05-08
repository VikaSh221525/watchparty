import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let redisClient = null;
let isRedisAvailable = false;

/**
 * Build Redis connection config from environment variables.
 *
 * Priority:
 *  1. Individual vars: REDIS_HOST + REDIS_PORT + REDIS_PASSWORD  (cloud providers like Upstash, Redis Cloud)
 *  2. REDIS_URL  (local dev: redis://localhost:6379)
 *
 * Cloud Redis (TLS required for most providers):
 *  - REDIS_HOST  e.g. redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com
 *  - REDIS_PORT  e.g. 12345
 *  - REDIS_PASSWORD  e.g. your-secret-password
 */
const buildRedisConfig = () => {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const password = process.env.REDIS_PASSWORD;

  if (host && port && password) {
    // Cloud Redis with individual credentials
    // TLS is required by most cloud providers (Redis Cloud, Upstash, etc.)
    // Set REDIS_TLS=false in .env only if your provider doesn't require it
    const useTls = process.env.REDIS_TLS !== 'false';
    return {
      host,
      port: parseInt(port, 10),
      password,
      ...(useTls && { tls: {} }),
      maxRetriesPerRequest: 0,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy: () => null
    };
  }

  // Fallback to REDIS_URL (local dev)
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return {
    maxRetriesPerRequest: 0,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy: () => null,
    // ioredis accepts a URL string directly when passed as first arg,
    // but we return an object here so we need to handle URL separately
    _url: redisUrl
  };
};

/**
 * Initialize Redis client.
 * App continues to work if Redis is unavailable — falls back to MongoDB.
 */
export const connectRedis = async () => {
  const config = buildRedisConfig();

  try {
    // If URL-based config, pass URL as first arg; otherwise pass options object
    if (config._url) {
      const { _url, ...options } = config;
      redisClient = new Redis(_url, options);
    } else {
      redisClient = new Redis(config);
    }

    let unavailableLogged = false;

    redisClient.on('ready', () => {
      isRedisAvailable = true;
      unavailableLogged = false;
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      isRedisAvailable = false;
      if (!unavailableLogged) {
        unavailableLogged = true;
        logger.warn('⚠️  Redis unavailable - falling back to MongoDB', {
          error: error.message
        });
      }
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
    });

    await redisClient.connect();
  } catch (error) {
    isRedisAvailable = false;
    logger.warn('⚠️  Redis unavailable - app will use MongoDB directly', {
      error: error.message
    });
  }
};

/**
 * Get Redis client - returns null if unavailable
 */
export const getRedisClient = () => {
  if (!isRedisAvailable || !redisClient) return null;
  return redisClient;
};

/**
 * Check if Redis is available
 */
export const isRedisReady = () => isRedisAvailable;

export default redisClient;
