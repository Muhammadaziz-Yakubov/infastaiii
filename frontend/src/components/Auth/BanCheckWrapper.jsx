import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

const BanCheckWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        // Check user ban status from backend
        const response = await api.get('/api/user/profile');
        
        if (response.data.success && response.data.user.isBanned) {
          // User is banned - logout and redirect
          logout();
          navigate('/banned', { replace: true });
        }
      } catch (error) {
        // If 403 error (banned), redirect to banned page
        if (error.response?.status === 403) {
          logout();
          navigate('/banned', { replace: true });
        }
      } finally {
        setChecking(false);
      }
    };

    checkBanStatus();
  }, [user, navigate, logout]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default BanCheckWrapper;
