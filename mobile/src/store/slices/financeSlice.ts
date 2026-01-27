import { createSlice } from '@reduxjs/toolkit';
import { Finance } from '@/types';

interface FinanceState {
  finances: Finance[];
  statistics: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  finances: [],
  statistics: null,
  isLoading: false,
  error: null,
};

const financeSlice = createSlice({
  name: 'finances',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addFinance: (state, action) => {
      state.finances.unshift(action.payload);
    },
    updateFinance: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.finances.findIndex(finance => finance._id === id);
      if (index !== -1) {
        state.finances[index] = { ...state.finances[index], ...updates };
      }
    },
    deleteFinance: (state, action) => {
      state.finances = state.finances.filter(finance => finance._id !== action.payload);
    },
    setStatistics: (state, action) => {
      state.statistics = action.payload;
    },
  },
});

export const {
  clearError,
  addFinance,
  updateFinance,
  deleteFinance,
  setStatistics,
} = financeSlice.actions;

export default financeSlice.reducer;
