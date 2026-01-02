import React, { useState } from 'react';
import { AlertTriangle, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DeleteAccount = ({ onSubmit }) => {
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmText !== 'DELETE') {
      setError('Iltimos, "DELETE" so\'zini to\'g\'ri kiriting');
      return;
    }

    if (!window.confirm('Hisobingiz butunlay o\'chiriladi. Bu harakatni qaytarib bo\'lmaydi. Davom etishni istaysizmi?')) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit();
      logout();
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800">Hisobni o'chirish</h4>
            <p className="text-sm text-red-700 mt-1">
              Bu harakatni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz, vazifalaringiz va sozlamalaringiz butunlay o'chiriladi.
            </p>
          </div>
        </div>
      </div>

      {/* Consequences */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900">Bu amal quyidagilarga olib keladi:</h5>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <X className="w-4 h-4 text-red-500 mr-2" />
            Barcha shaxsiy ma'lumotlaringiz o'chiriladi
          </li>
          <li className="flex items-center">
            <X className="w-4 h-4 text-red-500 mr-2" />
            Barcha vazifalaringiz va ma'lumotlaringiz yo'qoladi
          </li>
          <li className="flex items-center">
            <X className="w-4 h-4 text-red-500 mr-2" />
            Hisobingizga qayta kirish imkoni bo'lmaydi
          </li>
          <li className="flex items-center">
            <X className="w-4 h-4 text-red-500 mr-2" />
            Telefon raqamingiz keyingi ro'yxatdan o'tish uchun bloklanadi
          </li>
        </ul>
      </div>

      {/* Confirmation */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tasdiqlash uchun <span className="font-bold text-red-600">DELETE</span> so'zini kiriting:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError('');
            }}
            placeholder="DELETE"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none uppercase"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading || confirmText !== 'DELETE'}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? 'Oʻchirilmoqda...' : 'Hisobni oʻchirish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteAccount;