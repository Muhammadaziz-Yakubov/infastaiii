import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import adminService from '../services/adminService';

export const useAdminStore = create(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminUser: null,
      adminToken: null,

      adminLogin: async (username, password) => {
        try {
          const response = await adminService.login(username, password);
          if (response.success) {
            localStorage.setItem('adminToken', response.token);
            set({ 
              isAdminAuthenticated: true, 
              adminUser: response.user,
              adminToken: response.token
            });
            return { success: true };
          }
          return { success: false, error: response.message || 'Noto\'g\'ri ma\'lumotlar' };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Serverga ulanishda xatolik' 
          };
        }
      },

      adminLogout: () => {
        localStorage.removeItem('adminToken');
        set({ isAdminAuthenticated: false, adminUser: null, adminToken: null });
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ 
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUser: state.adminUser,
        adminToken: state.adminToken
      }),
    }
  )
);
