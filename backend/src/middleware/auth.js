import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';
import { config } from '../config/env.js';
import { ERROR_CODES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

// Initialize Clerk middleware
export const initClerkMiddleware = clerkMiddleware({
  publishableKey: config.clerk.publishableKey,
  secretKey: config.clerk.secretKey
});

/**
 * Middleware to require authentication
 * Verifies Clerk token and attaches user info to req.auth
 */
export const requireAuth = (req, res, next) => {
  try {
    // Check if user is authenticated via Clerk
    if (!req.auth || !req.auth.userId) {
      logger.warn('Unauthorized access attempt', {
        path: req.path,
        method: req.method
      });
      
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: ERROR_CODES.AUTH_REQUIRED
        }
      });
    }

    // User is authenticated, proceed
    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      path: req.path
    });
    
    return res.status(401).json({
      error: {
        message: 'Invalid authentication token',
        code: ERROR_CODES.AUTH_INVALID
      }
    });
  }
};

/**
 * Get user info from Clerk auth
 * @param {Object} req - Express request object
 * @returns {Object} - User info { userId, sessionId }
 */
export const getUserFromAuth = (req) => {
  if (!req.auth) {
    return null;
  }

  return {
    userId: req.auth.userId,
    sessionId: req.auth.sessionId
  };
};
