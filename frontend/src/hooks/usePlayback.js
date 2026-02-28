import { useEffect } from 'react';
import { useRoomStore } from '../stores/roomStore';
import socketService from '../services/socketService';
import { SERVER_EVENTS } from '../utils/constants';

/**
 * Custom hook to manage playback state synchronization
 * @param {string} roomCode - The room code
 * @returns {Object} Playback control functions
 */
export const usePlayback = (roomCode) => {
  const { updatePlaybackState, updateCurrentVideo } = useRoomStore();

  useEffect(() => {
    if (!roomCode) return;

    // Play event
    const handlePlay = (data) => {
      console.log('Received PLAY event', data);
      updatePlaybackState({ isPlaying: true, timestamp: data.timestamp });
    };

    // Pause event
    const handlePause = (data) => {
      console.log('Received PAUSE event', data);
      updatePlaybackState({ isPlaying: false, timestamp: data.timestamp });
    };

    // Seek event
    const handleSeek = (data) => {
      console.log('Received SEEK event', data);
      updatePlaybackState({ timestamp: data.timestamp });
    };

    // Change video event
    const handleChangeVideo = (data) => {
      console.log('Received CHANGE_VIDEO event', data);
      updateCurrentVideo({ videoId: data.videoId, title: data.title });
    };

    // Sync state (for playback state)
    const handleSyncState = (data) => {
      console.log('Received SYNC_STATE event', data);
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

    // Register event listeners
    socketService.on(SERVER_EVENTS.PLAY, handlePlay);
    socketService.on(SERVER_EVENTS.PAUSE, handlePause);
    socketService.on(SERVER_EVENTS.SEEK, handleSeek);
    socketService.on(SERVER_EVENTS.CHANGE_VIDEO, handleChangeVideo);
    socketService.on(SERVER_EVENTS.SYNC_STATE, handleSyncState);
    socketService.on(SERVER_EVENTS.ERROR, handleError);

    return () => {
      socketService.off(SERVER_EVENTS.PLAY, handlePlay);
      socketService.off(SERVER_EVENTS.PAUSE, handlePause);
      socketService.off(SERVER_EVENTS.SEEK, handleSeek);
      socketService.off(SERVER_EVENTS.CHANGE_VIDEO, handleChangeVideo);
      socketService.off(SERVER_EVENTS.SYNC_STATE, handleSyncState);
      socketService.off(SERVER_EVENTS.ERROR, handleError);
    };
  }, [roomCode, updatePlaybackState, updateCurrentVideo]);

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
