// src/services/authService.js - Clean Authentication Service
import api from './api';

class AuthService {
  // =============================================
  // PHONE AUTHENTICATION (TELEGRAM BOT)
  // =============================================

  /**
   * Check if phone exists and initiate auth flow
   * @param {string} phone - User phone number
   * @returns {Promise<Object>} Check response
   */
  async checkPhone(phone) {
    try {
      const response = await api.post('/api/auth/check-phone', { phone });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify phone OTP from Telegram bot
   * @param {string} phone - User phone number
   * @param {string} otp - OTP code from Telegram bot
   * @param {string} tempToken - Temporary token
   * @returns {Promise<Object>} Verification response
   */
  async verifyPhoneOTP(phone, otp, tempToken) {
    try {
      const response = await api.post('/api/auth/verify-phone-otp', { phone, otp, tempToken });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify email OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} tempToken - Temporary token
   * @returns {Promise<Object>} Verification response
   */
  async verifyEmailOTP(email, otp, tempToken) {
    try {
      const response = await api.post('/api/auth/verify-email-otp', { email, otp, tempToken });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create password for new users
   * @param {string} tempToken - Temporary token from OTP verification
   * @param {string} firstName - User first name
   * @param {string} lastName - User last name
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration response
   */
  async createPassword(password, tempToken) {
    try {
      const response = await api.post('/api/auth/create-password', {
        password,
        tempToken
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create password with user info (name, avatar)
   * @param {FormData} formData - FormData with password, tempToken, firstName, lastName, avatar
   * @returns {Promise<Object>} Registration response
   */
  async createPasswordWithInfo(formData) {
    try {
      const response = await api.post('/api/auth/create-password', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async loginWithEmailPassword(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login with email and password (alias for loginWithEmailPassword)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    return this.loginWithEmailPassword(email, password);
  }

  /**
   * Login with email and password (backward compatibility)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async loginWithPassword(email, password) {
    return this.loginWithEmailPassword(email, password);
  }

  /**
   * Verify email with verification code
   * @param {string} email - User email
   * @param {string} code - Verification code
   * @returns {Promise<Object>} Verification response
   */
  async verifyEmail(email, code) {
    try {
      const response = await api.post('/api/auth/verify-email', { email, code });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend email verification code
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend response
   */
  async resendEmailVerification(email) {
    try {
      const response = await api.post('/api/auth/resend-email-verification', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================
  // PHONE AUTHENTICATION
  // =============================================

  /**
   * Send SMS verification code
   * @param {string} phone - User phone number
   * @returns {Promise<Object>} SMS response
   */
  async sendSMSCode(phone) {
    try {
      const response = await api.post('/api/auth/send-sms-code', { phone });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify SMS code
   * @param {string} phone - User phone number
   * @param {string} code - Verification code
   * @returns {Promise<Object>} Verification response
   */
  async verifySMSCode(phone, code) {
    try {
      const response = await api.post('/api/auth/verify-sms-code', { phone, code });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register with phone number
   * @param {string} tempToken - Temporary token from SMS verification
   * @param {string} firstName - User first name
   * @param {string} lastName - User last name
   * @param {string} birthday - User birthday
   * @returns {Promise<Object>} Registration response
   */
  async registerWithPhone(tempToken, firstName, lastName, birthday) {
    try {
      const response = await api.post('/api/auth/register-phone', {
        tempToken,
        firstName,
        lastName,
        birthday
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login with phone and password
   * @param {string} phone - User phone number
   * @param {string} password - User password
   * @param {string} tempToken - Temporary token
   * @returns {Promise<Object>} Login response
   */
  async loginWithPhonePassword(phone, password, tempToken = null) {
    try {
      const requestData = {
        phone,
        password
      };

      // Only include tempToken if it exists
      if (tempToken) {
        requestData.tempToken = tempToken;
      }

      const response = await api.post('/api/auth/login-phone', requestData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Forgot password
   * @param {string} phone - User phone number
   * @returns {Promise<Object>} Forgot password response
   */
  async forgotPassword(phone) {
    try {
      const response = await api.post('/api/auth/forgot-password', { phone });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password
   * @param {string} phone - User phone number
   * @param {string} code - Verification code
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset password response
   */
  async resetPassword(phone, code, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password', {
        phone,
        code,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Google Auth with credential
   * @param {string} credential - Google credential token
   * @returns {Promise<Object>} Google auth response
   */
  async googleAuth(credential) {
    try {
      const response = await api.post('/api/auth/google', { credential });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================
  // GOOGLE AUTHENTICATION
  // =============================================

  /**
   * Initiate Google OAuth login
   * @returns {Promise<Object>} Google auth URL response
   */
  async initiateGoogleAuth() {
    try {
      const response = await api.get('/api/auth/google');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle Google OAuth callback (used by callback page)
   * @param {string} token - JWT token from URL params
   * @returns {Object} Decoded user data
   */
  processGoogleCallback(token) {
    if (!token) {
      throw new Error('No token provided');
    }

    // Store token in localStorage
    localStorage.setItem('token', token);

    // Decode token to get user info (basic decode, not full JWT verification)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        user: payload.userId ? { id: payload.userId } : null,
        token
      };
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Get user profile from token (for Google callback)
   * @returns {Promise<Object>} User profile
   */
  async getUserFromToken() {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================
  // USER MANAGEMENT
  // =============================================

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await api.post('/api/auth/logout');
      // Clear local storage
      this.clearAuthData();
      return response.data;
    } catch (error) {
      // Even if API call fails, clear local storage
      this.clearAuthData();
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Basic token validation (check if not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch (error) {
      // Invalid token format
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Get stored JWT token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  // =============================================
  // ERROR HANDLING
  // =============================================

  /**
   * Handle API errors consistently
   * @param {Object} error - Axios error object
   * @returns {Object} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: data.message || 'Validation error',
            details: data.errors || []
          };

        case 401:
          return {
            type: 'auth',
            message: data.message || 'Authentication failed'
          };

        case 403:
          return {
            type: 'permission',
            message: data.message || 'Access denied'
          };

        case 404:
          return {
            type: 'not_found',
            message: data.message || 'Resource not found'
          };

        case 429:
          return {
            type: 'rate_limit',
            message: data.message || 'Too many requests'
          };

        case 500:
          return {
            type: 'server',
            message: 'Server error. Please try again later.'
          };

        default:
          return {
            type: 'unknown',
            message: data.message || 'An unexpected error occurred'
          };
      }
    } else if (error.request || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      // Network error - server is not running
      return {
        type: 'network',
        message: 'Serverga ulanib bo\'lmadi. Iltimos, backend serverni ishga tushiring (npm start yoki node server.js)'
      };
    } else {
      // Other error
      return {
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      };
    }
  }

  // =============================================
  // UTILITIES
  // =============================================

  /**
   * Redirect to login page
   */
  redirectToLogin() {
    window.location.href = '/auth';
  }

  /**
   * Redirect to dashboard (after successful auth)
   */
  redirectToDashboard() {
    window.location.href = '/dashboard';
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default new AuthService();