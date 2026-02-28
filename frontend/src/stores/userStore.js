import { create } from 'zustand';

export const useUserStore = create((set) => ({
  currentUser: null,
  
  setUser: (user) => set({ currentUser: user }),
  
  clearUser: () => set({ currentUser: null })
}));
