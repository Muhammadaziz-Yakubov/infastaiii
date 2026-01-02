// src/pages/AuthCallback.jsx - Google OAuth Callback Handler
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Google autentifikatsiya bekor qilindi');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('Token mavjud emas');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Process the callback - store token
        authService.processGoogleCallback(token);

        // Fetch complete user profile
        const profileData = await authService.getProfile();

        if (profileData.success && profileData.user) {
          // Log in with complete user data
          login(profileData.user, token);
        } else {
          throw new Error('User profile not found');
        }

        setStatus('success');
        setMessage('Google orqali kirish muvaffaqiyatli!');

        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('Google autentifikatsiya xatosi');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md text-center">
        {/* Status Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg">
          {status === 'loading' && (
            <div className="bg-blue-500/20 rounded-full p-4">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="bg-green-500/20 rounded-full p-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-500/20 rounded-full p-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'loading' && 'Google autentifikatsiya...'}
          {status === 'success' && 'Muvaffaqiyatli!'}
          {status === 'error' && 'Xatolik'}
        </h1>

        {/* Message */}
        <p className="text-gray-400 mb-6">
          {message}
        </p>

        {/* Loading Bar */}
        {status === 'loading' && (
          <div className="w-full bg-white/10 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Action Text */}
        <p className="text-sm text-gray-500">
          {status === 'loading' && 'Iltimos, kuting...'}
          {status === 'success' && 'Sizni dashboard ga yo\'naltiramiz...'}
          {status === 'error' && 'Kirish sahifasiga qaytarilmoqdasiz...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
