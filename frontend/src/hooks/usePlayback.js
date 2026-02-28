import { useEffect } from 'react';
import { useRoomStore } from '../stores/roomStore';
import socketService from '../services/socketService';
import { SERVER_EVENTS } from '../utils/constants';
import { useSocket } from './useSocket';

/**
 * Custom hook to manage playback state synchronization
 * @param {string} roomCode - The room code
 * @returns {Object} Playback control functions
 */
export const usePlayback = (roomCode) => {
  const { isConnected } = useSocket();
  const { updatePlaybackState, updateCurrentVideo } = useRoomStore();

  useEffect(() => {
    if (!roomCode || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Play event
    const handlePlay = (data) => {
      console.log('PLAY event received:', data);
      updatePlaybackState({ isPlaying: true, timestamp: data.timestamp });
    };

    // Pause event
    const handlePause = (data) => {
      console.log('PAUSE event received:', data);
      updatePlaybackState({ isPlaying: false, timestamp: data.timestamp });
    };

    // Seek event
    const handleSeek = (data) => {
      console.log('SEEK event received:', data);
      updatePlaybackState({ timestamp: data.timestamp });
    };

    // Change video event
    const handleChangeVideo = (data) => {
      console.log('CHANGE_VIDEO event received:', data);
      updateCurrentVideo({ videoId: data.videoId, title: data.title });
    };

    // Sync state (for playback state)
    const handleSyncState = (data) => {
      console.log('SYNC_STATE event received (playback):', data);
      if (data.currentVideo) {
        updateCurrentVideo(data.currentVideo);
      }
      if (data.playbackState) {
        updatePlaybackState(data.playbackState);
      }
    };

    // Error event
    const handleError = (error) => {
      console.error('Socket error in playback:', error);
    };

    // Register event listeners directly on socket
    socket.on(SERVER_EVENTS.PLAY, handlePlay);
    socket.on(SERVER_EVENTS.PAUSE, handlePause);
    socket.on(SERVER_EVENTS.SEEK, handleSeek);
    socket.on(SERVER_EVENTS.CHANGE_VIDEO, handleChangeVideo);
    socket.on(SERVER_EVENTS.SYNC_STATE, handleSyncState);
    socket.on(SERVER_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SERVER_EVENTS.PLAY, handlePlay);
      socket.off(SERVER_EVENTS.PAUSE, handlePause);
      socket.off(SERVER_EVENTS.SEEK, handleSeek);
      socket.off(SERVER_EVENTS.CHANGE_VIDEO, handleChangeVideo);
      socket.off(SERVER_EVENTS.SYNC_STATE, handleSyncState);
      socket.off(SERVER_EVENTS.ERROR, handleError);
    };
  }, [roomCode, isConnected]);

  const play = (timestamp) => {
    socketService.play(roomCode, timestamp);
  };

  const pause = (timestamp) => {
    socketService.pause(roomCode, timestamp);
  };

  const seek = (timestamp) => {
    socketService.seek(roomCode, timestamp);
  };

  const changeVideo = (youtubeUrl) => {
    socketService.changeVideo(roomCode, youtubeUrl);
  };

  return {
    play,
    pause,
    seek,
    changeVideo
  };
};
