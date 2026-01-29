import api from './api';

export const familyService = {
    getDashboard: async () => {
        const response = await api.get('/api/family/dashboard');
        return response.data;
    },
    getDetails: async () => {
        const response = await api.get('/api/family/details');
        return response.data;
    },
    createFamily: async (name, role) => {
        const response = await api.post('/api/family/test', { name, role });
        return response.data;
    },
    joinFamily: async (inviteCode, role) => {
        const response = await api.post('/api/family/join', { inviteCode, role });
        return response.data;
    },
    assignTask: async (taskData) => {
        const response = await api.post('/api/family/tasks/assign', taskData);
        return response.data;
    },
    addGoal: async (goalData) => {
        const response = await api.post('/api/family/goals/add', goalData);
        return response.data;
    },
    updateGoalProgress: async (goalId, amount) => {
        const response = await api.post('/api/family/goals/update-progress', { goalId, amount });
        return response.data;
    }
};
