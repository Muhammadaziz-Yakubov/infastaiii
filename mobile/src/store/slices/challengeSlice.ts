import { createSlice } from '@reduxjs/toolkit';
import { Challenge } from '@/types';

interface ChallengeState {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChallengeState = {
  challenges: [],
  currentChallenge: null,
  isLoading: false,
  error: null,
};

const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addChallenge: (state, action) => {
      state.challenges.unshift(action.payload);
    },
    updateChallenge: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.challenges.findIndex(challenge => challenge._id === id);
      if (index !== -1) {
        state.challenges[index] = { ...state.challenges[index], ...updates };
      }
    },
    deleteChallenge: (state, action) => {
      state.challenges = state.challenges.filter(challenge => challenge._id !== action.payload);
    },
    setCurrentChallenge: (state, action) => {
      state.currentChallenge = action.payload;
    },
  },
});

export const {
  clearError,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  setCurrentChallenge,
} = challengeSlice.actions;

export default challengeSlice.reducer;
