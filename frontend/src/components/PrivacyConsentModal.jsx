import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyConsentModal = ({ showConsentModal, onConsent }) => {
  const navigate = useNavigate();
  
  if (!showConsentModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Maxfiylik Siyosatiga Rozilik
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            InFast AI dan foydalanishingiz uchun Maxfiylik Siyosatimizga rozilik bildirishingiz kerak.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
            Nima uchun rozilik kerak?
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Shaxsiy ma'lumotlaringizni xavfsiz saqlash</li>
            <li>• AI xizmatlarini yaxshilash uchun ma'lumotlardan foydalanish</li>
            <li>• Shaxsiylashtirilgan tajriba taqdim etish</li>
            <li>• Xavfsizlik va texnik yaxshilashlar</li>
          </ul>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => navigate('/privacy-policy')}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Siyosatni o'qish
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onConsent(false)}
            className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Rad etish
          </button>
          <button
            onClick={() => onConsent(true)}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
          >
            Roziman
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Bu rozilik kuniga 3 marta so'raladi
        </p>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;
