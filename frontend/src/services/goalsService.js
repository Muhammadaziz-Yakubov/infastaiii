import api from './api';

export const goalsService = {
  getGoals: async () => {
    const response = await api.get('/api/goals');
    return response.data;
  },

  getGoalStatistics: async () => {
    const response = await api.get('/api/goals/statistics');
    return response.data;
  },

  createGoal: async (data) => {
    const response = await api.post('/api/goals', data);
    return response.data;
  },

  updateGoal: async (id, data) => {
    const response = await api.put(`/api/goals/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await api.delete(`/api/goals/${id}`);
    return response.data;
  },

  fundGoal: async (id, data) => {
    const response = await api.post(`/api/goals/${id}/fund`, data);
    return response.data;
  },

  updateGoalStatus: async (id, status) => {
    const response = await api.patch(`/api/goals/${id}/status`, { status });
    return response.data;
  },

  setupAutoSave: async (id, data) => {
    const response = await api.post(`/api/goals/${id}/auto-save`, data);
    return response.data;
  }
};

