import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Key, AlertCircle, Check, Shield } from 'lucide-react';

const ChangePassword = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(Math.min(6, strength));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Joriy parolni kiriting';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Yangi parolni kiriting';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak';
    } else if (passwordStrength < 3) {
      newErrors.newPassword = 'Parol yetarlicha kuchli emas';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmayapti';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await onSubmit({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // Formani tozalash
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength(0);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const PasswordInput = ({ label, name, showPassword, onToggle }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
            errors[name] ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  const PasswordRequirements = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-3">Parol talablari:</p>
      <div className="grid grid-cols-2 gap-2">
        <div className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3 h-3 mr-2" />
          <span className="text-xs">8+ belgi</span>
        </div>
        <div className={`flex items-center ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3 h-3 mr-2" />
          <span className="text-xs">Katta harf</span>
        </div>
        <div className={`flex items-center ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3 h-3 mr-2" />
          <span className="text-xs">Kichik harf</span>
        </div>
        <div className={`flex items-center ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3 h-3 mr-2" />
          <span className="text-xs">Raqam</span>
        </div>
      </div>
      
      {/* Parol kuchliligi ko'rsatkichi */}
      {formData.newPassword && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Parol kuchliligi:</span>
            <span className={`text-sm font-medium ${
              passwordStrength <= 1 ? 'text-red-600' :
              passwordStrength <= 3 ? 'text-yellow-600' :
              passwordStrength <= 5 ? 'text-blue-600' : 'text-green-600'
            }`}>
              {passwordStrength <= 1 ? 'Zaif' :
               passwordStrength <= 3 ? 'O\'rtacha' :
               passwordStrength <= 5 ? 'Yaxshi' : 'A\'lo'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                passwordStrength <= 1 ? 'w-1/4 bg-red-500' :
                passwordStrength <= 3 ? 'w-2/4 bg-yellow-500' :
                passwordStrength <= 5 ? 'w-3/4 bg-blue-500' :
                'w-full bg-green-500'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-blue-500" />
            Parol va xavfsizlik
          </h3>
          <p className="text-gray-600 text-sm">
            Hisob xavfsizligingizni oshirish uchun parolingizni muntazam yangilang
          </p>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
          Xavfsizlik darajasi: {passwordStrength > 3 ? 'Yugori' : 'Normal'}
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <PasswordInput
          label="Joriy parol"
          name="currentPassword"
          showPassword={showPasswords.current}
          onToggle={() => togglePasswordVisibility('current')}
        />

        <div>
          <PasswordInput
            label="Yangi parol"
            name="newPassword"
            showPassword={showPasswords.new}
            onToggle={() => togglePasswordVisibility('new')}
          />
          <PasswordRequirements />
        </div>

        <PasswordInput
          label="Yangi parolni takrorlang"
          name="confirmPassword"
          showPassword={showPasswords.confirm}
          onToggle={() => togglePasswordVisibility('confirm')}
        />
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Key className="w-4 h-4 mr-2" />
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Oʻzgartirilmoqda...
            </span>
          ) : (
            'Parolni oʻzgartirish'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;