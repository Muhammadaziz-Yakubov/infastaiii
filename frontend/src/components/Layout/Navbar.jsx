import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, X, Clock, CheckSquare, User, MessageSquare, Loader, Menu, CheckCircle, Trash2, Moon, Sun, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearch } from '../../contexts/SearchContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getGreeting, getInitials, formatDate, formatTimeAgo } from '../../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    isSearching, 
    performSearch, 
    clearSearch 
  } = useSearch();
  
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Ekran o'lchamini aniqlash
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Notificationlarni yuklash (disabled)
  // useEffect(() => {
  //   loadNotifications();
  //
  //   // Har 30 soniyada yangilash
  //   const interval = setInterval(loadNotifications, 30000);
  //
  //   return () => clearInterval(interval);
  // }, []);


  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.trim() === '') {
      clearSearch();
      return;
    }

    const delayDebounce = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get('/api/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
      // Silently fail - notifications are optional
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(notifications.map(notif => 
          notif._id === notificationId 
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        ));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.status !== 'read')
        .map(n => n._id);
      
      for (const id of unreadIds) {
        await markAsRead(id);
      }
      
      toast.success('Barcha bildirishnomalar o\'qildi');
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
        toast.success('Bildirishnoma o\'chirildi');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setShowNotifications(false);
    
    // Notification turiga qarab navigate qilish
    if (notification.data?.debtId) {
      navigate('/finance/debts');
    } else if (notification.data?.taskId) {
      navigate(`/tasks/${notification.data.taskId}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'debt_reminder':
        return <Clock className="w-4 h-4" />;
      case 'task_assigned':
        return <CheckSquare className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'text-red-500';
      case 'critical':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getNotificationBgColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'critical':
        return 'bg-red-200 dark:bg-red-900/50';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      setShowResults(true);
    }
  };

  const handleClearSearch = () => {
    clearSearch();
    setSearchQuery('');
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery('');
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  // ESC key to close results
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowResults(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Left section with Dark Mode Toggle (Mobile) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Dark Mode Toggle - Only visible on mobile */}
          <button
            onClick={toggleTheme}
            className="lg:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
          
        </div>

        {/* Center section with Search */}
        <div className={`flex-1 mx-4 ${isMobile ? 'max-w-lg' : 'max-w-2xl'}`} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
              placeholder="Qidirish..."
              className="w-full pl-9 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-transparent rounded-lg sm:rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 outline-none transition-all text-sm sm:text-base"
            />
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                {/* Loading State */}
                {isSearching ? (
                  <div className="p-8 text-center">
                    <Loader className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Qidirilmoqda...</p>
                  </div>
                ) : (
                  <>
                    {/* Tasks Results */}
                    {searchResults.tasks?.length > 0 && (
                      <div className="border-b border-gray-100 dark:border-gray-700">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Vazifalar ({searchResults.tasks.length})
                          </h3>
                        </div>
                        <div>
                          {searchResults.tasks.map(task => (
                            <Link
                              key={task._id}
                              to={`/tasks/${task._id}`}
                              onClick={handleResultClick}
                              className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="flex-shrink-0 mt-1">
                                {getTaskStatusIcon(task.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(task.createdAt)}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    task.status === 'completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : task.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {task.status === 'completed' ? 'Tugatildi' : 
                                     task.status === 'in_progress' ? 'Jarayonda' : 'Kutilmoqda'}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Results */}
                    {searchResults.users?.length > 0 && (
                      <div className="border-b border-gray-100 dark:border-gray-700">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Foydalanuvchilar ({searchResults.users.length})
                          </h3>
                        </div>
                        <div>
                          {searchResults.users.map(user => (
                            <Link
                              key={user._id}
                              to={`/users/${user._id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {user.firstName} {user.lastName}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {user.email || user.phone || 'Foydalanuvchi'}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {user.role}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {(!searchResults.tasks || searchResults.tasks.length === 0) && 
                     (!searchResults.users || searchResults.users.length === 0) && (
                      <div className="p-8 text-center">
                        <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Hech narsa topilmadi</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          "{searchQuery}" bo'yicha natija yo'q
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Search Tips */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mr-1">Enter</kbd>
                    Tanlash • 
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mx-1">ESC</kbd>
                    Yopish • 
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">↑↓</kbd>
                    Navigatsiya
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right section with Notifications and User */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Bildirishnomalar</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        Barchasini o'qilgan deb belgilash
                      </button>
                    )}
                  </div>
                </div>
                
                {loadingNotifications ? (
                  <div className="p-8 text-center">
                    <Loader className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Bildirishnomalar yo'q</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Yangi xabarlar shu yerda paydo bo'ladi
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-dark-700">
                    {notifications.map(notification => (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors cursor-pointer ${
                          notification.status !== 'read' ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getNotificationBgColor(notification.priority)}`}>
                            <div className={getNotificationColor(notification.priority)}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1">
                                {notification.status !== 'read' && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                                <button
                                  onClick={(e) => deleteNotification(notification._id, e)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                                  aria-label="Delete notification"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {notification.priority === 'high' && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                  Muhim
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {notifications.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <Link 
                      to="/notifications"
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 text-center block"
                      onClick={() => setShowNotifications(false)}
                    >
                      Barcha bildirishnomalarni ko'rish
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile with Dropdown */}
          <div className="relative flex items-center gap-3 pl-3 sm:pl-4 border-l border-gray-200 dark:border-dark-800" ref={profileMenuRef}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getGreeting()}, {user?.firstName}!
              </p>
            </div>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-purple-500 dark:border-purple-400 shadow-lg cursor-pointer hover:opacity-90 transition-opacity bg-blue-500">
                {user?.avatar ? (
                  <img 
                    key={user.avatar} // Force re-render when avatar changes
                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`}
                    alt={user?.firstName || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Avatar loading failed - fallback to initials (no console error needed)
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.navbar-avatar-fallback');
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base navbar-avatar-fallback ${user?.avatar ? 'hidden' : ''}`}>
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500 dark:border-purple-400">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`}
                          alt={user?.firstName || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      {!user?.avatar && (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {getInitials(user?.firstName, user?.lastName)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName || user?.phone?.slice(-4) || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || user?.phone || ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profil</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Sozlamalar</span>
                  </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;