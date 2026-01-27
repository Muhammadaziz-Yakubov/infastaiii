import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'uz' | 'en';
  isOnline: boolean;
  isFirstLaunch: boolean;
  appVersion: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppState = {
  theme: 'system',
  language: 'uz',
  isOnline: true,
  isFirstLaunch: true,
  appVersion: '1.0.0',
  isLoading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'uz' | 'en'>) => {
      state.language = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  clearError,
  setTheme,
  setLanguage,
  setOnlineStatus,
  setFirstLaunch,
  setLoading,
  setError,
} = appSlice.actions;

export default appSlice.reducer;
