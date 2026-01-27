import { createSlice } from '@reduxjs/toolkit';
import { Goal } from '@/types';

interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addGoal: (state, action) => {
      state.goals.unshift(action.payload);
    },
    updateGoal: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.goals.findIndex(goal => goal._id === id);
      if (index !== -1) {
        state.goals[index] = { ...state.goals[index], ...updates };
      }
    },
    deleteGoal: (state, action) => {
      state.goals = state.goals.filter(goal => goal._id !== action.payload);
    },
    setCurrentGoal: (state, action) => {
      state.currentGoal = action.payload;
    },
  },
});

export const {
  clearError,
  addGoal,
  updateGoal,
  deleteGoal,
  setCurrentGoal,
} = goalSlice.actions;

export default goalSlice.reducer;
