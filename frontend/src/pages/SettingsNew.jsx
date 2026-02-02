import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowLeft,
  User,
  Link as LinkIcon,
  Bell,
  Moon as MoonIcon,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Accounts Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Accounts</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Personal Details */}
            <button
              onClick={() => handleNavigation('/profile/personal-details')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-900 font-medium">Personal Details</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <div className="border-t border-gray-100"></div>

            {/* Linked Accounts */}
            <button
              onClick={() => handleNavigation('/profile/linked-accounts')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-900 font-medium">Linked Accounts</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* General Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">General</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Notifications */}
            <button
              onClick={() => handleNavigation('/settings/notifications')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-900 font-medium">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <div className="border-t border-gray-100"></div>

            {/* Appearance */}
            <button
              onClick={() => handleNavigation('/settings/appearance')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <MoonIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-gray-900 font-medium">Appearance</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <div className="border-t border-gray-100"></div>

            {/* Agreements */}
            <button
              onClick={() => handleNavigation('/settings/agreements')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-gray-900 font-medium">Agreements</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Version 1.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsNew;
