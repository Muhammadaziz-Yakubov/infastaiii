import React, { useState, useEffect } from 'react';
import { useTheme, platformColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings as SettingsIcon,
  Moon, 
  Sun,
  Palette,
  Check,
  Monitor,
  Smartphone,
  Trash2,
  Mail,
  AlertTriangle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { isDark, toggleTheme, primaryColor, setColor, colorConfig } = useTheme();
  const { logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Windows PC',
      browser: 'Chrome',
      location: 'Tashkent, Uzbekistan',
      lastActive: 'Hozir',
      current: true,
      icon: 'monitor'
    },
    {
      id: 2,
      device: 'iPhone 13',
      browser: 'Safari',
      location: 'Tashkent, Uzbekistan',
      lastActive: '2 soat oldin',
      current: false,
      icon: 'smartphone'
    }
  ]);

  useEffect(() => {
    // Load email notification settings from localStorage
    const savedEmailNotif = localStorage.getItem('emailNotifications');
    if (savedEmailNotif !== null) {
      setEmailNotifications(JSON.parse(savedEmailNotif));
    }
  }, []);

  const handleEmailNotificationToggle = () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    localStorage.setItem('emailNotifications', JSON.stringify(newValue));
    toast.success(newValue ? 'Email bildirishnomalar yoqildi' : 'Email bildirishnomalar o\'chirildi');
  };

  const handleLogoutSession = (sessionId) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
    toast.success('Sessiya tugatildi');
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Backend API call to delete account
      toast.success('Hisob o\'chirildi');
      setShowDeleteModal(false);
      setTimeout(() => {
        logout();
      }, 1000);
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  return (
    <div className="w-full space-y-4 lg:space-y-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 lg:gap-4">
          <div 
            className="p-2.5 lg:p-3 rounded-xl lg:rounded-2xl shadow-lg"
            style={{ backgroundColor: colorConfig?.primary || '#3B82F6' }}
          >
            <SettingsIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Sozlamalar</h1>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Ilovani shaxsiylashtiring</p>
          </div>
        </div>
      </div>

      {/* Tema - Och/Qora */}
      <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 dark:bg-gray-700 rounded-xl lg:rounded-2xl flex items-center justify-center">
            {isDark ? <Moon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-500" /> : <Sun className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />}
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Tema</h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Och yoki qora rejim</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              !isDark 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl shadow-md flex items-center justify-center">
              <Sun className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-500" />
            </div>
            <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Och</span>
            {!isDark && <Check className="w-4 h-4 text-blue-500" />}
          </button>
          
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              isDark 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-800 rounded-xl shadow-md flex items-center justify-center">
              <Moon className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-400" />
            </div>
            <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Qora</span>
            {isDark && <Check className="w-4 h-4 text-blue-500" />}
          </button>
        </div>
      </div>
      {/* Active Sessions */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl lg:rounded-2xl flex items-center justify-center">
            <Monitor className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Faol Sessiyalar</h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{activeSessions.length} ta qurilma</p>
          </div>
        </div>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {session.icon === 'monitor' ? (
                    <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                      {session.device}
                    </h4>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                        Joriy
                      </span>
                    )}
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {session.lastActive}
                  </p>
                </div>
              </div>
              
              {!session.current && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="px-3 py-1.5 text-xs lg:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                >
                  Chiqish
                </button>
              )}
            </div>
          ))}
        </div>
      </div> */}

      {/* Delete Account */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-red-200 dark:border-red-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl lg:rounded-2xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-red-600 dark:text-red-400">Hisobni O'chirish</h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Bu amalni qaytarib bo'lmaydi</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Hisobingizni o'chirsangiz, barcha ma'lumotlaringiz butunlay o'chiriladi va qayta tiklab bo'lmaydi.
        </p>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
        >
          Hisobni O'chirish
        </button>
      </div> */}

      {/* Delete Confirmation Modal */}
      {/* {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hisobni O'chirish</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bu amalni qaytarib bo'lmaydi</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Hisobingizni o'chirmoqchimisiz?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Barcha maqsadlar, vazifalar va moliyaviy ma'lumotlar butunlay o'chiriladi.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Ilova haqida */}
    </div>
  );
};

export default Settings;