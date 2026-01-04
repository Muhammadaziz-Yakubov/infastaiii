import React, { useState } from 'react';
import { AlertTriangle, Trash2, Check, X } from 'lucide-react';
import Modal from '../Common/Modal';

const DeleteAccount = ({ onSubmit }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmText !== 'DELETE') {
      setError('Iltimos, "DELETE" so\'zini to\'g\'ri kiriting');
      return;
    }

    if (!password) {
      setError('Iltimos, parolingizni kiriting');
      return;
    }

    if (!window.confirm('Hisobingiz butunlay o\'chiriladi. Bu harakatni qaytarib bo\'lmaydi. Davom etishni istaysizmi?')) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(password);
      // success handled by parent (e.g., logout)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
      >
        Hisobni O'chirish
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Hisobni O'chirish">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bu amalni qaytarib bo'lmaydi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Barcha ma'lumotlaringiz, vazifalaringiz va sozlamalaringiz butunlay o'chiriladi.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Parolingizni kiriting"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setPassword('');
              setError('');
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={async () => {
              setError('');
              if (!password) {
                setError('Iltimos, parolingizni kiriting');
                return;
              }
              setLoading(true);
              try {
                await onSubmit(password);
                setShowModal(false);
                setPassword('');
                setLoading(false);
              } catch (err) {
                setError(err?.response?.data?.message || err.message || 'Xatolik yuz berdi');
                setLoading(false);
              }
            }}
            disabled={loading || !password}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Oʻchirilmoqda...' : "Ha, o'chirish"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteAccount;