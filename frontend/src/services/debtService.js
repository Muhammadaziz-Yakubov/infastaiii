import api from './api';

export const debtService = {
    // Qarzlarni olish
    getDebts: async () => {
        try {
            const response = await api.get('/finance/debts');
            return response.data;
        } catch (error) {
            console.error('Get debts error:', error);
            throw error;
        }
    },

    // Qarz yaratish
    createDebt: async (debtData) => {
        try {
            const response = await api.post('/finance/debts', debtData);
            return response.data;
        } catch (error) {
            console.error('Create debt error:', error);
            throw error;
        }
    },

    // Qarz yangilash
    updateDebt: async (id, debtData) => {
        try {
            const response = await api.put(`/finance/debts/${id}`, debtData);
            return response.data;
        } catch (error) {
            console.error('Update debt error:', error);
            throw error;
        }
    },

    // Qarz o'chirish
    deleteDebt: async (id) => {
        try {
            const response = await api.delete(`/finance/debts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete debt error:', error);
            throw error;
        }
    },

    // Qarzga to'lov qo'shish
    addDebtPayment: async (debtId, paymentData) => {
        try {
            const response = await api.post(`/finance/debts/${debtId}/payments`, paymentData);
            return response.data;
        } catch (error) {
            console.error('Add debt payment error:', error);
            throw error;
        }
    }
};

