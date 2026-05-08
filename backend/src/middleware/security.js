import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisReady } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Helmet - sets secure HTTP response headers
 *
 * Headers it sets:
 * - Content-Security-Policy     : restricts sources for scripts, styles, etc.
 * - X-Content-Type-Options      : prevents MIME-type sniffing
 * - X-Frame-Options             : prevents clickjacking via iframes
 * - X-XSS-Protection            : legacy XSS filter for older browsers
 * - Strict-Transport-Security   : forces HTTPS
 * - Referrer-Policy             : controls referrer header leakage
 */
export const helmetMiddleware = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    // Prevent MIME sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Force HTTPS (only in production)
    hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    // Hide X-Powered-By: Express header
    hidePoweredBy: true,
    // XSS filter
    xssFilter: true,
    // Referrer policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * HPP - HTTP Parameter Pollution protection
 *
 * Prevents attacks like:
 * GET /api/rooms?roomCode=ABC&roomCode=XYZ&roomCode=MALICIOUS
 *
 * Without HPP: req.query.roomCode = ['ABC', 'XYZ', 'MALICIOUS'] (array)
 * With HPP:    req.query.roomCode = 'MALICIOUS' (last value, safe)
 */
export const hppMiddleware = hpp();

/**
 * MongoDB Sanitization - prevents NoSQL injection
 *
 * Replaces keys containing $ or . with _ in req.body, req.params, and
 * req.query VALUES (without reassigning req.query itself).
 *
 * express-mongo-sanitize is NOT used here because it does `req.query = ...`
 * which throws in Express 5 where req.query is a getter-only property.
 *
 * Prevents attacks like:
 * POST /api/rooms/join
 * { "roomCode": { "$gt": "" } }  ← would match ALL rooms without sanitization
 *
 * With sanitize: the "$gt" key is replaced with "_gt" → safe query
 */

/**
 * Recursively sanitize an object in-place.
 * Keys containing $ or . are replaced with _.
 * @param {*} obj
 * @param {string} path - dot-path for logging
 * @param {import('express').Request} req
 */
const sanitizeInPlace = (obj, path, req) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

  for (const key of Object.keys(obj)) {
    if (/[$.]/u.test(key)) {
      const safeKey = key.replace(/[$.]/gu, '_');
      obj[safeKey] = obj[key];
      delete obj[key];
      logger.warn('NoSQL injection attempt detected and sanitized', {
        path: req.path,
        method: req.method,
        field: `${path}.${key}`,
        ip: req.ip
      });
      // Recurse into the renamed key
      sanitizeInPlace(obj[safeKey], `${path}.${safeKey}`, req);
    } else {
      sanitizeInPlace(obj[key], `${path}.${key}`, req);
    }
  }
};

export const mongoSanitizeMiddleware = (req, _res, next) => {
  // Sanitize body and params in-place (both are writable in Express 5)
  if (req.body)   sanitizeInPlace(req.body,   'body',   req);
  if (req.params) sanitizeInPlace(req.params, 'params', req);

  // req.query is a getter-only property in Express 5 — we cannot replace it.
  // Instead, sanitize the values of each query parameter in-place.
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (val && typeof val === 'object') {
        sanitizeInPlace(val, `query.${key}`, req);
      }
      // Primitive query string values (strings) cannot carry $ operators
      // because they're already coerced to strings by the query parser.
    }
  }

  next();
};

/**
 * Global rate limiter - applies to ALL routes
 * Acts as a baseline DDoS protection layer
 * More specific limiters (room creation, chat) are applied on top
 *
 * Limit: 100 requests per 15 minutes per IP
 */
export const globalRateLimiter = (() => {
    const options = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        // Explicit IPv6-safe key generator
        keyGenerator: (req) => ipKeyGenerator(req),
        message: {
            error: {
                message: 'Too many requests from this IP. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED'
            }
        },
        handler: (req, res, next, options) => {
            logger.warn('Global rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                method: req.method
            });
            res.status(429).json(options.message);
        },
        // Skip rate limiting for health checks
        skip: (req) => req.path === '/health'
    };

    // Use Redis store if available
    if (isRedisReady()) {
        try {
            options.store = new RedisStore({
                sendCommand: (...args) => getRedisClient().call(...args),
                prefix: 'rl:global'
            });
        } catch (error) {
            logger.warn('Failed to create Redis store for global rate limiter', {
                error: error.message
            });
        }
    }

    return rateLimit(options);
})();
