import React, { useState, useEffect } from 'react';
import { 
  Bell, Clock, CheckCircle, Trash2, CheckSquare, 
  AlertCircle, MessageSquare, ExternalLink, RefreshCw,
  Filter, Search, X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
      toast.error('Bildirishnomalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, status: 'read', readAt: new Date() } : n
        ));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => n.status !== 'read').map(n => n._id);
      for (const id of unreadIds) {
        await api.put(`/api/notifications/${id}/read`);
      }
      setNotifications(notifications.map(n => ({ ...n, status: 'read', readAt: new Date() })));
      toast.success('Barcha bildirishnomalar o\'qildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
        if (selectedNotification?._id === notificationId) {
          setSelectedNotification(null);
        }
        toast.success('Bildirishnoma o\'chirildi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const deleteAllRead = async () => {
    try {
      const readIds = notifications.filter(n => n.status === 'read').map(n => n._id);
      for (const id of readIds) {
        await api.delete(`/api/notifications/${id}`);
      }
      setNotifications(notifications.filter(n => n.status !== 'read'));
      toast.success('O\'qilgan bildirishnomalar o\'chirildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'debt_reminder':
      case 'debt_overdue':
        return <Clock className="w-5 h-5" />;
      case 'system':
        return <AlertCircle className="w-5 h-5" />;
      case 'announcement':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high' || priority === 'critical') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    }
    switch(type) {
      case 'debt_reminder':
      case 'debt_overdue':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'system':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'announcement':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Hozirgina';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} daqiqa oldin`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} soat oldin`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} kun oldin`;
    
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'announcement': return "E'lon";
      case 'system': return 'Tizim';
      case 'debt_reminder': return 'Qarz eslatmasi';
      case 'debt_overdue': return 'Muddati o\'tgan';
      default: return 'Bildirishnoma';
    }
  };

  // Extract link from message
  const extractLink = (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.match(urlRegex);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status !== 'read';
    if (filter === 'read') return n.status === 'read';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('notifications.title')}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.allRead')}
            </p>
          </div>
          <button
            onClick={loadNotifications}
            className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-white hover:bg-gray-100 text-gray-600'} transition-colors shadow-sm`}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters and Actions */}
        <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? t('common.all') : f === 'unread' ? t('notifications.unread') : t('notifications.read')}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t('notifications.markAllRead')}
              </button>
            )}
            {notifications.some(n => n.status === 'read') && (
              <button
                onClick={deleteAllRead}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('notifications.deleteRead')}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className={`w-10 h-10 animate-spin mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('common.loading')}</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {filter === 'all' ? 'Bildirishnomalar yo\'q' : filter === 'unread' ? 'O\'qilmagan xabar yo\'q' : 'O\'qilgan xabar yo\'q'}
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Yangi xabarlar shu yerda paydo bo'ladi
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const links = extractLink(notification.message);
              
              return (
                <div
                  key={notification._id}
                  onClick={() => {
                    markAsRead(notification._id);
                    setSelectedNotification(notification);
                  }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] ${
                    isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                  } shadow-sm ${notification.status !== 'read' ? 'ring-2 ring-blue-500/50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                              {getTypeLabel(notification.type)}
                            </span>
                            {notification.status !== 'read' && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          {links && links.length > 0 && (
                            <a
                              href={links[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 mt-2 text-blue-500 hover:text-blue-600 font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Havolani ochish
                            </a>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700 text-gray-500 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.status === 'read' && (
                          <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            <CheckCircle className="w-3 h-3" />
                            O'qilgan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <div 
              className={`max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/20">
                      {getNotificationIcon(selectedNotification.type)}
                    </div>
                    <div>
                      <span className="text-xs font-medium opacity-75 uppercase tracking-wide">
                        {getTypeLabel(selectedNotification.type)}
                      </span>
                      <h3 className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedNotification.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className={`text-base leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedNotification.message}
                </p>
                
                {extractLink(selectedNotification.message) && (
                  <div className="mt-4">
                    {extractLink(selectedNotification.message).map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Havolaga o'tish
                      </a>
                    ))}
                  </div>
                )}
                
                <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                      {formatDate(selectedNotification.createdAt)}
                    </span>
                    {selectedNotification.status === 'read' ? (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        O'qilgan
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Bell className="w-4 h-4" />
                        Yangi
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`px-6 pb-6 flex gap-3`}>
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification._id);
                  }}
                  className="flex-1 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  O'chirish
                </button>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className={`flex-1 py-3 rounded-xl transition-colors font-medium ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
