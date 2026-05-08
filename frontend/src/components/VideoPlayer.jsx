import { useEffect, useRef, useState } from 'react';
import { useRoomStore } from '../stores/roomStore';
import { Loader2, AlertCircle, Video } from 'lucide-react';

const VideoPlayer = ({ onPlayerReady }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const mountedRef = useRef(true);  // guard against post-unmount setState/retries
  const [playerState, setPlayerState] = useState('loading');
  const [error, setError] = useState(null);
  const { currentVideo, playbackState } = useRoomStore();

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else if (window.YT && window.YT.Player) {
      // API already loaded, initialize directly
      initializePlayer();
    } else {
      // API is loading but not ready yet, wait for it
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      mountedRef.current = false;
      try {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      } catch (err) {
        // destroy() can throw if the iframe was already removed from the DOM
        // by a React reconciliation pass — swallow it silently
        console.warn('VideoPlayer cleanup error (safe to ignore):', err.message);
        playerRef.current = null;
      }
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const initializePlayer = () => {
    if (!containerRef.current) {
      // Retry after a short delay if container isn't ready yet,
      // but stop if the component was unmounted in the meantime
      setTimeout(() => {
        if (mountedRef.current) initializePlayer();
      }, 100);
      return;
    }

    if (playerRef.current) {
      // Prevent duplicate initialization
      return;
    }

    const initialVideoId = currentVideo?.videoId || '';

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: initialVideoId,
      playerVars: {
        autoplay: 0,
        controls: 0, // Disable YouTube controls for sync
        disablekb: 1, // Disable keyboard controls
        fs: 1, // Allow fullscreen
        modestbranding: 1, // Minimal YouTube branding
        rel: 0, // Don't show related videos
        iv_load_policy: 3 // Disable video annotations
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handlePlayerStateChange,
        onError: handlePlayerError
      }
    });
  };

  const handlePlayerReady = (event) => {
    setPlayerState('ready');
    if (onPlayerReady) {
      onPlayerReady(playerRef.current);
    }
  };

  const handlePlayerStateChange = (event) => {
    // Player state changes
  };

  const handlePlayerError = (event) => {
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not allowed to be played in embedded players',
      150: 'Video not allowed to be played in embedded players'
    };
    setError(errorMessages[event.data] || 'An error occurred');
    setPlayerState('error');
  };

  // Sync playback state
  useEffect(() => {
    if (!playerRef.current || playerState !== 'ready') return;

    try {
      if (playbackState.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (err) {
      console.error('Error syncing playback:', err);
    }
  }, [playbackState.isPlaying, playerState]);

  // Sync timestamp
  useEffect(() => {
    if (!playerRef.current || playerState !== 'ready') return;

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const drift = Math.abs(currentTime - playbackState.timestamp);
      
      // Resync if drift exceeds 2 seconds
      if (drift > 2) {
        playerRef.current.seekTo(playbackState.timestamp, true);
      }
    } catch (err) {
      console.error('Error syncing timestamp:', err);
    }
  }, [playbackState.timestamp, playerState]);

  // Load new video — always starts from 0:00
  // playbackState is already reset to { isPlaying: false, timestamp: 0 }
  // by the CHANGE_VIDEO handler in usePlayback before this effect runs
  useEffect(() => {
    if (!playerRef.current || playerState !== 'ready') return;
    if (!currentVideo?.videoId) return;

    try {
      playerRef.current.loadVideoById({
        videoId: currentVideo.videoId,
        startSeconds: playbackState.timestamp  // 0 for new video, correct ts for new joiners
      });

      // Pause immediately if room is paused
      if (!playbackState.isPlaying) {
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.pauseVideo();
          }
        }, 100);
      }

      setError(null);
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video');
    }
  }, [currentVideo?.videoId, playerState]);

  if (playerState === 'error') {
    return (
      <div className="w-full aspect-video bg-base-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Video Error</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentVideo?.videoId) {
    return (
      <div className="w-full aspect-video bg-base-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-2">No Video Selected</p>
          <p className="text-sm opacity-70">Host will load a video soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative">
      {playerState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}
      {/* YouTube IFrame API mounts into this div.
          The component-level key on <VideoPlayer> in Room.jsx ensures React
          fully remounts this entire component (and this div) when videoId changes,
          preventing stale iframe references from causing removeChild crashes. */}
      <div
        ref={containerRef}
        className="w-full h-full"
      />
      {/* Transparent overlay to prevent direct player interaction */}
      <div className="absolute inset-0 z-10" style={{ pointerEvents: 'auto' }} />
    </div>
  );
};

export default VideoPlayer;
