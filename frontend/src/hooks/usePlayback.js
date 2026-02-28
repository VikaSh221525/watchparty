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
      updatePlaybackState({ isPlaying: true, timestamp: data.timestamp });
    };

    // Pause event
    const handlePause = (data) => {
      updatePlaybackState({ isPlaying: false, timestamp: data.timestamp });
    };

    // Seek event
    const handleSeek = (data) => {
      updatePlaybackState((prev) => ({ ...prev, timestamp: data.timestamp }));
    };

    // Change video event
    const handleChangeVideo = (data) => {
      updateCurrentVideo({ videoId: data.videoId, title: data.title });
    };

    // Sync state (for playback state)
    const handleSyncState = (data) => {
      if (data.currentVideo) {
        updateCurrentVideo(data.currentVideo);
      }
      if (data.playbackState) {
        updatePlaybackState(data.playbackState);
      }
    };

    // Register event listeners
    socketService.on(SERVER_EVENTS.PLAY, handlePlay);
    socketService.on(SERVER_EVENTS.PAUSE, handlePause);
    socketService.on(SERVER_EVENTS.SEEK, handleSeek);
    socketService.on(SERVER_EVENTS.CHANGE_VIDEO, handleChangeVideo);
    socketService.on(SERVER_EVENTS.SYNC_STATE, handleSyncState);

    return () => {
      socketService.off(SERVER_EVENTS.PLAY, handlePlay);
      socketService.off(SERVER_EVENTS.PAUSE, handlePause);
      socketService.off(SERVER_EVENTS.SEEK, handleSeek);
      socketService.off(SERVER_EVENTS.CHANGE_VIDEO, handleChangeVideo);
      socketService.off(SERVER_EVENTS.SYNC_STATE, handleSyncState);
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
