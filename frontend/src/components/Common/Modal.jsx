import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 backdrop-blur-sm"
          onClick={onClose}
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.92) 0px, rgba(255,255,255,0.92) 56px, rgba(0,0,0,0.28) 60px)'
          }}
        />
        <div
          className={`relative bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} ${"animate-modal-scale"}`}>
          <style>{`@keyframes modalScaleIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-modal-scale { animation: modalScaleIn 180ms cubic-bezier(.2,.8,.2,1) forwards; }`}</style>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;