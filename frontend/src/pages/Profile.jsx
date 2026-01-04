import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Lock, AlertTriangle, CheckCircle, Eye, EyeOff, Edit3, Camera, X, Upload, Phone, Zap, Crown, Calendar } from 'lucide-react';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Fetch fresh profile data on component mount and when activeTab changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        console.log('Profile data fetched:', data.user?.subscriptionType, data.user?.subscriptionEndDate);
        if (data.success && isMounted) {
          updateUser(data.user);
          // Update formData with fresh user data
          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            phone: data.user.phone || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    });
    setError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Ism va familiyani kiriting');
      toast.error('Ism va familiyani kiriting');
      return;
    }

    try {
      setLoading(true);
      const data = await userService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined
      });

      if (data.success) {
        updateUser({ ...user, ...data.user });
        setSuccess('Profil yangilandi');
        toast.success('Profil muvaffaqiyatli yangilandi');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Xatolik yuz berdi');
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Profilni yangilashda xatolik:', err);
      setError(err.response?.data?.message || 'Server xatosi');
      toast.error('Server xatosi');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllari qabul qilinadi');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan katta bo\'lmasligi kerak');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        console.log('Avatar uploaded successfully:', data.avatar);
        
        // Fetch fresh profile to ensure all data is up to date
        try {
          const profileData = await userService.getProfile();
          if (profileData.success) {
            console.log('Updated user profile:', profileData.user);
            updateUser(profileData.user);
            localStorage.setItem('user', JSON.stringify(profileData.user));
          }
        } catch (profileError) {
          console.error('Failed to fetch updated profile:', profileError);
          // Fallback: update with the response data
          const updatedUser = { ...user, avatar: data.avatar };
          updateUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        toast.success('Rasm muvaffaqiyatli yuklandi');
      } else {
        toast.error(data.message || 'Rasm yuklashda xatolik');
      }
    } catch (err) {
      console.error('Rasm yuklashda xatolik:', err);
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yangi parollar mos kelmayapti');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      setLoading(true);
      const data = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (data.success) {
        setSuccess('Parol muvaffaqiyatli o\'zgartirildi');
        toast.success('Parol muvaffaqiyatli o\'zgartirildi');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswords({ current: false, new: false, confirm: false });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Xatolik yuz berdi');
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Parolni o\'zgartirishda xatolik:', err);
      setError(err.response?.data?.message || 'Server xatosi');
      toast.error('Server xatosi');
    } finally {
      setLoading(false);
    }
  };

  const fullName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.phone?.slice(-4) || user?.email?.split('@')[0] || 'Ism';

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.phone) {
      return user.phone.slice(-1).toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const PasswordField = ({ label, name, value, onChange, showPassword = false, onToggle }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 dark:text-white transition-all hover:border-gray-300 dark:hover:border-gray-500"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 dark:from-purple-700 dark:via-purple-800 dark:to-indigo-800 rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-200 shadow-lg bg-white dark:bg-gray-800">
              {user?.avatar ? (
                <img 
                  key={user.avatar} // Force re-render when avatar changes
                  src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-white dark:bg-gray-800 flex items-center justify-center text-purple-600 dark:text-purple-400 text-4xl font-bold avatar-fallback ${user?.avatar ? 'hidden' : ''}`}>
                {getInitials()}
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-900 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rasm yuklash"
            >
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {fullName}
            </h1>
            <p className="text-purple-100 dark:text-purple-200 text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
              {user?.email ? (
                <>
                  <Mail className="w-5 h-5" />
                  {user.email}
                  {user?.emailVerified && (
                    <CheckCircle className="w-5 h-5 text-green-300" title="Email tasdiqlangan" />
                  )}
                </>
              ) : user?.phone ? (
                <>
                  <Phone className="w-5 h-5" />
                  {user.phone}
                  <CheckCircle className="w-5 h-5 text-green-300" title="Telefon tasdiqlangan" />
                </>
              ) : null}
            </p>
            {/* {user?.subscriptionType === 'premium' ? (
              <button
                onClick={() => setActiveTab('subscription')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-400/50 hover:from-yellow-500/40 hover:to-orange-500/40 transition-all cursor-pointer"
              >
                <Crown className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">Pro Obuna</span>
                <span className="text-yellow-200 text-xs">→ Batafsil</span>
              </button>
            ) : ( */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-purple-100 dark:text-purple-200 text-sm">Obuna:</span>
                  <span className="text-white font-semibold">Free</span>
                </div>
                {/* <button
                  onClick={() => navigate('/pricing')}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg"
                > */}
                  {/* <Zap className="w-4 h-4" />
                  Pro ga o'tish
                </button> */}
              </div>
            {/* )} */}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-3 animate-slide-down">
          <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-300 font-medium">{success}</p>
        </div>
      )}

      {/* Tabs */}


      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shaxsiy ma'lumotlar</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Tahrirlash
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ism
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 dark:text-white transition-all hover:border-gray-300 dark:hover:border-gray-500"
                        placeholder="Ismingiz"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Familiya
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 dark:text-white transition-all hover:border-gray-300 dark:hover:border-gray-500"
                        placeholder="Familiyangiz"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Telefon raqam
                      {user?.authProvider === 'phone' && (
                        <span className="ml-2 text-xs text-gray-500">(o'zgartirib bo'lmaydi)</span>
                      )}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all ${
                          user?.authProvider === 'phone' || loading
                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        placeholder="+998901234567"
                        disabled={loading || user?.authProvider === 'phone'}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Saqlash
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Ism
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-medium">
                      {user?.firstName || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Familiya
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-medium">
                      {user?.lastName || '-'}
                    </p>
                  </div>

                  {user?.email && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Email
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white font-medium flex items-center gap-2">
                        {user.email}
                        {user?.emailVerified && (
                          <CheckCircle className="w-5 h-5 text-green-500" title="Email tasdiqlangan" />
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Telefon raqam
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-medium flex items-center gap-2">
                      {user?.phone || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parolni o'zgartirish</h2>
            </div>

            <div className="space-y-6">
              <PasswordField
                label="Joriy parol"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                showPassword={showPasswords.current}
                onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              />

              <PasswordField
                label="Yangi parol"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                showPassword={showPasswords.new}
                onToggle={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              />

              <PasswordField
                label="Yangi parolni tasdiqlash"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                showPassword={showPasswords.confirm}
                onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Eslatma:</strong> Parol kamida 8 ta belgidan iborat bo'lishi kerak.
                Katta va kichik harflar, raqamlar va maxsus belgilardan foydalanish tavsiya etiladi.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    O'zgartirilmoqda...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Parolni o'zgartirish
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Subscription Tab - Telegram Premium Style */}
        {activeTab === 'subscription' && user?.subscriptionType === 'premium' && (
          <div className="space-y-6">
            {/* Premium Header - Telegram Style */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
              
              <div className="relative z-10">
                {/* Star icon with glow */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-center mb-2">InFast Pro</h2>
                <p className="text-purple-200 text-center mb-6">Premium imkoniyatlar sizniki!</p>
                
                {/* Status badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-medium">Obuna faol</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tugash sanasi</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.subscriptionEndDate 
                    ? new Date(user.subscriptionEndDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-2xl p-5 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Qolgan vaqt</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.subscriptionEndDate 
                    ? `${Math.max(0, Math.ceil((new Date(user.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))} kun`
                    : '—'}
                </p>
              </div>
            </div>

            {/* Pro Features - Telegram Style */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Pro imkoniyatlari
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  { icon: '🚀', title: 'Cheksiz vazifalar', desc: 'Istalgancha vazifa yarating' },
                  { icon: '🤖', title: 'AI yordamchi', desc: 'Sun\'iy intellekt bilan vazifa qo\'shing' },
                  { icon: '🏆', title: 'Challenge tizimi', desc: 'Kunlik va haftalik musobaqalar' },
                  { icon: '👨‍👩‍👧‍👦', title: 'Oila rejimi', desc: 'Oila a\'zolari bilan birga ishlang' },
                  { icon: '📊', title: 'Kengaytirilgan statistika', desc: 'Batafsil tahlil va hisobotlar' },
                  { icon: '⚡', title: 'Ustuvor yordam', desc: '24/7 tezkor qo\'llab-quvvatlash' },
                  { icon: '🔄', title: 'Sinxronizatsiya', desc: 'Barcha qurilmalarda real-time' },
                  { icon: '🚫', title: 'Reklama yo\'q', desc: 'Toza va qulay interfeys' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-2xl">{feature.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{feature.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Obuna haqida</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Obuna muddati tugagandan so'ng avtomatik ravishda Free rejaga o'tasiz. 
                    Uzaytirish uchun muddat tugashidan oldin qayta to'lov qiling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
