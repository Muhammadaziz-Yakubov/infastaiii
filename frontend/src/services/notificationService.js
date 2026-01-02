import api from './api';

export const notificationService = {
  // Get notifications
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/api/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all notifications
  clearAll: async () => {
    const response = await api.delete('/api/notifications');
    return response.data;
  },

  // Subscribe to real-time notifications
  subscribe: (onNotification) => {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'notification') {
      onNotification(data.notification);
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return () => socket.close();
}

};