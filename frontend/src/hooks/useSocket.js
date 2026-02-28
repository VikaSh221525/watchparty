import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import socketService from '../services/socketService';

/**
 * Custom hook to manage Socket.io connection lifecycle
 * @returns {Object} { socket, isConnected }
 */
export const useSocket = () => {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      if (user) {
        try {
          const token = await user.getToken();
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
  }, [user]);

  return {
    socket: socketService.getSocket(),
    isConnected
  };
};
