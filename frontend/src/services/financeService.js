import api from './api';

export const financeService = {
    // Transactions
    getTransactions: async (params = {}) => {
        const response = await api.get('/api/finance/transactions', { params });
        return response.data;
    },

    getTransaction: async (id) => {
        const response = await api.get(`/api/finance/transactions/${id}`);
        return response.data;
    },

    createTransaction: async (data) => {
        const response = await api.post('/api/finance/transactions', data);
        return response.data;
    },

    updateTransaction: async (id, data) => {
        const response = await api.put(`/api/finance/transactions/${id}`, data);
        return response.data;
    },

    deleteTransaction: async (id) => {
        const response = await api.delete(`/api/finance/transactions/${id}`);
        return response.data;
    },

    // Statistics
    getStatistics: async (period = 'month') => {
        const response = await api.get(`/api/finance/statistics`, { params: { period } });
        return response.data;
    },

    // Categories
    getCategories: async (type) => {
        const params = type ? { type } : {};
        const response = await api.get('/api/finance/categories', { params });
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post('/api/finance/categories', data);
        return response.data;
    },

    // Bulk operations
    bulkDelete: async (transactionIds) => {
        const response = await api.post('/api/finance/bulk-delete', { transactionIds });
        return response.data;
    },

    // Debts
    getDebts: async () => {
        const response = await api.get('/api/finance/debts');
        return response.data;
    },

    createDebt: async (data) => {
        const response = await api.post('/api/finance/debts', data);
        return response.data;
    },

    updateDebt: async (id, data) => {
        const response = await api.put(`/api/finance/debts/${id}`, data);
        return response.data;
    },

    deleteDebt: async (id) => {
        const response = await api.delete(`/api/finance/debts/${id}`);
        return response.data;
    },

    addDebtPayment: async (id, data) => {
        const response = await api.post(`/api/finance/debts/${id}/payments`, data);
        return response.data;
    }
};