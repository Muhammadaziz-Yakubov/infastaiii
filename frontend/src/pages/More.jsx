import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, User, Settings, Archive, Crown, HelpCircle,
  ChevronRight, Shield, Bell, Palette, LogOut, Star,
  FileText, MessageCircle, Heart, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const More = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuSections = [
    {
      title: 'Sahifalar',
      items: [
        {
          name: 'Challengelar',
          description: 'Do\'stlar bilan birga odat shakllantiring',
          icon: Trophy,
          href: '/challenges',
          color: 'bg-orange-500',
          badge: 'Tez Kunda',
          disabled: true
        }
      ]
    },
    {
      title: 'Hisob',
      items: [
        {
          name: 'Profil',
          description: 'Shaxsiy ma\'lumotlar',
          icon: User,
          href: '/profile',
          color: 'bg-blue-500'
        },
        {
          name: 'Sozlamalar',
          description: 'Ilova sozlamalari',
          icon: Settings,
          href: '/settings',
          color: 'bg-gray-600'
        }
      ]
    }
  ];

  const handleLogout = async () => {
    if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
      await logout();
      navigate('/auth');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 sm:pb-8 px-4 sm:px-6">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ko'proq</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Qo'shimcha sahifalar va sozlamalar</p>
      </div>

      {/* User Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img 
                src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'https://infastaiii.onrender.com'}${user.avatar}`} 
                alt={user.firstName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className={`text-2xl font-bold ${user?.avatar ? 'hidden' : 'flex'}`}>
              {(user?.firstName || 'U').charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h2>
            <p className="text-white/80 text-sm">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
            {section.title}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => !item.disabled && navigate(item.href)}
                  className={`w-full flex items-center gap-4 p-4 transition-all text-left ${
                    item.disabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs font-semibold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                  </div>
                  {!item.disabled && <ChevronRight className="w-5 h-5 text-gray-400" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Theme Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Qorong'u rejim</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tungi ko'rinish</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
              isDark ? 'bg-indigo-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                isDark ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Chiqish
      </button>

    </div>
  );
};

export default More;
