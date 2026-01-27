import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '@/types';

// API base URL - change this to your backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://infastaiii.onrender.com/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth state
          await AsyncStorage.removeItem('authToken');
          // You might want to dispatch a logout action here
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // File upload method
  async upload<T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
