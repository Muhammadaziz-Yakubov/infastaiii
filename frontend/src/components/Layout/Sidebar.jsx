import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';
import { financeService } from '../../services/financeService';
import { goalsService } from '../../services/goalsService';
import { debtService } from '../../services/debtService';
import logoImage from '../../assets/infastai.png';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  User,
  Settings,
  LogOut,
  Goal,
  Sparkles,
  Moon,
  Sun,
  Search,
  X,
  Plus,
  TrendingUp,
  ChevronRight,
  Crown,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

/* ================= MOBILE BOTTOM BAR ================= */
const MobileBottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: LayoutDashboard, label: 'Bosh' },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, label: 'Vazifalar' },
    { name: 'Add', href: '#', icon: Plus, label: '+', isAdd: true },
    { name: 'Finance', href: '/finance', icon: Wallet, label: 'Moliya' },
    { name: 'Goals', href: '/goals', icon: Goal, label: 'Maqsad' },
  ];

  const addOptions = [
    {
      name: 'Vazifa qo\'shish',
      icon: CheckSquare,
      action: () => handleAdd('task'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Tranzaksiya',
      icon: Wallet,
      action: () => handleAdd('finance'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Maqsad',
      icon: Goal,
      action: () => handleAdd('goal'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Qarz',
      icon: User,
      action: () => handleAdd('debt'),
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  const handleAdd = (type) => {
    setShowAddModal(false);
    // Sahifaga navigate qilish
    switch (type) {
      case 'task':
        navigate('/tasks?add=true');
        break;
      case 'finance':
        navigate('/finance?add=true');
        break;
      case 'goal':
        navigate('/goals?add=true');
        break;
      case 'debt':
        navigate('/finance?add=debt');
        break;
    }
  };

  return (
    <>
      {/* ADD MODAL OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] lg:hidden" onClick={() => setShowAddModal(false)}>
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-80">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 space-y-3">
              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-4">
                Nima qo'shmoqchisiz?
              </h3>
              {addOptions.map((option, index) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`w-full flex items-center gap-4 ${option.color} text-white px-4 py-3 rounded-xl font-medium transition-all hover:scale-105`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideUp 0.3s ease-out forwards'
                  }}
                >
                  <option.icon className="w-6 h-6" />
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
        <div className="flex justify-around items-center h-20 px-2 safe-area-bottom">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href && !item.isAdd;
            const Icon = item.icon;

            // Special handling for Add button
            if (item.isAdd) {
              return (
                <button
                  key={item.name}
                  onClick={() => setShowAddModal(true)}
                  className="flex flex-col items-center justify-center flex-1 h-full relative group transition-all duration-300 scale-100"
                >
                  <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg scale-110">
                    <Icon className="w-6 h-6 transition-transform duration-300" />
                  </div>
                  <span className="text-[10px] font-medium mt-1 text-primary-600 dark:text-primary-400">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full relative group transition-all duration-300 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`
                }
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />
                )}
                
                <div
                  className={`relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg scale-110'
                      : 'text-gray-400 dark:text-gray-500 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  
                  {/* Pulse animation for active */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-2xl bg-blue-500 animate-ping opacity-20" />
                  )}
                </div>
                
                {/* Label */}
                <span
                  className={`text-[10px] font-medium mt-1 transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Actions Menu */}
        {showQuickActions && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 -mt-20"
              onClick={() => setShowQuickActions(false)}
            />
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 z-50 min-w-[200px] border border-gray-200 dark:border-gray-700 animate-slide-up">
              <div className="flex flex-col gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={() => {
                      navigate(action.href);
                      setShowQuickActions(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${action.color} text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105`}
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="font-medium">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* SPACER – CONTENT UCHUN JOY */}
      <div className="lg:hidden h-20 safe-area-bottom" />
    </>
  );
};

/* ================= SIDEBAR ================= */
const Sidebar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const searchRef = useRef(null);

  // Save collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const navigation = [
    { name: 'Boshqaruv Paneli', href: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Vazifalar', href: '/tasks', icon: CheckSquare, badge: null },
    { name: 'Moliya', href: '/finance', icon: Wallet, badge: null },
    { name: 'Maqsad', href: '/goals', icon: Goal, badge: null },
    // { name: 'Narxlar', href: '/pricing', icon: Crown, badge: null }
  ];

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <>
      {/* MOBILE BOTTOM BAR */}
      <MobileBottomBar />

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-[60] transition-all duration-300 ${
        isCollapsed ? 'w-24' : 'w-80'
      }`}>
        {/* Toggle Button on Edge */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-10 group hover:scale-110"
          title={isCollapsed ? 'Kengaytirish' : 'Yig\'ish'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        <div className="flex flex-col h-full w-full">
          {/* LOGO SECTION */}
          <div className={`flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  InFast AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Life Manager</p>
              </div>
            )}
          </div>

          {/* SEARCH BAR */}
          {!isCollapsed && (
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" ref={searchRef}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm hover:shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 dark:scrollbar-thumb-purple-800 scrollbar-track-transparent">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : ''}
                  className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative ${
                    isCollapsed ? 'justify-center px-3' : ''
                  } ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-xl transform scale-[1.02]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
                  }`}
                >
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  }`}>
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? 'scale-110 text-white'
                        : 'group-hover:scale-110 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 font-semibold text-sm transition-colors ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* SETTINGS & LOGOUT */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              title={isCollapsed ? 'Sozlamalar' : ''}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition-all duration-300 group shadow-sm hover:shadow-md ${
                isCollapsed ? 'justify-center px-3' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Settings className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              {!isCollapsed && <span className="flex-1 font-semibold text-sm text-left">Sozlamalar</span>}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition-all duration-300 group shadow-sm hover:shadow-md ${
                isCollapsed ? 'justify-center px-3' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                {isDark ? (
                  <Sun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              {!isCollapsed && (
                <span className="flex-1 font-semibold text-sm text-left">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutModal(true)}
              title={isCollapsed ? 'Chiqish' : ''}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-300 group shadow-sm hover:shadow-md ${
                isCollapsed ? 'justify-center px-3' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              {!isCollapsed && <span className="flex-1 font-semibold text-sm text-left">Chiqish</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chiqish</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Haqiqatan ham chiqmoqchimisiz?</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Barcha ma'lumotlaringiz saqlanadi va keyingi safar qayta kirishingiz mumkin.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Sidebar;
