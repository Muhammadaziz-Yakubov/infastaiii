import api from './api';
import { ENDPOINTS } from '../constants/api';

export const taskService = {
  async getTasks() {
    const response = await api.get(ENDPOINTS.TASKS.BASE);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post(ENDPOINTS.TASKS.BASE, taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.put(ENDPOINTS.TASKS.BY_ID(id), taskData);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(ENDPOINTS.TASKS.BY_ID(id));
    return response.data;
  },

  async toggleComplete(id, status) {
    const response = await api.patch(ENDPOINTS.TASKS.BY_ID(id), { status });
    return response.data;
  },
};

export default taskService;
