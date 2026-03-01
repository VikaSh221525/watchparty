import { useState } from 'react';
import { Play, Pause, Link as LinkIcon, Check, LogOut, RotateCcw, Rewind, FastForward } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useRoomStore } from '../stores/roomStore';
import { useUserStore } from '../stores/userStore';
import socketService from '../services/socketService';
import { ROLES } from '../utils/constants';

const RoomControls = ({ player, onLeaveRoom }) => {
  const navigate = useNavigate();
  const { roomCode, playbackState, participants } = useRoomStore();
  const { currentUser } = useUserStore();
  const [videoUrl, setVideoUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if current user can control playback
  const currentParticipant = participants.find(p => p.userId === currentUser?.clerkId);
  const canControl = currentParticipant && 
    (currentParticipant.role === ROLES.HOST || currentParticipant.role === ROLES.MODERATOR);

  const handlePlayPause = () => {
    if (!canControl) {
      console.log('Cannot control - not host/moderator');
      return;
    }

    console.log('Play/Pause clicked', {
      isPlaying: playbackState.isPlaying,
      player: player,
      roomCode: roomCode
    });

    try {
      const currentTime = player?.getCurrentTime ? player.getCurrentTime() : 0;
      console.log('Current time:', currentTime);
      
      if (playbackState.isPlaying) {
        console.log('Emitting PAUSE event');
        socketService.pause(roomCode, currentTime);
      } else {
        console.log('Emitting PLAY event');
        socketService.play(roomCode, currentTime);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      // Fallback to timestamp 0 if player isn't ready
      if (playbackState.isPlaying) {
        console.log('Fallback: Emitting PAUSE with timestamp 0');
        socketService.pause(roomCode, 0);
      } else {
        console.log('Fallback: Emitting PLAY with timestamp 0');
        socketService.play(roomCode, 0);
      }
    }
  };

  const handleRestart = () => {
    if (!canControl || !player) return;

    try {
      socketService.seek(roomCode, 0);
      console.log('Restarting video from beginning');
    } catch (error) {
      console.error('Error restarting video:', error);
    }
  };

  const handleSkipBackward = () => {
    if (!canControl || !player) return;

    try {
      const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      const newTime = Math.max(0, currentTime - 10); // Don't go below 0
      socketService.seek(roomCode, newTime);
      console.log('Skipping backward 10 seconds');
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const handleSkipForward = () => {
    if (!canControl || !player) return;

    try {
      const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      const duration = player.getDuration ? player.getDuration() : Infinity;
      const newTime = Math.min(duration, currentTime + 10); // Don't exceed video duration
      socketService.seek(roomCode, newTime);
      console.log('Skipping forward 10 seconds');
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const handleChangeVideo = (e) => {
    e.preventDefault();
    if (!videoUrl.trim() || !canControl) return;

    socketService.changeVideo(roomCode, videoUrl);
    setVideoUrl('');
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (confirm('Are you sure you want to leave the room?')) {
      if (onLeaveRoom) {
        onLeaveRoom();
      } else {
        socketService.leaveRoom(roomCode, currentUser?.clerkId);
        navigate('/');
      }
    }
  };

  return (
    <div className="bg-base-300 rounded-lg p-4 space-y-4">
      {/* Room Code */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-sm opacity-70 mb-1 block">Room Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              readOnly
              className="input input-bordered flex-1 font-mono"
            />
            <button
              onClick={handleCopyRoomCode}
              className="btn btn-square btn-primary"
              title="Copy room code"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <LinkIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Playback Controls - Only for Host/Moderator */}
      {canControl && (
        <>
          <div className="divider my-2"></div>
          
          {/* Play/Pause Button */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">Playback Control</label>
            <button
              onClick={handlePlayPause}
              className="btn btn-primary w-full gap-2"
            >
              {playbackState.isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </button>
          </div>

          {/* Seek Controls */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">Seek Controls</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleRestart}
                className="btn btn-outline btn-sm gap-1"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
                Start
              </button>
              <button
                onClick={handleSkipBackward}
                className="btn btn-outline btn-sm gap-1"
                title="Skip backward 10 seconds"
              >
                <Rewind className="w-4 h-4" />
                -10s
              </button>
              <button
                onClick={handleSkipForward}
                className="btn btn-outline btn-sm gap-1"
                title="Skip forward 10 seconds"
              >
                <FastForward className="w-4 h-4" />
                +10s
              </button>
            </div>
          </div>

          {/* Change Video */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">Change Video</label>
            <form onSubmit={handleChangeVideo} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste YouTube URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={!videoUrl.trim()}
              >
                Load
              </button>
            </form>
          </div>
        </>
      )}

      {/* Participant View Message */}
      {!canControl && (
        <div className="alert alert-info">
          <span className="text-sm">Only host and moderators can control playback</span>
        </div>
      )}

      {/* Leave Room Button */}
      <div className="divider my-2"></div>
      <button
        onClick={handleLeaveRoom}
        className="btn btn-error btn-outline w-full gap-2"
      >
        <LogOut className="w-5 h-5" />
        Leave Room
      </button>
    </div>
  );
};

export default RoomControls;
