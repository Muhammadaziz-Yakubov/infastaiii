import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  
  // Auth flow state
  phone: null,
  userExists: false,
  tempToken: null,

  initialize: async () => {
    try {
      const token = await authService.getToken();
      const user = await authService.getUser();
      
      if (token && user) {
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('Auth initialize error:', error);
      set({ isLoading: false });
    }
  },

  // Step 1: Telefon raqamni tekshirish
  checkPhone: async (phone) => {
    try {
      const result = await authService.checkPhone(phone);
      if (result.success) {
        set({ 
          phone, 
          userExists: result.userExists,
          tempToken: result.tempToken || null
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Step 2a: Mavjud foydalanuvchi - parol bilan kirish
  loginWithPhone: async (phone, password) => {
    try {
      const result = await authService.loginWithPhone(phone, password);
      if (result.success) {
        set({ 
          user: result.user, 
          token: result.token, 
          isAuthenticated: true,
          phone: null,
          userExists: false,
          tempToken: null
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Step 2b: Yangi foydalanuvchi - Telegram OTP tasdiqlash
  verifyPhoneOTP: async (phone, otp) => {
    try {
      const result = await authService.verifyPhoneOTP(phone, otp);
      if (result.success) {
        set({ tempToken: result.tempToken });
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Step 3: Yangi foydalanuvchi - parol yaratish
  createPassword: async (password, firstName, lastName) => {
    try {
      const { tempToken } = get();
      const result = await authService.createPassword(tempToken, password, firstName, lastName);
      if (result.success) {
        set({ 
          user: result.user, 
          token: result.token, 
          isAuthenticated: true,
          phone: null,
          userExists: false,
          tempToken: null
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Reset auth flow
  resetAuthFlow: () => {
    set({ phone: null, userExists: false, tempToken: null });
  },

  logout: async () => {
    await authService.logout();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      phone: null,
      userExists: false,
      tempToken: null
    });
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },
}));

export default useAuthStore;
