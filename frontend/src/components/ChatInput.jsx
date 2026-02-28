import { useState } from 'react';
import { Send } from 'lucide-react';
import { useRoomStore } from '../stores/roomStore';
import { VALIDATION } from '../utils/constants';
import socketService from '../services/socketService';

const ChatInput = () => {
  const { roomCode } = useRoomStore();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      setError('Message cannot be empty');
      return;
    }

    if (trimmedMessage.length > VALIDATION.MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${VALIDATION.MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    socketService.sendMessage(roomCode, trimmedMessage);
    setMessage('');
    setError('');
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="p-4 border-t border-base-300 bg-base-200">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          className={`input input-bordered flex-1 ${error ? 'input-error' : ''}`}
          maxLength={VALIDATION.MAX_MESSAGE_LENGTH}
        />
        <button
          type="submit"
          className="btn btn-primary btn-square"
          disabled={!message.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
      <p className="text-xs opacity-50 mt-1">
        {message.length}/{VALIDATION.MAX_MESSAGE_LENGTH}
      </p>
    </div>
  );
};

export default ChatInput;
