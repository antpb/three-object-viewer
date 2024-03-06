// participantsStore.js
import create from 'zustand'

const useParticipantsStore = create((set) => ({
  participants: [],
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant] })),
  removeParticipant: (clientId) => set((state) => ({
    participants: state.participants.filter((item) => item[0] !== clientId)
  })),
}))

export default useParticipantsStore;
