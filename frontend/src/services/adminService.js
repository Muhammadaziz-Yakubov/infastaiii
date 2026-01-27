import api from './api';

export const adminService = {
  // Admin login
  login: async (username, password) => {
    try {
      const response = await api.post('/api/admin/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Admin login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      console.log('✅ Dashboard data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getDashboardStats error:', error.response?.data || error.message);
      return {
        success: false,
        data: {
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          adminUsers: 0,
          totalTasks: 0,
          totalPayments: 0,
          totalRevenue: 0,
          recentUsers: [],
          userGrowthData: [],
          loginActivityData: [],
          lastWeekUsers: 0,
          weeklyGrowthPercent: 0
        }
      };
    }
  },

  // Get all users with pagination
  getUsers: async (page = 1, limit = 20, search = '', status = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const response = await api.get(`/api/admin/users?${params.toString()}`);
      console.log('✅ Users data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getUsers error:', error.response?.data || error.message);
      return {
        success: false,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 }
        }
      };
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('getUserDetails error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle ban status (ban or unban)
  toggleUserBan: async (userId, ban) => {
    try {
      const response = await api.post(`/api/admin/users/${userId}/toggle-ban`, { ban });
      return response.data;
    } catch (error) {
      console.error('toggleUserBan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get pending payments
  getPendingPayments: async () => {
    try {
      const response = await api.get('/api/admin/payments/pending');
      return response.data;
    } catch (error) {
      console.error('getPendingPayments error:', error.response?.data || error.message);
      return { success: false, payments: [] };
    }
  },

  // Get all payments
  getAllPayments: async (page = 1, limit = 20, status = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      const response = await api.get(`/api/admin/payments?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('getAllPayments error:', error.response?.data || error.message);
      return { success: false, payments: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },

  // Approve payment
  approvePayment: async (paymentId) => {
    try {
      const response = await api.put(`/api/admin/payments/${paymentId}/approve`);
      return response.data;
    } catch (error) {
      console.error('approvePayment error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Reject payment
  rejectPayment: async (paymentId, reason = '') => {
    try {
      const response = await api.put(`/api/admin/payments/${paymentId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('rejectPayment error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Send notification to users
  sendNotification: async (title, message, type = 'announcement', userId = null) => {
    try {
      const response = await api.post('/api/admin/notifications/send', {
        title,
        message,
        type,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('sendNotification error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, data) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/profile`, data);
      return response.data;
    } catch (error) {
      console.error('updateUserProfile error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('deleteUser error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user notifications
  getUserNotifications: async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}/notifications`);
      return response.data;
    } catch (error) {
      console.error('getUserNotifications error:', error.response?.data || error.message);
      return { success: false, notifications: [] };
    }
  },

  // Get all tasks
  getAllTasks: async (page = 1, limit = 50, search = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      const response = await api.get(`/api/admin/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('getAllTasks error:', error.response?.data || error.message);
      return { success: false, data: { tasks: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } } };
    }
  },

  // Get all challenges
  getAllChallenges: async (page = 1, limit = 50, search = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      const response = await api.get(`/api/admin/challenges?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('getAllChallenges error:', error.response?.data || error.message);
      return { success: false, data: { challenges: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } } };
    }
  },

  // Get all goals
  getAllGoals: async (page = 1, limit = 50, search = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      const response = await api.get(`/api/admin/goals?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('getAllGoals error:', error.response?.data || error.message);
      return { success: false, data: { goals: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } } };
    }
  },

  // Get all transactions
  getAllTransactions: async (page = 1, limit = 50, search = '', type = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      const response = await api.get(`/api/admin/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('getAllTransactions error:', error.response?.data || error.message);
      return {
        success: false,
        data: {
          transactions: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
          summary: { totalIncome: 0, totalExpense: 0, balance: 0 }
        }
      };
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/api/admin/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('deleteTask error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete challenge
  deleteChallenge: async (challengeId) => {
    try {
      const response = await api.delete(`/api/admin/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      console.error('deleteChallenge error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete goal
  deleteGoal: async (goalId) => {
    try {
      const response = await api.delete(`/api/admin/goals/${goalId}`);
      return response.data;
    } catch (error) {
      console.error('deleteGoal error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (transactionId) => {
    try {
      const response = await api.delete(`/api/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('deleteTransaction error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Bulk delete transactions
  bulkDeleteTransactions: async (transactionIds) => {
    try {
      const response = await api.post('/api/admin/transactions/bulk-delete', { transactionIds });
      return response.data;
    } catch (error) {
      console.error('bulkDeleteTransactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Clear all transactions
  clearAllTransactions: async () => {
    try {
      const response = await api.delete('/api/admin/transactions/clear-all');
      return response.data;
    } catch (error) {
      console.error('clearAllTransactions error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default adminService;
