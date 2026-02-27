import { ERROR_CODES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 * Catches all errors and formats consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error with context
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.auth?.userId,
    roomCode: req.params?.roomCode
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    error: {
      message: 'Internal server error',
      code: ERROR_CODES.INTERNAL_ERROR
    }
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    errorResponse = {
      error: {
        message: err.message,
        code: ERROR_CODES.INVALID_INPUT,
        details: err.errors
      }
    };
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    errorResponse = {
      error: {
        message: 'Invalid data format',
        code: ERROR_CODES.INVALID_INPUT
      }
    };
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorResponse = {
      error: {
        message: 'Resource already exists',
        code: ERROR_CODES.INVALID_INPUT,
        details: err.keyValue
      }
    };
  } else if (err.statusCode) {
    // Custom error with status code
    statusCode = err.statusCode;
    errorResponse = {
      error: {
        message: err.message,
        code: err.code || ERROR_CODES.INTERNAL_ERROR
      }
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: ERROR_CODES.INTERNAL_ERROR
    }
  });
};
