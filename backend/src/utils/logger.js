/**
 * Structured logging utility
 * Log levels: ERROR, WARN, INFO, DEBUG
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const formatLog = (level, message, context = {}) => {
  return {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...context
  };
};

export const logger = {
  error: (message, context = {}) => {
    const log = formatLog(LOG_LEVELS.ERROR, message, context);
    console.error(JSON.stringify(log));
  },

  warn: (message, context = {}) => {
    const log = formatLog(LOG_LEVELS.WARN, message, context);
    console.warn(JSON.stringify(log));
  },

  info: (message, context = {}) => {
    const log = formatLog(LOG_LEVELS.INFO, message, context);
    console.log(JSON.stringify(log));
  },

  debug: (message, context = {}) => {
    // Only log debug in development
    if (process.env.NODE_ENV !== 'production') {
      const log = formatLog(LOG_LEVELS.DEBUG, message, context);
      console.log(JSON.stringify(log));
    }
  }
};
