import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import { Loader2, Users, MessageSquare } from 'lucide-react';
import { useRoomStore } from '../stores/roomStore';
import { useUserStore } from '../stores/userStore';
import { useChatStore } from '../stores/chatStore';
import { joinRoom as joinRoomAPI } from '../services/roomService';
import socketService from '../services/socketService';
import { useSocket } from '../hooks/useSocket';
import { useRoom } from '../hooks/useRoom';
import { usePlayback } from '../hooks/usePlayback';
import { useChat } from '../hooks/useChat';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import RoomControls from '../components/RoomControls';
import ChatPanel from '../components/ChatPanel';
import ChatInput from '../components/ChatInput';
import ParticipantList from '../components/ParticipantList';

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [player, setPlayer] = useState(null);
  const playerRef = useRef(null);
  const hasJoined = useRef(false);

  const { setRoom, clearRoom } = useRoomStore();
  const { setUser, currentUser } = useUserStore();
  const { clearMessages } = useChatStore();

  // Initialize custom hooks
  const { isConnected } = useSocket();
  const { joinRoom: joinRoomSocket, leaveRoom } = useRoom(roomCode, user?.id);
  usePlayback(roomCode);
  useChat(roomCode);

  // Set user info from Clerk
  useEffect(() => {
    if (user) {
      setUser({
        clerkId: user.id,
        username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0],
        email: user.emailAddresses[0]?.emailAddress
      });
    }
  }, [user, setUser]);

  // Initialize room
  useEffect(() => {
    const initRoom = async () => {
      try {
        // Join room via API
        const roomData = await joinRoomAPI(roomCode);
        setRoom(roomData);

        // Join room via Socket.io
        if (isConnected && currentUser) {
          joinRoomSocket(currentUser.username);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to join room');
        setLoading(false);
      }
    };

    if (user && currentUser && isConnected && !hasJoined.current) {
      hasJoined.current = true;
      initRoom();
    }

    return () => {
      // Don't call leaveRoom() on unmount - this fires on refresh
      // Only disconnect happens automatically via socket disconnect event
      clearRoom();
      clearMessages();
      hasJoined.current = false;
    };
  }, [roomCode, user, currentUser, isConnected]);

  // Error listener
  useEffect(() => {
    const handleError = (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    };

    socketService.on('error', handleError);

    return () => {
      socketService.off('error', handleError);
    };
  }, []);

  const handlePlayerReady = (playerInstance) => {
    playerRef.current = playerInstance;
    setPlayer(playerInstance);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
          <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video and Controls */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer onPlayerReady={handlePlayerReady} />
            <RoomControls player={player} onLeaveRoom={handleLeaveRoom} />
          </div>

          {/* Right Column - Chat and Participants */}
          <div className="lg:col-span-1">
            <div className="bg-base-300 rounded-lg h-[calc(100vh-180px)] flex flex-col">
              {/* Tabs */}
              <div className="tabs tabs-boxed p-2">
                <button
                  className={`tab flex-1 gap-2 ${activeTab === 'chat' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  className={`tab flex-1 gap-2 ${activeTab === 'participants' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('participants')}
                >
                  <Users className="w-4 h-4" />
                  Participants
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <ChatPanel />
                    </div>
                    <ChatInput />
                  </div>
                ) : (
                  <ParticipantList />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
