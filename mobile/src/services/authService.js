import api from './api';
import { Platform } from 'react-native';
import { ENDPOINTS } from '../constants/api';

// Web uchun localStorage, native uchun SecureStore
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  }
};

export const authService = {
  // Step 1: Telefon raqamni tekshirish
  async checkPhone(phone) {
    const response = await api.post(ENDPOINTS.AUTH.CHECK_PHONE, { phone });
    return response.data;
  },

  // Step 2a: Mavjud foydalanuvchi - parol bilan kirish
  async loginWithPhone(phone, password) {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN_PHONE, { phone, password });
    if (response.data.success) {
      await storage.setItem('token', response.data.token);
      await storage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Step 2b: Yangi foydalanuvchi - Telegram OTP tasdiqlash
  async verifyPhoneOTP(phone, otp) {
    const response = await api.post(ENDPOINTS.AUTH.VERIFY_PHONE_OTP, { phone, otp });
    return response.data;
  },

  // Step 3: Yangi foydalanuvchi - parol yaratish va ro'yxatdan o'tish
  async createPassword(tempToken, password, firstName, lastName) {
    const response = await api.post(ENDPOINTS.AUTH.CREATE_PASSWORD, {
      tempToken,
      password,
      firstName,
      lastName,
    });
    if (response.data.success) {
      await storage.setItem('token', response.data.token);
      await storage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get(ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  async logout() {
    await storage.removeItem('token');
    await storage.removeItem('user');
  },

  async getToken() {
    return await storage.getItem('token');
  },

  async getUser() {
    const user = await storage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async isAuthenticated() {
    const token = await storage.getItem('token');
    return !!token;
  },

  async saveAuth(token, user) {
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(user));
  },
};

export default authService;
