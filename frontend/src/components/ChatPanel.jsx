import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useUserStore } from '../stores/userStore';
import { format } from 'date-fns';

const ChatPanel = () => {
  const { messages } = useChatStore();
  const { currentUser } = useUserStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-200 rounded-lg">
      <div className="p-4 border-b border-base-300">
        <h3 className="font-semibold text-lg">Live Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-sm opacity-50 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.userId === currentUser?.clerkId;
            const isSystemMessage = message.type === 'system';

            if (isSystemMessage) {
              return (
                <div key={index} className="text-center">
                  <div className="inline-block bg-base-300 px-3 py-1 rounded-full text-xs opacity-70">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isOwnMessage && (
                    <span className="text-xs opacity-70 px-2">{message.username}</span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-primary text-primary-content rounded-br-sm'
                        : 'bg-base-300 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm wrap-break-word">{message.content}</p>
                  </div>
                  <span className="text-xs opacity-50 px-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatPanel;
