import { clerkClient } from '@clerk/express';
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
      const session = await clerkClient.sessions.verifySession(token);
      
      if (!session || !session.userId) {
        return next(new Error('Invalid authentication token'));
      }

      // Get user from database
      const user = await User.findOne({ clerkId: session.userId });
      if (!user) {
        logger.warn('Socket connection for non-existent user', {
          userId: session.userId,
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
