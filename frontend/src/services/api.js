import axios from 'axios';

// Production: Use render.com backend, Development: Use localhost
const API_URL = import.meta.env.VITE_API_URL ||
                (import.meta.env.PROD
                  ? 'https://infastaiii.onrender.com' // Your actual Render.com backend URL
                  : 'http://localhost:5000');

// Development rejimida API URL ni ko'rsatish
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har so'rovdan oldin token qo'shish
api.interceptors.request.use(
  (config) => {
    // Admin routes uchun adminToken ishlatish
    if (config.url?.includes('/admin')) {
      // Avval oddiy localStorage'dan
      let adminToken = localStorage.getItem('adminToken');
      
      // Agar topilmasa, zustand persist storage'dan
      if (!adminToken) {
        try {
          const adminStorage = localStorage.getItem('admin-storage');
          if (adminStorage) {
            const parsed = JSON.parse(adminStorage);
            adminToken = parsed?.state?.adminToken;
          }
        } catch (e) {
          console.error('Error parsing admin storage:', e);
        }
      }
      
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Oddiy routes uchun token ishlatish
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Development rejimida so'rovlarni log qilish
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni boshqarish
api.interceptors.response.use(
  (response) => {
    // Development rejimida javoblarni log qilish
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    // Development rejimida xatoliklarni log qilish
    if (import.meta.env.DEV) {
      if (error.response) {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response.status,
          data: error.response.data,
          requestData: error.config?.data
        });
      } else {
        console.error('❌ Network xatolik:', error.message);
      }
    }
    
    // Network xatolik (serverga ulanib bo'lmadi)
    if (!error.response) {
      console.error('Network xatolik:', error.message);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('Serverga ulanib bo\'lmadi. Server ishlamoqdamimi tekshiring:', API_URL);
      }
    }
    
    // 403 - User banned
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('bloklandingiz') || errorMessage.includes('banned')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/banned';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      // Login/auth endpointlarida 401 - noto'g'ri ma'lumotlar, token eskirgan emas
      const isAuthEndpoint = error.config?.url?.includes('/auth/') ||
                            error.config?.url?.includes('/login');

      if (!isAuthEndpoint) {
        // Faqat boshqa endpointlarda 401 bo'lsa token eskirgan deb hisobla
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
      // Auth endpointlarda 401 ni oddiy xatolik sifatida qaytar
    }
    
    return Promise.reject(error);
  }
);

export default api;