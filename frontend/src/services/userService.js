import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/api/user/profile', data);
    return response.data;
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/api/user/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.post('/api/user/change-password', data);
    return response.data;
  },
  deleteAccount: async (password) => {
    const response = await api.delete('/api/user/account', { data: { password } });
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/api/user/dashboard-stats');
    return response.data;
  }
};