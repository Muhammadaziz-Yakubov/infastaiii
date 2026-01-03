import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../constants/api';

// Web uchun localStorage, native uchun SecureStore
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }
  const SecureStore = require('expo-secure-store');
  return await SecureStore.getItemAsync('token');
};

const clearAuth = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return;
  }
  const SecureStore = require('expo-secure-store');
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Token olishda xatolik:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
