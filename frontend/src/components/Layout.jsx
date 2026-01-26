import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import Sidebar from './Layout/Sidebar';
import Navbar from './Layout/Navbar';
import SmartQuickAdd from './Smart/SmartQuickAdd';
import OfflineIndicator from './OfflineIndicator';
import { goalsService } from '../services/goalsService';

const Layout = () => {
  const location = useLocation();
  const [goals, setGoals] = React.useState([]);
  const [mobileModal, setMobileModal] = useState({
    isOpen: false,
    type: null // 'task', 'finance', 'goal', 'debt'
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Listen to localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      setSidebarCollapsed(saved === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const data = await goalsService.getGoals();
        if (data.success) {
          setGoals(data.goals || []);
        }
      } catch (error) {
        console.error('Goals yuklashda xatolik:', error);
      }
    };
    loadGoals();
  }, [location.pathname]);

  const handleRefresh = () => {
    // Sahifani yangilash uchun
    window.location.reload();
  };

  // Mobile modal handlers
  const openMobileModal = (type) => {
    setMobileModal({ isOpen: true, type });
  };

  const closeMobileModal = () => {
    setMobileModal({ isOpen: false, type: null });
  };

  const handleMobileAddTask = () => openMobileModal('task');
  const handleMobileAddFinance = () => openMobileModal('finance');
  const handleMobileAddGoal = () => openMobileModal('goal');
  const handleMobileAddDebt = () => openMobileModal('debt');

  const handleMobileSuccess = () => {
    closeMobileModal();
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Sidebar - Mobile va Desktop uchun */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => {
          const newState = !sidebarCollapsed;
          setSidebarCollapsed(newState);
          localStorage.setItem('sidebarCollapsed', newState.toString());
        }}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'
      }`}>
        {/* Navbar */}
        <Navbar 
          onMobileMenuToggle={() => setMobileModal({ isOpen: true, type: 'menu' })}
          onAddTask={handleMobileAddTask}
          onAddFinance={handleMobileAddFinance}
          onAddGoal={handleMobileAddGoal}
          onAddDebt={handleMobileAddDebt}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 transition-all duration-300 w-full overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Quick Add - Desktop only */}
      <div className="hidden lg:block">
        <SmartQuickAdd
          onAddTask={handleRefresh}
          onAddFinance={handleRefresh}
          onAddGoal={handleRefresh}
          existingGoals={goals}
        />
      </div>

      {/* Mobile Modals */}
      <MobileModals
        isOpen={mobileModal.isOpen}
        type={mobileModal.type}
        onClose={closeMobileModal}
        onSuccess={handleMobileSuccess}
        existingGoals={goals}
      />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

// MobileModals component
const MobileModals = ({ isOpen, type, onClose, onSuccess, existingGoals }) => {
  if (!isOpen) return null;

  const renderModalContent = () => {
    switch (type) {
      case 'task':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Yangi vazifa</h3>
            <p className="text-gray-600 dark:text-gray-400">Mobil vazifa qo'shish</p>
          </div>
        );
      case 'finance':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Moliya qo'shish</h3>
            <p className="text-gray-600 dark:text-gray-400">Mobil moliya qo'shish</p>
          </div>
        );
      case 'goal':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Yangi maqsad</h3>
            <p className="text-gray-600 dark:text-gray-400">Mobil maqsad qo'shish</p>
          </div>
        );
      case 'debt':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Qarz qo'shish</h3>
            <p className="text-gray-600 dark:text-gray-400">Mobil qarz qo'shish</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 lg:hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 m-4 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Qo'shish</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {renderModalContent()}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Bekor qilish
          </button>
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;