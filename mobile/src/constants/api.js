export const API_URL = 'http://localhost:5000';

export const ENDPOINTS = {
  AUTH: {
    CHECK_PHONE: '/api/auth/check-phone',
    LOGIN_PHONE: '/api/auth/login-phone',
    VERIFY_PHONE_OTP: '/api/auth/verify-phone-otp',
    CREATE_PASSWORD: '/api/auth/create-password',
    GOOGLE: '/api/auth/google',
    PROFILE: '/api/user/profile',
  },
  TASKS: {
    BASE: '/api/tasks',
    BY_ID: (id) => `/api/tasks/${id}`,
  },
  GOALS: {
    BASE: '/api/goals',
    BY_ID: (id) => `/api/goals/${id}`,
  },
  FINANCE: {
    BASE: '/api/finance/transactions',
    BY_ID: (id) => `/api/finance/transactions/${id}`,
    STATS: '/api/finance/statistics',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    AVATAR: '/api/user/avatar',
  },
  CHALLENGES: {
    BASE: '/api/challenges',
    BY_ID: (id) => `/api/challenges/${id}`,
    JOIN: (id) => `/api/challenges/${id}/join`,
  },
};
