import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import { Video, Users, ArrowRight, Loader2, Play, MessageSquare, Shield } from 'lucide-react';
import { createRoom, joinRoom } from '../services/roomService';
import { VALIDATION } from '../utils/constants';
import Navbar from '../components/Navbar';

const Landing = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleCreateRoom = async () => {
    if (!isSignedIn) {
      setError('Please sign in to create a room');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createRoom();
      navigate(`/room/${data.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError('Please sign in to join a room');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (!VALIDATION.ROOM_CODE_PATTERN.test(roomCode.toUpperCase())) {
      setError('Invalid room code format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(roomCode.toUpperCase());
      navigate(`/room/${roomCode.toUpperCase()}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="/landingpageImg.png"
            alt="Watch Together"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-b from-base-200/50 via-base-200/80 to-base-200"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up">
            Watch Together, <br />
            <span className="text-primary">Anywhere</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-80 max-w-3xl mx-auto animate-slide-up animation-delay-100">
            Synchronized YouTube watch parties for you and your friends. Real-time playback, chat, and shared control.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animation-delay-200">
            <button
              onClick={handleCreateRoom}
              disabled={loading || !isSignedIn}
              className="btn btn-primary btn-lg gap-3 min-w-[200px] shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  Create Room
                </>
              )}
            </button>

            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                disabled={!isSignedIn}
                className="btn btn-outline btn-lg gap-3 min-w-[200px] shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Users className="w-6 h-6" />
                Join a Room
              </button>
            ) : (
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="input input-bordered input-lg w-40"
                  maxLength={10}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !roomCode.trim()}
                  className="btn btn-primary btn-lg gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Join
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error max-w-md mx-auto mt-6 animate-shake">
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Prompt */}
          {!isSignedIn && (
            <div className="bg-base max-w-md mx-auto mt-6">
              <span>Please sign in to create or join a room</span>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-center opacity-70 mb-12">Professional features for the best watch party experience.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Synced Playback */}
          <div className="card bg-base-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="card-body items-center text-center">
              <div className="p-4 bg-primary/20 rounded-full mb-4">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <h3 className="card-title">Synced Playback</h3>
              <p className="opacity-70">
                All participants see the same video state. When one person pauses, seeks, or changes the video, everyone sees the same action in real-time.
              </p>
            </div>
          </div>

          {/* Real-time Chat */}
          <div className="card bg-base-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="card-body items-center text-center">
              <div className="p-4 bg-secondary/20 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="card-title">Real-time Chat</h3>
              <p className="opacity-70">
                React instantly with your friends. Share your thoughts, jokes, and reactions as you watch together with our live chat feature.
              </p>
            </div>
          </div>

          {/* Role Management */}
          <div className="card bg-base-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="card-body items-center text-center">
              <div className="p-4 bg-accent/20 rounded-full mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="card-title">Role Management</h3>
              <p className="opacity-70">
                Host controls, moderator privileges, and participant roles. Assign roles, manage permissions, and keep your watch party organized.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <div className="grid grid-flow-col gap-4">
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Privacy</a>
          <a className="link link-hover">Terms</a>
        </div>
        <div>
          <p className="opacity-70">© 2024 Streamify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
