import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages) => set({ messages }),
  
  clearMessages: () => set({ messages: [] })
}));
