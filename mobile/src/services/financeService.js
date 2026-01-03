import api from './api';
import { ENDPOINTS } from '../constants/api';

export const financeService = {
  async getTransactions() {
    const response = await api.get(ENDPOINTS.FINANCE.BASE);
    return response.data;
  },

  async createTransaction(transactionData) {
    const response = await api.post(ENDPOINTS.FINANCE.BASE, transactionData);
    return response.data;
  },

  async updateTransaction(id, transactionData) {
    const response = await api.put(ENDPOINTS.FINANCE.BY_ID(id), transactionData);
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await api.delete(ENDPOINTS.FINANCE.BY_ID(id));
    return response.data;
  },

  async getStats() {
    const response = await api.get(ENDPOINTS.FINANCE.STATS);
    return response.data;
  },
};

export default financeService;
