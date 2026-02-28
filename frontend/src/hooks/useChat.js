import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import socketService from '../services/socketService';
import { getRoomMessages } from '../services/roomService';
import { SERVER_EVENTS } from '../utils/constants';
import { useSocket } from './useSocket';

/**
 * Custom hook to manage chat operations
 * @param {string} roomCode - The room code
 * @returns {Object} Chat operations
 */
export const useChat = (roomCode) => {
  const { setMessages, addMessage } = useChatStore();
  const { isConnected } = useSocket();

  useEffect(() => {
    if (!roomCode || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Load chat history
    const loadChatHistory = async () => {
      try {
        const messagesData = await getRoomMessages(roomCode);
        setMessages(messagesData.messages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();

    // New message event handler
    const handleNewMessage = (data) => {
      addMessage(data);
    };

    // Register event listener
    socket.on(SERVER_EVENTS.NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(SERVER_EVENTS.NEW_MESSAGE, handleNewMessage);
    };
  }, [roomCode, isConnected]);

  const sendMessage = (content) => {
    socketService.sendMessage(roomCode, content);
  };

  return {
    sendMessage
  };
};
