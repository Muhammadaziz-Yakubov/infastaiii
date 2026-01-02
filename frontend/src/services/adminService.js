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
  }
};

export default adminService;
