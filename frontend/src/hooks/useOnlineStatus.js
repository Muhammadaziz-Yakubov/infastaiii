import { useState, useEffect, useCallback } from 'react';
import { 
  getPendingSync, 
  removePendingSync,
  STORES 
} from '../utils/offlineStorage';
import api from '../services/api';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Online/Offline holatini kuzatish
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Online bo'lganda avtomatik sync
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Dastlabki pending count ni olish
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pending count ni yangilash
  const updatePendingCount = async () => {
    const pending = await getPendingSync();
    setPendingCount(pending.length);
  };

  // Pending o'zgarishlarni sinxronlash
  const syncPendingChanges = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    
    try {
      const pendingActions = await getPendingSync();
      
      for (const action of pendingActions) {
        try {
          await processAction(action);
          await removePendingSync(action.id);
        } catch (error) {
          console.error('Sync xatolik:', action, error);
          // Xatolik bo'lsa davom etamiz, keyinroq qayta urinib ko'ramiz
        }
      }

      await updatePendingCount();
    } catch (error) {
      console.error('Sync jarayonida xatolik:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Action ni serverga yuborish
  const processAction = async (action) => {
    const { type, method, endpoint, data } = action;

    switch (method) {
      case 'POST':
        await api.post(endpoint, data);
        break;
      case 'PUT':
        await api.put(endpoint, data);
        break;
      case 'DELETE':
        await api.delete(endpoint);
        break;
      case 'PATCH':
        await api.patch(endpoint, data);
        break;
      default:
        console.warn('Noma\'lum method:', method);
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncPendingChanges,
    updatePendingCount,
  };
};

export default useOnlineStatus;
