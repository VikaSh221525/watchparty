import { verifyToken } from '@clerk/express';
import { config } from '../../config/env.js';
import User from '../../models/User.js';
import { logger } from '../../utils/logger.js';

/**
 * Socket.io authentication middleware
 * Verifies Clerk token from handshake and attaches user info to socket.data
 */
export const authenticateSocket = async (socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn('Socket connection without token', {
        socketId: socket.id
      });
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

      const userId = payload.sub;

      // Get user from database
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        logger.warn('Socket connection for non-existent user', {
          userId,
          socketId: socket.id
        });
        return next(new Error('User not found'));
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
