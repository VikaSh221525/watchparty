import { CLIENT_EVENTS } from '../utils/constants.js';
import { handleJoinRoom, handleLeaveRoom, handleDisconnect } from './handlers/roomHandlers.js';
import { handlePlay, handlePause, handleSeek, handleChangeVideo } from './handlers/playbackHandlers.js';
import { handleAssignRole, handleTransferHost, handleRemoveParticipant } from './handlers/roleHandlers.js';
import { handleSendMessage } from './handlers/chatHandlers.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize Socket.io event handlers
 */
export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info('Socket connected', {
      socketId: socket.id,
      userId: socket.data.userId,
      username: socket.data.username
    });

    // Room events
    socket.on(CLIENT_EVENTS.JOIN_ROOM, async (data) => {
      try {
        await handleJoinRoom(socket, io, data);
      } catch (error) {
        logger.error('Error handling join_room', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    socket.on(CLIENT_EVENTS.LEAVE_ROOM, async (data) => {
      try {
        await handleLeaveRoom(socket, io, data);
      } catch (error) {
        logger.error('Error handling leave_room', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    // Playback control events
    socket.on(CLIENT_EVENTS.PLAY, async (data) => {
      try {
        await handlePlay(socket, io, data);
      } catch (error) {
        logger.error('Error handling play', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    socket.on(CLIENT_EVENTS.PAUSE, async (data) => {
      try {
        await handlePause(socket, io, data);
      } catch (error) {
        logger.error('Error handling pause', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    socket.on(CLIENT_EVENTS.SEEK, async (data) => {
      try {
        await handleSeek(socket, io, data);
      } catch (error) {
        logger.error('Error handling seek', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    socket.on(CLIENT_EVENTS.CHANGE_VIDEO, async (data) => {
      try {
        await handleChangeVideo(socket, io, data);
      } catch (error) {
        logger.error('Error handling change_video', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    // Role management events
    socket.on(CLIENT_EVENTS.ASSIGN_ROLE, async (data) => {
      try {
        await handleAssignRole(socket, io, data);
      } catch (error) {
        logger.error('Error handling assign_role', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    socket.on(CLIENT_EVENTS.TRANSFER_HOST, async (data) => {
      try {
        await handleTransferHost(socket, io, data);
      } catch (error) {
        logger.error('Error handling transfer_host', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    socket.on(CLIENT_EVENTS.REMOVE_PARTICIPANT, async (data) => {
      try {
        await handleRemoveParticipant(socket, io, data);
      } catch (error) {
        logger.error('Error handling remove_participant', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    // Chat events
    socket.on(CLIENT_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        await handleSendMessage(socket, io, data);
      } catch (error) {
        logger.error('Error handling send_message', {
          error: error.message,
          socketId: socket.id
        });
      }
    });

    // Disconnect event
    socket.on('disconnect', async () => {
      try {
        await handleDisconnect(socket, io);
      } catch (error) {
        logger.error('Error handling disconnect', {
          error: error.message,
          socketId: socket.id
        });
      }
    });
  });

  logger.info('Socket.io event handlers initialized');
};
