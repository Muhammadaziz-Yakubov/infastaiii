import React from 'react';
import { WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import useOnlineStatus from '../hooks/useOnlineStatus';

const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingCount, syncPendingChanges } = useOnlineStatus();

  // Online va hech narsa pending bo'lmasa ko'rsatmaymiz
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50">
      {!isOnline ? (
        // Offline holat
        <div className="bg-gray-800 dark:bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Internet yo'q</p>
            <p className="text-xs text-gray-400">
              O'zgarishlar saqlanmoqda ({pendingCount} ta)
            </p>
          </div>
          <CloudOff className="w-5 h-5 text-gray-500" />
        </div>
      ) : isSyncing ? (
        // Syncing holat
        <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Sinxronlanmoqda...</p>
            <p className="text-xs text-blue-200">
              {pendingCount} ta o'zgarish yuklanmoqda
            </p>
          </div>
          <Cloud className="w-5 h-5 text-blue-200" />
        </div>
      ) : pendingCount > 0 ? (
        // Pending changes bor
        <button
          onClick={syncPendingChanges}
          className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">Sinxronlash kerak</p>
            <p className="text-xs text-yellow-100">
              {pendingCount} ta o'zgarish kutmoqda
            </p>
          </div>
          <RefreshCw className="w-5 h-5" />
        </button>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
