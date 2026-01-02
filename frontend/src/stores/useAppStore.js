import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Zustand store for global state management
export const useAppStore = create(
  persist(
    (set) => ({
      // User preferences
      theme: 'light',
      language: 'uz',
      sidebarOpen: true,
      
      // UI state
      notifications: [],
      searchQuery: '',
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      addNotification: (notification) => 
        set((state) => ({ 
          notifications: [...state.notifications, notification] 
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

