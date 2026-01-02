// src/components/Auth/AuthComponent.jsx - Beautiful Modern Authentication Component
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import {
  Phone,
  MessageCircle,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Sparkles,
  Shield,
  ArrowRight,
  Chrome,
  User,
  Camera,
  Upload
} from 'lucide-react';

const AuthComponent = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ===============================
  // STATE MANAGEMENT
  // ===============================
  const [step, setStep] = useState('phone-input'); // 'phone-input' | 'telegram-instructions' | 'otp-verify' | 'user-info' | 'create-password' | 'password-login'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // User info for registration
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const otpRefs = useRef([]);

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === 'otp-verify' && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  // ===============================
  // HELPERS
  // ===============================
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTempToken('');
    setUserExists(false);
    setResendCooldown(0);
    setUserInfo({ firstName: '', lastName: '', avatar: null });
    setAvatarPreview(null);
    clearMessages();
  };

  // ===============================
  // OTP HANDLING
  // ===============================
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all fields are filled
    if (value && index === 5) {
      const fullOtp = [...newOtp].join('');
      if (fullOtp.length === 6) {
        setTimeout(() => handleOtpSubmit(new Event('submit')), 100);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  // ===============================
  // AUTH HANDLERS
  // ===============================
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    // Basic phone validation (Uzbekistan format)
    const phoneRegex = /^\+998\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

    if (!formattedPhone || !phoneRegex.test(formattedPhone)) {
      setError('Iltimos, to\'g\'ri telefon raqamini kiriting (+998xxxxxxxxx)');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const data = await authService.checkPhone(formattedPhone);
      if (data.success) {
        if (data.userExists) {
          setUserExists(true);
          setStep('password-login');
          setSuccess('Telefon raqam topildi. Parolingizni kiriting.');
        } else {
          setUserExists(false);
          setTempToken(data.tempToken);
          setStep('telegram-instructions');
          setSuccess('Telegram botga boring va kod oling.');
        }
      } else {
        setError(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Phone check error:', err);
      setError(err.response?.data?.message || err.message || 'Telefon tekshirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('').trim();
    
    // Validate OTP format
    if (otpString.length !== 6) {
      setError('OTP kodini to\'liq kiriting');
      return;
    }
    
    if (!/^\d{6}$/.test(otpString)) {
      setError('OTP kod faqat raqamlardan iborat bo\'lishi kerak');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const data = await authService.verifyPhoneOTP(phone.startsWith('+') ? phone : `+${phone}`, otpString, tempToken);
      if (data.success) {
        setTempToken(data.tempToken);
        setStep('user-info');
        setSuccess('Telefon tasdiqlandi! Endi ma\'lumotlaringizni kiriting.');
      } else {
        setError(data.message || 'OTP kod noto\'g\'ri');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      // Network xatoliklarini tekshirish
      if (err.type === 'network' || err.message?.includes('Network Error') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError('Serverga ulanib bo\'lmadi. Iltimos, backend serverni ishga tushiring (npm start yoki node server.js)');
      } else {
        setError(err.response?.data?.message || err.message || 'Tasdiqlashda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
      setError('Ism va familiyani kiriting');
      return;
    }

    clearMessages();
    setStep('create-password');
    setSuccess('Ma\'lumotlar saqlandi. Endi parol yarating.');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Faqat rasm fayllari qabul qilinadi');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5MB dan katta bo\'lmasligi kerak');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setUserInfo({ ...userInfo, avatar: file });
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordCreate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      // Create FormData for avatar upload
      const formData = new FormData();
      formData.append('password', newPassword);
      formData.append('tempToken', tempToken);
      formData.append('firstName', userInfo.firstName.trim());
      formData.append('lastName', userInfo.lastName.trim());
      if (userInfo.avatar) {
        formData.append('avatar', userInfo.avatar);
      }

      const data = await authService.createPasswordWithInfo(formData);
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Parol yaratishda xatolik');
      }
    } catch (err) {
      console.error('Password creation error:', err);
      
      // Network xatoliklarini tekshirish
      if (err.type === 'network' || err.message?.includes('Network Error') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError('Serverga ulanib bo\'lmadi. Iltimos, backend serverni ishga tushiring (npm start yoki node server.js)');
      } else {
        setError(err.response?.data?.message || err.message || 'Parol yaratishda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Parol kiritilishi shart');
      return;
    }

    // Ensure phone number is properly formatted
    const cleanPhone = phone.replace(/\s/g, '');
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

    clearMessages();
    setLoading(true);

    try {
      const data = await authService.loginWithPhonePassword(formattedPhone, password);
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Kirishda xatolik');
      }
    } catch (err) {
      console.error('Login error:', err);

      // Network xatoliklarini tekshirish
      if (err.type === 'network' || err.message?.includes('Network Error') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError('Serverga ulanib bo\'lmadi. Iltimos, backend serverni ishga tushiring (npm start yoki node server.js)');
      } else {
        setError(err.response?.data?.message || err.message || 'Kirishda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await authService.initiateGoogleAuth();
      if (response.success && response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        setError('Google autentifikatsiya mavjud emas');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Google autentifikatsiya xatosi');
    }
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;

    clearMessages();
    setResendCooldown(30);
    setSuccess('Yangi kod olish uchun Telegram botga qaytib /start bosing va kontaktni qayta ulashing');
  };

  const handleBack = () => {
    resetForm();
    if (step === 'telegram-instructions') {
      setStep('phone-input');
    } else if (step === 'otp-verify') {
      setStep('telegram-instructions');
    } else {
      setStep('phone-input');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Animated Background - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute inset-0 bg-blue-500/5"></div>
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10 my-4 sm:my-0">
        {/* Header - smaller on mobile */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl sm:rounded-3xl mb-3 sm:mb-6 shadow-xl sm:shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
            InFast AI
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Sizning shaxsiy AI yordamchingiz</p>
        </div>

        {/* Auth Card - responsive padding */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2 animate-slide-down">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2 animate-slide-down">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Back Button */}
          {step !== 'phone-input' && (
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Orqaga
            </button>
          )}

          {/* STEP RENDERING */}
          {step === 'phone-input' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Telefon bilan kirish</h2>
                <p className="text-gray-600 dark:text-gray-400">Telefon raqamingizni kiriting</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Telefon raqam</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="+998901234567"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Tekshirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>Telegram Botga O'tish</span>
                    </>
                  )}
                </button>
              </form>

              {/* Google OAuth */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">yoki</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                Google bilan davom etish
              </button>
            </div>
          )}

          {step === 'telegram-instructions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Telegram Bot orqali tasdiqlash</h2>
                <p className="text-gray-600 dark:text-gray-400">3 daqiqa amal qiluvchi kod olish uchun:</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">1. Telegram botga o'ting</h3>
                      <p className="text-blue-800 dark:text-blue-200">
                        <a href="https://t.me/InFastAI_Register_Bot" target="_blank" rel="noopener noreferrer"
                           className="underline hover:text-blue-600 dark:hover:text-blue-300 font-medium">
                          @InFastAI_Register_Bot
                        </a> ga boring
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">2. /start bosing</h3>
                      <p className="text-blue-800 dark:text-blue-200">
                        Bot bilan suhbat boshlang va "Kontaktni ulashish" tugmasini bosing
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">3. Kodni kiriting</h3>
                      <p className="text-blue-800 dark:text-blue-200">
                        Bot sizga 6 raqamli kod beradi. Uni quyida kiriting
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('otp-verify')}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Kodni kiritishga tayyorman</span>
              </button>
            </div>
          )}


          {step === 'otp-verify' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Telefon tasdiqlash</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Telegram botdan olingan 6 raqamli kodni kiriting
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    💡 Development rejimida kodni backend konsolida ko'ring
                  </p>
                )}
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                      maxLength={1}
                      disabled={loading}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.some(d => !d)}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Tasdiqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Tasdiqlash</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Qayta yuborish ({resendCooldown}s)</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Kodni qayta yuborish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'user-info' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shaxsiy ma'lumotlar</h2>
                <p className="text-gray-600 dark:text-gray-400">Ma'lumotlaringizni kiriting</p>
              </div>

              <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 dark:border-purple-400 shadow-lg">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-900 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110"
                      title="Rasm yuklash"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rasm yuklash (ixtiyoriy)</p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ism</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={userInfo.firstName}
                        onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Ismingiz"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Familiya</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={userInfo.lastName}
                        onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Familiyangiz"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !userInfo.firstName.trim() || !userInfo.lastName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Davom etish</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'create-password' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parol yaratish</h2>
                <p className="text-gray-600 dark:text-gray-400">Akkauntingiz uchun kuchli parol yarating</p>
              </div>

              <form onSubmit={handlePasswordCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Yangi parol</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Kamida 6 ta belgi"
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Kamida 6 ta belgi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Parolni tasdiqlang</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Parolni qayta kiriting"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Yaratilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Akkaunt yaratish</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'password-login' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parol bilan kirish</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong className="text-purple-600 dark:text-purple-400">{phone}</strong> uchun parolingizni kiriting
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Parol</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Parolingizni kiriting"
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Kirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirish</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
