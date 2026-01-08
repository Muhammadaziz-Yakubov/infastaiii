import api from './api';

export const infastAIService = {
  // Telegram ulash kodi yaratish
  generateLinkCode: async () => {
    const response = await api.post('/api/infast-ai/generate-link-code');
    return response.data;
  },

  // Telegram ulanish holatini tekshirish
  getStatus: async () => {
    const response = await api.get('/api/infast-ai/status');
    return response.data;
  },

  // Telegram ulanishni uzish
  unlink: async () => {
    const response = await api.post('/api/infast-ai/unlink');
    return response.data;
  },

  // Eslatma sozlamalarini yangilash
  updateNotifications: async (settings) => {
    const response = await api.put('/api/infast-ai/notifications', settings);
    return response.data;
  },

  // Test eslatma yuborish
  sendTestNotification: async () => {
    const response = await api.post('/api/infast-ai/test-notification');
    return response.data;
  },

  // Bot health check
  healthCheck: async () => {
    const response = await api.get('/api/infast-ai/health');
    return response.data;
  }
};

export default infastAIService;
