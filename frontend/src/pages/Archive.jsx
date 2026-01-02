// src/pages/Archive.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Archive as ArchiveIcon, Trash2, RefreshCw, Calendar, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { archiveService } from '../services/archiveService';

const Archive = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Yangilash uchun

  const loadArchives = useCallback(async () => {
    try {
      const data = await archiveService.getArchives();
      if (data.success) {
        setArchives(data.archives || []);
      } else {
        toast.error(data.message || 'Arxivni yuklashda xatolik');
      }
    } catch (error) {
      console.error('Load archives error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Arxivni yuklashda xatolik';
      
      // Network xatoliklarini tekshirish
      if (error.type === 'network' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Serverga ulanib bo\'lmadi. Iltimos, backend serverni ishga tushiring');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchives();
    
    // Sahifa ko'rinayotganda har 30 sekundda yangilash (2 sekund juda tez)
    const interval = setInterval(() => {
      loadArchives();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadArchives]);

  const handleDelete = async (id) => {
    if (!window.confirm('Arxivdan o\'chirishni xohlaysizmi?')) return;
    
    try {
      const data = await archiveService.deleteArchive(id);
      if (data.success) {
        loadArchives();
        toast.success('Arxivdan o\'chirildi');
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(errorMessage);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Vazifani qayta tiklashni xohlaysizmi?')) return;
    
    try {
      const data = await archiveService.restoreArchive(id);
      if (data.success) {
        loadArchives();
        toast.success('Vazifa qayta tiklandi');
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Restore error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(errorMessage);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Past' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'O\'rta' },
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'Yuqori' }
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Arxiv</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {archives.length} ta bajarilgan vazifa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadArchives}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </button>
          <div className="flex items-center gap-2 text-green-600">
            <ArchiveIcon className="w-6 h-6" />
            <span className="font-semibold">Tugatilgan</span>
          </div>
        </div>
      </div>

      {archives.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <ArchiveIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Arxiv bo'sh</h3>
          <p className="text-gray-500 dark:text-gray-400">Bajarilgan vazifalar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex-1 line-through opacity-75">
                  {item.title}
                </h3>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleRestore(item._id)}
                    className="p-2 hover:bg-blue-50 rounded-lg"
                    title="Qayta tiklash"
                  >
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  ✓ Tugatildi
                </span>
                {getPriorityBadge(item.priority)}
              </div>

              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {item.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Muddat: {new Date(item.deadline).toLocaleDateString('uz-UZ')}</span>
                  </div>
                )}
                {item.completedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Tugatildi: {new Date(item.completedAt).toLocaleDateString('uz-UZ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;