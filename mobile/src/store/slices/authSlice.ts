import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import { authAPI } from '@/api/authAPI';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const checkPhone = createAsyncThunk(
  'auth/checkPhone',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.checkPhone(phone);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Phone check failed');
    }
  }
);

export const verifyPhoneOTP = createAsyncThunk(
  'auth/verifyPhoneOTP',
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyPhoneOTP(phone, otp);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const createPassword = createAsyncThunk(
  'auth/createPassword',
  async (data: RegisterData & { otp: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.createPassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password creation failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async ({ phone, password }: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.loginWithPhone(phone, password);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Phone login failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const response = await authAPI.getProfile(state.auth.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (state.auth.token) {
        await authAPI.logout(state.auth.token);
      }
    } catch (error: any) {
      // Even if logout fails on server, we should clear local state
      console.warn('Logout API call failed:', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Phone
      .addCase(checkPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkPhone.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(checkPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify Phone OTP
      .addCase(verifyPhoneOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPhoneOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyPhoneOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Password
      .addCase(createPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(createPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login with Phone
      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setLoading, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
