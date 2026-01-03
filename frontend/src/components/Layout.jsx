import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
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
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'
      }`}>
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 transition-all duration-300 w-full overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Quick Add - All screens */}
      <SmartQuickAdd
        onAddTask={handleRefresh}
        onAddFinance={handleRefresh}
        onAddGoal={handleRefresh}
        existingGoals={goals}
      />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default Layout;