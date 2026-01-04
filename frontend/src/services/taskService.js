import api from './api';

export const taskService = {
  getTasks: async (filters = {}) => {
    const response = await api.get('/api/tasks', { params: filters });
    return response.data;
  },

  searchTasks: async (query) => {
    const response = await api.get('/api/tasks/search', { params: { q: query } });
    return response.data;
  },

  createTask: async (data) => {
    const response = await api.post('/api/tasks', data);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/api/tasks/${id}`, data);
    return response.data;
  },

  completeTask: async (id) => {
    const response = await api.post(`/api/tasks/${id}/complete`);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },


  bulkDelete: async (taskIds) => {
    // Delete tasks one by one
    const promises = taskIds.map(id => api.delete(`/api/tasks/${id}`));
    await Promise.all(promises);
    return { success: true, message: `${taskIds.length} ta vazifa o'chirildi` };
  }
};
