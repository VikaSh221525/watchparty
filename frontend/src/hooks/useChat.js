import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import socketService from '../services/socketService';
import { getRoomMessages } from '../services/roomService';
import { SERVER_EVENTS } from '../utils/constants';

/**
 * Custom hook to manage chat operations
 * @param {string} roomCode - The room code
 * @returns {Object} Chat operations
 */
export const useChat = (roomCode) => {
  const { setMessages, addMessage } = useChatStore();

  useEffect(() => {
    if (!roomCode) return;

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

    // New message event
    const handleNewMessage = (data) => {
      addMessage(data);
    };

    // Register event listener
    socketService.on(SERVER_EVENTS.NEW_MESSAGE, handleNewMessage);

    return () => {
      socketService.off(SERVER_EVENTS.NEW_MESSAGE, handleNewMessage);
    };
  }, [roomCode, setMessages, addMessage]);

  const sendMessage = (content) => {
    socketService.sendMessage(roomCode, content);
  };

  return {
    sendMessage
  };
};
