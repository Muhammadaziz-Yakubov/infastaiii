import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Home,
  TrendingUp,
  QrCode,
  CreditCard,
  User,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
  Target,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileNew = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <button 
              onClick={() => handleNavigation('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl p-6 mb-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {user?.name || 'InFast AI User'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">Personal Account</p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">89</div>
              <div className="text-xs text-gray-500">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
          </div>
        </div>

        {/* Achievement Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Achievement Unlocked!</h3>
              <p className="text-sm opacity-90">Complete 10 goals this month</p>
            </div>
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Member ID */}
          <button
            onClick={() => handleNavigation('/profile/member-id')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="text-gray-900 font-medium block">Member ID</span>
                <span className="text-sm text-gray-500">INF-2024-{user?.id?.toString().padStart(4, '0') || '0001'}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNavigation('/settings')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-gray-900 font-medium">Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Privacy & Security */}
          <button
            onClick={() => handleNavigation('/profile/privacy')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-900 font-medium">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Help Center */}
          <button
            onClick={() => handleNavigation('/help')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-900 font-medium">Help Center</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-red-600 font-medium">Log Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            {[
              { icon: Home, label: 'Home', active: false },
              { icon: TrendingUp, label: 'Insights', active: false },
              { icon: QrCode, label: 'Scan', active: false },
              { icon: CreditCard, label: 'Cards', active: false },
              { icon: User, label: 'Profile', active: true },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  item.active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNew;
