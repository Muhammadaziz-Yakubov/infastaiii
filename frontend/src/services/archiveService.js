import api from './api';

export const archiveService = {
  getArchives: async () => {
    const response = await api.get('/api/archive');
    return response.data;
  },
  getArchiveStats: async () => {
    const response = await api.get('/api/archive/stats');
    return response.data;
  },
  restoreArchive: async (id) => {
    const response = await api.post(`/api/archive/${id}/restore`);
    return response.data;
  },
  deleteArchive: async (id) => {
    const response = await api.delete(`/api/archive/${id}`);
    return response.data;
  }
};
