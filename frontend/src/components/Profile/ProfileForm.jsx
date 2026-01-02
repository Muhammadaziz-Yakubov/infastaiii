import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Phone, Save, AlertCircle, Camera, X } from 'lucide-react';

const ProfileForm = ({ profile, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    phone: ''
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        birthday: profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : '',
        phone: profile.phone || ''
      });
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ismni kiriting';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Familiyani kiriting';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Familiya kamida 2 ta belgidan iborat bo\'lishi kerak';
    }

    if (formData.birthday) {
      const birthday = new Date(formData.birthday);
      const today = new Date();
      if (birthday > today) {
        newErrors.birthday = 'Tug\'ilgan kun kelajakda bo\'lishi mumkin emas';
      } else {
        const age = today.getFullYear() - birthday.getFullYear();
        if (age < 13) {
          newErrors.birthday = 'Kamida 13 yoshda bo\'lishingiz kerak';
        }
      }
    }

    // Validate avatar file size (max 5MB)
    if (avatar && avatar.size > 5 * 1024 * 1024) {
      newErrors.avatar = 'Rasm hajmi 5MB dan oshmasligi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Add avatar if selected
      if (avatar) {
        submitData.append('avatar', avatar);
      }

      await onSubmit(submitData);
    } catch (err) {
      // Xatolik qayta ishlash
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, required = false, disabled = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
            errors[name]
              ? 'border-red-300 focus:border-red-500'
              : disabled
                ? 'border-gray-200 text-gray-500 cursor-not-allowed bg-gray-100'
                : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
          }`}
        />
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Shaxsiy ma'lumotlar</h3>
          <p className="text-gray-600 text-sm">
            Profilingiz ma'lumotlarini yangilang va boshqarish
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
            ID: {profile?._id?.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
          {avatarPreview && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute top-0 right-0 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Profil rasmini o'zgartirish uchun rasmni bosing
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG yoki GIF. Maksimal 5MB
          </p>
        </div>
        {errors.avatar && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.avatar}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Ism"
          name="firstName"
          icon={User}
          placeholder="Ismingizni kiriting"
          required
        />

        <InputField
          label="Familiya"
          name="lastName"
          icon={User}
          placeholder="Familiyangizni kiriting"
          required
        />

        {profile?.email && (
          <InputField
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="email@example.com"
            disabled
          />
        )}

        <InputField
          label="Tug'ilgan kun"
          name="birthday"
          type="date"
          icon={Calendar}
          placeholder="YYYY-MM-DD"
        />

        <InputField
          label="Telefon raqam"
          name="phone"
          type="tel"
          icon={Phone}
          placeholder="+998 90 123 45 67"
          disabled
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Eslatma:</strong> Email va telefon raqamni o'zgartirish uchun qo'llab-quvvatlash xizmatiga murojaat qiling.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Saqlanmoqda...
            </span>
          ) : (
            'O\'zgarishlarni saqlash'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;