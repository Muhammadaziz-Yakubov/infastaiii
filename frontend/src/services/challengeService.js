// src/services/challengeService.js
import api from './api';

export const challengeService = {
  // Get all challenges for user
  getChallenges: async () => {
    const response = await api.get('/api/challenges');
    return response.data;
  },

  // Create new challenge
  createChallenge: async (data) => {
    const response = await api.post('/api/challenges', data);
    return response.data;
  },

  // Join challenge by invite code
  joinChallenge: async (inviteCode) => {
    const response = await api.post('/api/challenges/join', { inviteCode });
    return response.data;
  },

  // Get challenge details
  getChallengeDetails: async (id) => {
    const response = await api.get(`/api/challenges/${id}`);
    return response.data;
  },

  // Update daily progress
  updateProgress: async (id, data) => {
    const response = await api.put(`/api/challenges/${id}/progress`, data);
    return response.data;
  },

  // Generate new invite code
  generateInviteCode: async (id) => {
    const response = await api.post(`/api/challenges/${id}/invite`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (id) => {
    const response = await api.get(`/api/challenges/${id}/leaderboard`);
    return response.data;
  },

  // Leave challenge
  leaveChallenge: async (id) => {
    const response = await api.post(`/api/challenges/${id}/leave`);
    return response.data;
  },

  // Delete challenge
  deleteChallenge: async (id) => {
    const response = await api.delete(`/api/challenges/${id}`);
    return response.data;
  }
};

export default challengeService;
