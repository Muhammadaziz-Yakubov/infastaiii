import { apiClient } from './client';
import { ApiResponse, User, LoginCredentials, RegisterData } from '@/types';

export const authAPI = {
  // Check phone number
  checkPhone: async (phone: string): Promise<ApiResponse> => {
    return apiClient.post('/auth/check-phone', { phone });
  },

  // Verify phone OTP
  verifyPhoneOTP: async (phone: string, otp: string): Promise<ApiResponse<{ token: string }>> => {
    return apiClient.post('/auth/verify-phone-otp', { phone, otp });
  },

  // Create password after OTP verification
  createPassword: async (data: RegisterData & { otp: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiClient.post('/auth/create-password', data);
  },

  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiClient.post('/auth/login', credentials);
  },

  // Login with phone and password
  loginWithPhone: async (phone: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiClient.post('/auth/login-phone', { phone, password });
  },

  // Get user profile
  getProfile: async (token?: string): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get('/auth/profile');
  },

  // Logout
  logout: async (token?: string): Promise<ApiResponse> => {
    return apiClient.post('/auth/logout');
  },

  // Forgot password
  forgotPassword: async (phone: string): Promise<ApiResponse> => {
    return apiClient.post('/auth/forgot-password', { phone });
  },

  // Reset password
  resetPassword: async (phone: string, code: string, newPassword: string): Promise<ApiResponse> => {
    return apiClient.post('/auth/reset-password', { phone, code, newPassword });
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    return apiClient.get('/auth/health');
  },
};
