import { ERROR_CODES, VALIDATION } from '../utils/constants.js';
import { isValidYouTubeUrl } from '../utils/youtubeParser.js';

/**
 * Validate room code format
 */
export const validateRoomCode = (req, res, next) => {
  const { roomCode } = req.params;

  if (!roomCode) {
    return res.status(400).json({
      error: {
        message: 'Room code is required',
        code: ERROR_CODES.INVALID_INPUT
      }
    });
  }

  if (!VALIDATION.ROOM_CODE_PATTERN.test(roomCode)) {
    return res.status(400).json({
      error: {
        message: 'Invalid room code format. Must be 6-10 alphanumeric characters',
        code: ERROR_CODES.INVALID_ROOM_CODE
      }
    });
  }

  next();
};

/**
 * Validate YouTube URL
 */
export const validateYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: {
        message: 'YouTube URL is required',
        code: ERROR_CODES.INVALID_INPUT
      }
    };
  }

  if (!isValidYouTubeUrl(url)) {
    return {
      valid: false,
      error: {
        message: 'Invalid YouTube URL',
        code: ERROR_CODES.INVALID_YOUTUBE_URL
      }
    };
  }

  return { valid: true };
};

/**
 * Validate chat message
 */
export const validateChatMessage = (content) => {
  if (!content || typeof content !== 'string') {
    return {
      valid: false,
      error: {
        message: 'Message content is required',
        code: ERROR_CODES.INVALID_INPUT
      }
    };
  }

  // Check if message is empty or only whitespace
  if (content.trim().length === 0) {
    return {
      valid: false,
      error: {
        message: 'Message cannot be empty',
        code: ERROR_CODES.MESSAGE_EMPTY
      }
    };
  }

  // Check message length
  if (content.length > VALIDATION.MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: {
        message: `Message exceeds maximum length of ${VALIDATION.MAX_MESSAGE_LENGTH} characters`,
        code: ERROR_CODES.MESSAGE_TOO_LONG
      }
    };
  }

  return { valid: true };
};

/**
 * Validate role value
 */
export const validateRole = (role) => {
  const validRoles = ['host', 'moderator', 'participant'];
  
  if (!role || !validRoles.includes(role)) {
    return {
      valid: false,
      error: {
        message: 'Invalid role. Must be one of: host, moderator, participant',
        code: ERROR_CODES.INVALID_ROLE
      }
    };
  }

  return { valid: true };
};

/**
 * Validate timestamp
 */
export const validateTimestamp = (timestamp) => {
  if (typeof timestamp !== 'number' || timestamp < 0 || isNaN(timestamp)) {
    return {
      valid: false,
      error: {
        message: 'Invalid timestamp. Must be a non-negative number',
        code: ERROR_CODES.INVALID_TIMESTAMP
      }
    };
  }

  return { valid: true };
};
