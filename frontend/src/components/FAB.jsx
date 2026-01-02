import React, { useState } from 'react';
import { Plus, X, CheckSquare, DollarSign, Target, CreditCard } from 'lucide-react';

const FAB = ({ onAddTask, onAddFinance, onAddDebt, onAddGoal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  const menuItems = [
    {
      icon: CheckSquare,
      label: 'Vazifa qo\'shish',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: onAddTask
    },
    {
      icon: DollarSign,
      label: 'Tranzaksiya',
      color: 'bg-green-500 hover:bg-green-600',
      action: onAddFinance
    },
    {
      icon: Target,
      label: 'Maqsad',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: onAddGoal
    },
    {
      icon: CreditCard,
      label: 'Qarz',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: onAddDebt
    }
  ];

  return (
    <>
      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main FAB - O'ngda, yuqorida */}
      <div className="fixed bottom-20 right-6 z-50">
        {/* Menu items - O'ngdan yuqoriga */}
        {isOpen && (
          <div className="absolute bottom-24 right-0 space-y-4">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => handleAction(item.action)}
                className={`flex items-center gap-4 ${item.color} text-white px-6 py-4 rounded-full shadow-xl transform transition-all duration-200 hover:scale-105 min-w-[200px]`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideUp 0.3s ease-out forwards'
                }}
              >
                <item.icon className="w-6 h-6" />
                <span className="font-medium text-base">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main button - Professional katta "+" */}
        <button
          onClick={toggleMenu}
          className={`w-20 h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <Plus className="w-8 h-8" />
          )}
        </button>
      </div>


      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default FAB;

