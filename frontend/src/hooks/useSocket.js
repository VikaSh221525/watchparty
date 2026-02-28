import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import socketService from '../services/socketService';

/**
 * Custom hook to manage Socket.io connection lifecycle
 * @returns {Object} { socket, isConnected }
 */
export const useSocket = () => {
  const { getToken, isSignedIn } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          socketService.connect(token);
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to connect socket:', error);
          setIsConnected(false);
        }
      }
    };

    initSocket();

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [isSignedIn, getToken]);

  return {
    socket: socketService.getSocket(),
    isConnected
  };
};
