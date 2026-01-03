import api from './api';
import { ENDPOINTS } from '../constants/api';

export const goalsService = {
  async getGoals() {
    const response = await api.get(ENDPOINTS.GOALS.BASE);
    return response.data;
  },

  async createGoal(goalData) {
    const response = await api.post(ENDPOINTS.GOALS.BASE, goalData);
    return response.data;
  },

  async updateGoal(id, goalData) {
    const response = await api.put(ENDPOINTS.GOALS.BY_ID(id), goalData);
    return response.data;
  },

  async deleteGoal(id) {
    const response = await api.delete(ENDPOINTS.GOALS.BY_ID(id));
    return response.data;
  },

  async updateProgress(id, progress) {
    const response = await api.patch(ENDPOINTS.GOALS.BY_ID(id), { progress });
    return response.data;
  },
};

export default goalsService;
