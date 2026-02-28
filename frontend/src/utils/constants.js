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

// API Endpoints
export const API_ENDPOINTS = {
  CREATE_ROOM: '/rooms',
  GET_ROOM: (roomCode) => `/rooms/${roomCode}`,
  JOIN_ROOM: (roomCode) => `/rooms/${roomCode}/join`,
  GET_MESSAGES: (roomCode) => `/rooms/${roomCode}/messages`
};

// Sound files
export const SOUNDS = {
  JOIN: '/join_call_6a6a67d6bcc7a4e373ed40fdeff3930a.mp3',
  LEAVE: '/leave_call_bfab46cf473a2e5d474c1b71ccf843a1.mp3'
};

// Validation
export const VALIDATION = {
  MAX_MESSAGE_LENGTH: 500,
  ROOM_CODE_PATTERN: /^[A-Z0-9]{6,10}$/
};
