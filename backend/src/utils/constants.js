// User Roles
export const ROLES = {
  HOST: 'host',
  MODERATOR: 'moderator',
  PARTICIPANT: 'participant'
};

// Socket.io Event Names - Client to Server
export const CLIENT_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  CHANGE_VIDEO: 'change_video',
  ASSIGN_ROLE: 'assign_role',
  TRANSFER_HOST: 'transfer_host',
  REMOVE_PARTICIPANT: 'remove_participant',
  SEND_MESSAGE: 'send_message'
};

// Socket.io Event Names - Server to Client
export const SERVER_EVENTS = {
  SYNC_STATE: 'sync_state',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  CHANGE_VIDEO: 'change_video',
  ROLE_ASSIGNED: 'role_assigned',
  HOST_TRANSFERRED: 'host_transferred',
  PARTICIPANT_REMOVED: 'participant_removed',
  FORCE_DISCONNECT: 'force_disconnect',
  NEW_MESSAGE: 'new_message',
  ERROR: 'error'
};

// Error Codes
export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  
  // Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_ROOM_CODE: 'INVALID_ROOM_CODE',
  INVALID_YOUTUBE_URL: 'INVALID_YOUTUBE_URL',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  MESSAGE_EMPTY: 'MESSAGE_EMPTY',
  INVALID_ROLE: 'INVALID_ROLE',
  INVALID_TIMESTAMP: 'INVALID_TIMESTAMP',
  
  // Not Found
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PARTICIPANT_NOT_FOUND: 'PARTICIPANT_NOT_FOUND',
  
  // Room State
  ROOM_INACTIVE: 'ROOM_INACTIVE',
  
  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};

// Message Types
export const MESSAGE_TYPES = {
  USER: 'user',
  SYSTEM: 'system'
};

// Validation Constants
export const VALIDATION = {
  MAX_MESSAGE_LENGTH: 500,
  ROOM_CODE_MIN_LENGTH: 6,
  ROOM_CODE_MAX_LENGTH: 10,
  ROOM_CODE_PATTERN: /^[A-Z0-9]{6,10}$/,
  YOUTUBE_VIDEO_ID_LENGTH: 11
};
