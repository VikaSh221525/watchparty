import Room from '../../models/Room.js';
import { SERVER_EVENTS, ERROR_CODES, ROLES } from '../../utils/constants.js';
import { extractVideoId } from '../../utils/youtubeParser.js';
import { validateYouTubeUrl, validateTimestamp } from '../../middleware/validation.js';
import { getCachedRoom, setCachedRoom, invalidateRoomCache } from '../../utils/roomCache.js';
import { checkSeekRateLimit } from '../../middleware/rateLimiter.js';
import { logger } from '../../utils/logger.js';

/**
 * Check if user has playback control permissions (host or moderator)
 */
const hasPlaybackControl = (room, userId) => {
  const participant = room.participants.find(p => p.userId === userId);
  return participant && (participant.role === ROLES.HOST || participant.role === ROLES.MODERATOR);
};

/**
 * Get room from cache or MongoDB.
 * Returns a plain object (when cache hits) or a Mongoose document (on miss).
 * Use this for READ-ONLY checks (permission guards).
 * For WRITES always use Room.findOne() to get a Mongoose document with .save().
 */
const getRoom = async (roomCode) => {
  const cached = await getCachedRoom(roomCode);
  if (cached) return cached;
  return await Room.findOne({ roomCode });
};

/**
 * Handle play event
 */
export const handlePlay = async (socket, io, data) => {
  try {
    const { roomCode, timestamp } = data;
    const userId = socket.data.userId;

    const timestampValidation = validateTimestamp(timestamp);
    if (!timestampValidation.valid) {
      socket.emit(SERVER_EVENTS.ERROR, timestampValidation.error);
      return;
    }

    // Fast permission pre-check using cache (avoids MongoDB round-trip on rejection)
    const cachedRoom = await getRoom(roomCode);
    if (!cachedRoom) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    if (!hasPlaybackControl(cachedRoom, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Insufficient permissions to control playback',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Permission passed — fetch Mongoose document for the write
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    room.playbackState.isPlaying = true;
    room.playbackState.timestamp = timestamp;
    room.playbackState.lastUpdated = Date.now();
    room.lastActivityAt = Date.now();
    await room.save();

    // Refresh cache with updated playback state
    await setCachedRoom(roomCode, room);

    io.to(roomCode).emit(SERVER_EVENTS.PLAY, { timestamp });

    logger.info('Play event', { roomCode, userId, timestamp });
  } catch (error) {
    logger.error('Error in handlePlay', { error: error.message, socketId: socket.id });
    socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to play video', code: ERROR_CODES.INTERNAL_ERROR });
  }
};

/**
 * Handle pause event
 */
export const handlePause = async (socket, io, data) => {
  try {
    const { roomCode, timestamp } = data;
    const userId = socket.data.userId;

    const timestampValidation = validateTimestamp(timestamp);
    if (!timestampValidation.valid) {
      socket.emit(SERVER_EVENTS.ERROR, timestampValidation.error);
      return;
    }

    // Fast permission pre-check using cache (avoids MongoDB round-trip on rejection)
    const cachedRoom = await getRoom(roomCode);
    if (!cachedRoom) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    if (!hasPlaybackControl(cachedRoom, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Insufficient permissions to control playback',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Permission passed — fetch Mongoose document for the write
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    room.playbackState.isPlaying = false;
    room.playbackState.timestamp = timestamp;
    room.playbackState.lastUpdated = Date.now();
    room.lastActivityAt = Date.now();

    await room.save();

    // Refresh cache with updated playback state
    await setCachedRoom(roomCode, room);

    io.to(roomCode).emit(SERVER_EVENTS.PAUSE, { timestamp });

    logger.info('Pause event', { roomCode, userId, timestamp });
  } catch (error) {
    logger.error('Error in handlePause', { error: error.message, socketId: socket.id });
    socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to pause video', code: ERROR_CODES.INTERNAL_ERROR });
  }
};

/**
 * Handle seek event
 */
export const handleSeek = async (socket, io, data) => {
  try {
    const { roomCode, timestamp } = data;
    const userId = socket.data.userId;

    // Rate limit seek events
    const allowed = await checkSeekRateLimit(userId);
    if (!allowed) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Too many seek requests. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
      return;
    }

    const timestampValidation = validateTimestamp(timestamp);
    if (!timestampValidation.valid) {
      socket.emit(SERVER_EVENTS.ERROR, timestampValidation.error);
      return;
    }

    // Fast permission pre-check using cache (avoids MongoDB round-trip on rejection)
    const cachedRoom = await getRoom(roomCode);
    if (!cachedRoom) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    if (!hasPlaybackControl(cachedRoom, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Insufficient permissions to control playback',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Permission passed — fetch Mongoose document for the write
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    room.playbackState.timestamp = timestamp;
    room.playbackState.lastUpdated = Date.now();
    room.lastActivityAt = Date.now();
    await room.save();

    // Update cache after save
    await setCachedRoom(roomCode, room);

    io.to(roomCode).emit(SERVER_EVENTS.SEEK, { timestamp });

    logger.info('Seek event', { roomCode, userId, timestamp });
  } catch (error) {
    logger.error('Error in handleSeek', { error: error.message, socketId: socket.id });
    socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to seek video', code: ERROR_CODES.INTERNAL_ERROR });
  }
};

/**
 * Handle change video event
 */
export const handleChangeVideo = async (socket, io, data) => {
  try {
    const { roomCode, youtubeUrl } = data;
    const userId = socket.data.userId;

    const urlValidation = validateYouTubeUrl(youtubeUrl);
    if (!urlValidation.valid) {
      socket.emit(SERVER_EVENTS.ERROR, urlValidation.error);
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Failed to extract video ID from URL',
        code: ERROR_CODES.INVALID_YOUTUBE_URL
      });
      return;
    }

    // Fast permission pre-check using cache (avoids MongoDB round-trip on rejection)
    const cachedRoom = await getRoom(roomCode);
    if (!cachedRoom) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }
    if (!hasPlaybackControl(cachedRoom, userId)) {
      socket.emit(SERVER_EVENTS.ERROR, {
        message: 'Insufficient permissions to change video',
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
      return;
    }

    // Permission passed — fetch Mongoose document for the write
    const room = await Room.findOne({ roomCode });
    if (!room) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found', code: ERROR_CODES.ROOM_NOT_FOUND });
      return;
    }

    room.currentVideo = {
      videoId,
      title: `YouTube Video ${videoId}`,
      loadedAt: Date.now()
    };
    room.playbackState.isPlaying = false;
    room.playbackState.timestamp = 0;
    room.playbackState.lastUpdated = Date.now();
    room.lastActivityAt = Date.now();
    await room.save();

    // Update cache after save
    await setCachedRoom(roomCode, room);

    // Send videoId + reset playback state so all clients start from 0:00
    io.to(roomCode).emit(SERVER_EVENTS.CHANGE_VIDEO, {
      videoId,
      title: room.currentVideo.title,
      playbackState: {
        isPlaying: false,
        timestamp: 0
      }
    });

    logger.info('Change video event', { roomCode, userId, videoId });
  } catch (error) {
    logger.error('Error in handleChangeVideo', { error: error.message, socketId: socket.id });
    socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to change video', code: ERROR_CODES.INTERNAL_ERROR });
  }
};
