import { create } from 'zustand';

export const useRoomStore = create((set) => ({
  roomCode: null,
  hostId: null,
  participants: [],
  currentVideo: null,
  playbackState: {
    isPlaying: false,
    timestamp: 0
  },

  setRoom: (room) => set({
    roomCode: room.roomCode,
    hostId: room.hostId,
    participants: room.participants || [],
    currentVideo: room.currentVideo || null,
    playbackState: room.playbackState || { isPlaying: false, timestamp: 0 }
  }),

  updateParticipants: (participants) => set({ participants }),

  addParticipant: (participant) => set((state) => {
    const exists = state.participants.some(p => p.userId === participant.userId);
    if (exists) {
      return {
        participants: state.participants.map(p =>
          p.userId === participant.userId ? { ...p, ...participant } : p
        )
      };
    }
    return {
      participants: [...state.participants, participant]
    };
  }),

  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.userId !== userId)
  })),

  updateParticipantRole: (userId, role) => set((state) => ({
    participants: state.participants.map(p =>
      p.userId === userId ? { ...p, role } : p
    )
  })),

  updatePlaybackState: (playbackState) => set((state) => ({
    playbackState: { ...state.playbackState, ...playbackState }
  })),

  updateCurrentVideo: (video) => set({ currentVideo: video }),

  setHostId: (hostId) => set({ hostId }),

  clearRoom: () => set({
    roomCode: null,
    hostId: null,
    participants: [],
    currentVideo: null,
    playbackState: { isPlaying: false, timestamp: 0 }
  })
}));
