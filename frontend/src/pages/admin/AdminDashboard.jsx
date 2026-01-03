import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, TrendingUp, Activity, 
  Calendar, Clock, BarChart3, RefreshCw, LogOut,
  ChevronDown, Search, Eye, Ban, CheckCircle, AlertTriangle,
  ListTodo, CreditCard, DollarSign, Shield, ArrowUpRight, ArrowDownRight,
  Zap, Settings, ToggleLeft, ToggleRight, Save, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import adminService from '../../services/adminService';

// Simple bar chart component
const SimpleBarChart = ({ data, title, dataKey, labelKey, color = 'bg-blue-500' }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => d[dataKey] || 0), 1);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      <div className="space-y-2">
        {data.slice(-10).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16 flex-shrink-0">
              {item[labelKey]?.slice(-5) || item[labelKey]}
            </span>
            <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-full ${color} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                style={{ width: `${Math.max((item[dataKey] / maxValue) * 100, 5)}%` }}
              >
                <span className="text-xs text-white font-medium">{item[dataKey]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Activity heatmap for login times
const ActivityHeatmap = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => d.count || 0), 1);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-green-500" />
        {title}
      </h3>
      <div className="grid grid-cols-12 gap-1">
        {data.map((item, index) => {
          const intensity = item.count / maxValue;
          const bgColor = intensity === 0 
            ? 'bg-gray-700' 
            : intensity < 0.25 
              ? 'bg-green-900' 
              : intensity < 0.5 
                ? 'bg-green-700' 
                : intensity < 0.75 
                  ? 'bg-green-500' 
                  : 'bg-green-400';
          return (
            <div 
              key={index}
              className={`h-8 rounded ${bgColor} flex items-center justify-center cursor-pointer transition-all hover:scale-110`}
              title={`${item.hour}: ${item.count} ta kirish`}
            >
              <span className="text-[10px] text-white/70">{item.count > 0 ? item.count : ''}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(change)}% so'nggi 7 kun
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminLogout, adminUser, isAdminAuthenticated } = useAdminStore();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    adminUsers: 0,
    totalTasks: 0,
    totalPayments: 0,
    totalRevenue: 0,
    userGrowthData: [],
    loginActivityData: [],
    lastWeekUsers: 0,
    weeklyGrowthPercent: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [appSettings, setAppSettings] = useState({
    pro_subscription_enabled: false,
    challenges_enabled: false,
    pro_monthly_price: 39000,
    pro_yearly_price: 399000,
    payment_card_number: '',
    payment_card_holder: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, payments
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getAdminToken = () => {
    let token = localStorage.getItem('adminToken');
    if (token) return token;

    try {
      const adminStorage = localStorage.getItem('admin-storage');
      if (adminStorage) {
        const parsed = JSON.parse(adminStorage);
        token = parsed?.state?.adminToken;
      }
    } catch (e) {
      console.error('Error parsing admin storage:', e);
    }

    return token;
  };

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchData();
    fetchAppSettings();
  }, [isAdminAuthenticated, navigate]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchUsers();
    }
  }, [searchQuery, statusFilter, pagination.page]);

  const fetchAppSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/public`);
      const data = await response.json();
      if (data.success) {
        setAppSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
    }
  };

  const handleTogglePro = async () => {
    setSettingsLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/toggle-pro`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAppSettings(prev => ({ ...prev, pro_subscription_enabled: data.enabled }));
      }
    } catch (error) {
      console.error('Error toggling pro:', error);
    }
    setSettingsLoading(false);
  };

  const handleToggleChallenges = async () => {
    setSettingsLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/toggle-challenges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAppSettings(prev => ({ ...prev, challenges_enabled: data.enabled }));
      }
    } catch (error) {
      console.error('Error toggling challenges:', error);
    }
    setSettingsLoading(false);
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const token = getAdminToken();
      
      // Update prices
      const pricesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/pro-prices`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          monthlyPrice: Number(appSettings.pro_monthly_price),
          yearlyPrice: Number(appSettings.pro_yearly_price)
        })
      });
      
      const pricesData = await pricesResponse.json();
      console.log('Prices update response:', pricesData);

      // Update card info
      const cardResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/payment-card`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: appSettings.payment_card_number,
          cardHolder: appSettings.payment_card_holder
        })
      });
      
      const cardData = await cardResponse.json();
      console.log('Card update response:', cardData);

      if (pricesData.success && cardData.success) {
        alert('Sozlamalar saqlandi!');
      } else {
        alert('Xatolik: ' + (pricesData.message || cardData.message || 'Noma\'lum xato'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Xatolik yuz berdi: ' + error.message);
    }
    setSettingsLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(1, 20, '', '')
      ]);
      
      // Fetch app settings too
      await fetchAppSettings();

      console.log('Dashboard Response:', dashboardRes);
      console.log('Users Response:', usersRes);

      if (dashboardRes.success) {
        setStats(dashboardRes.data);
        setRecentUsers(dashboardRes.data.recentUsers || []);
      } else {
        console.error('Dashboard error:', dashboardRes);
      }

      if (usersRes.success) {
        setUsers(usersRes.data.users || []);
        setPagination(usersRes.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } else {
        console.error('Users error:', usersRes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const usersRes = await adminService.getUsers(pagination.page, pagination.limit, searchQuery, statusFilter);
      if (usersRes.success) {
        setUsers(usersRes.data.users || []);
        setPagination(usersRes.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await adminService.getAllPayments(1, 50, '');
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
    setPaymentsLoading(false);
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const res = await adminService.approvePayment(paymentId);
      if (res.success) {
        alert('To\'lov tasdiqlandi! Foydalanuvchi Pro obunaga o\'tdi.');
        fetchPayments();
        setShowPaymentModal(false);
      } else {
        alert('Xatolik: ' + res.message);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      const res = await adminService.rejectPayment(paymentId, rejectReason);
      if (res.success) {
        alert('To\'lov rad etildi');
        fetchPayments();
        setShowPaymentModal(false);
        setRejectReason('');
      } else {
        alert('Xatolik: ' + res.message);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleToggleBan = async (userId, currentBanStatus) => {
    try {
      const result = await adminService.toggleUserBan(userId, !currentBanStatus);
      if (result.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !currentBanStatus } : u));
        setStats(prev => ({
          ...prev,
          bannedUsers: currentBanStatus ? prev.bannedUsers - 1 : prev.bannedUsers + 1,
          activeUsers: currentBanStatus ? prev.activeUsers + 1 : prev.activeUsers - 1
        }));
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, isBanned: !currentBanStatus });
        }
      }
    } catch (error) {
      console.error('Error toggling ban:', error);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.phone || user.email || 'Noma\'lum';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
              {adminUser?.firstName || 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Sozlamalar"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Yangilash"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Foydalanuvchilar
          </button>
          <button
            onClick={() => { setActiveTab('payments'); fetchPayments(); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'payments' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Obunalar
            {payments.filter(p => p.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Jami foydalanuvchilar"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-600"
          />
          <StatCard
            title="Faol foydalanuvchilar"
            value={stats.activeUsers}
            icon={UserCheck}
            color="bg-green-600"
          />
          <StatCard
            title="Bloklangan"
            value={stats.bannedUsers}
            icon={UserX}
            color="bg-red-600"
          />
          <StatCard
            title="Adminlar"
            value={stats.adminUsers}
            icon={Shield}
            color="bg-purple-600"
          />
        </div>

        {/* Weekly Growth Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">So'nggi 7 kunda ro'yxatdan o'tganlar</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.lastWeekUsers || 0}</p>
                <p className={`text-sm mt-2 flex items-center gap-1 ${stats.weeklyGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.weeklyGrowthPercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(stats.weeklyGrowthPercent || 0)}% oldingi haftaga nisbatan
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Login Activity Heatmap */}
          <ActivityHeatmap 
            data={stats.loginActivityData} 
            title="Kunlik kirish faolligi (soatlar bo'yicha)"
          />
        </div>

        {/* User Growth Chart */}
        {stats.userGrowthData && stats.userGrowthData.length > 0 && (
          <div className="mb-8">
            <SimpleBarChart 
              data={stats.userGrowthData}
              title="Kunlik ro'yxatdan o'tish (so'nggi 30 kun)"
              dataKey="count"
              labelKey="date"
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        )}

        {/* Recent Users */}
        {recentUsers.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              So'nggi ro'yxatdan o'tganlar
            </h2>
            <div className="flex flex-wrap gap-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getUserName(user).charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{getUserName(user)}</p>
                    <p className="text-gray-400 text-xs">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Foydalanuvchilar ro'yxati
                <span className="text-sm font-normal text-gray-400">({pagination.total} ta)</span>
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Ism</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Ro'yxatdan o'tgan</th>
                  <th className="px-6 py-4">Oxirgi kirish</th>
                  <th className="px-6 py-4">Holat</th>
                  <th className="px-6 py-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4 text-gray-300 text-xs">{user._id?.slice(-6)}</td>
                    <td className="px-6 py-4 text-white font-medium">{getUserName(user)}</td>
                    <td className="px-6 py-4 text-gray-300">{user.email || user.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.lastLogin)}</td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : user.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                          <Ban className="w-3 h-3" />
                          Bloklangan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Faol
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!user.isAdmin && (
                          user.isBanned ? (
                            <button
                              onClick={() => handleToggleBan(user._id, user.isBanned)}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Blokdan chiqarish"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleBan(user._id, user.isBanned)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Bloklash"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Foydalanuvchilar topilmadi</p>
            </div>
          )}
        </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            {/* Users Table - same as above but standalone */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Foydalanuvchilar ro'yxati
                    <span className="text-sm font-normal text-gray-400">({pagination.total} ta)</span>
                  </h2>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Barchasi</option>
                      <option value="active">Faol</option>
                      <option value="banned">Bloklangan</option>
                      <option value="admin">Adminlar</option>
                    </select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="px-6 py-4">Foydalanuvchi</th>
                      <th className="px-6 py-4">Kontakt</th>
                      <th className="px-6 py-4">Obuna</th>
                      <th className="px-6 py-4">Ro'yxatdan o'tgan</th>
                      <th className="px-6 py-4">Holat</th>
                      <th className="px-6 py-4">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {getUserName(user).charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{getUserName(user)}</p>
                              <p className="text-gray-400 text-xs">ID: {user._id?.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{user.email || user.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.subscriptionType === 'premium' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.subscriptionType === 'premium' ? 'Pro' : 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          ) : user.isBanned ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                              <Ban className="w-3 h-3" /> Bloklangan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                              <CheckCircle className="w-3 h-3" /> Faol
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!user.isAdmin && (
                              <button
                                onClick={() => handleToggleBan(user._id, user.isBanned)}
                                className={`p-2 rounded-lg ${user.isBanned ? 'text-gray-400 hover:text-green-400' : 'text-gray-400 hover:text-red-400'} hover:bg-gray-700`}
                              >
                                {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'payments' && (
          <>
            {/* Payments Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    Obunalar va To'lovlar
                    <span className="text-sm font-normal text-gray-400">({payments.length} ta)</span>
                  </h2>
                  <button
                    onClick={fetchPayments}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                  >
                    <RefreshCw className={`w-5 h-5 ${paymentsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">Yuklanmoqda...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Hozircha to'lovlar yo'q</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                        <th className="px-6 py-4">Foydalanuvchi</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4">Miqdor</th>
                        <th className="px-6 py-4">Davr</th>
                        <th className="px-6 py-4">Sana</th>
                        <th className="px-6 py-4">Holat</th>
                        <th className="px-6 py-4">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} className={`border-b border-gray-700 hover:bg-gray-750 ${payment.status === 'pending' ? 'bg-yellow-500/5' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {payment.userId?.firstName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {payment.userId?.firstName} {payment.userId?.lastName}
                                </p>
                                <p className="text-gray-400 text-xs">{payment.userId?.email || payment.userId?.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                              {payment.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">
                            {payment.amount?.toLocaleString()} so'm
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {payment.billingCycle === 'yearly' ? 'Yillik' : 'Oylik'}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(payment.createdAt)}</td>
                          <td className="px-6 py-4">
                            {payment.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                                <Clock className="w-3 h-3" /> Kutilmoqda
                              </span>
                            ) : payment.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                                <CheckCircle className="w-3 h-3" /> Tasdiqlangan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                                <Ban className="w-3 h-3" /> Rad etilgan
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setSelectedPayment(payment); setShowPaymentModal(true); }}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg"
                                title="Ko'rish"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {payment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePayment(payment._id)}
                                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg"
                                    title="Tasdiqlash"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedPayment(payment); setShowPaymentModal(true); }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                                    title="Rad etish"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Foydalanuvchi ma'lumotlari</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getUserName(selectedUser).charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{getUserName(selectedUser)}</h4>
                  <p className="text-gray-400">{selectedUser.email || selectedUser.phone || '-'}</p>
                  {selectedUser.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full mt-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Vazifalar</p>
                  <p className="text-2xl font-bold text-white">{selectedUser.taskCount || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">To'lovlar</p>
                  <p className="text-2xl font-bold text-white">{selectedUser.paymentCount || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Obuna turi</p>
                  <p className="text-lg font-bold text-white capitalize">{selectedUser.subscriptionType || 'free'}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Holat</p>
                  <p className={`text-lg font-bold ${selectedUser.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedUser.isBanned ? 'Bloklangan' : 'Faol'}
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ro'yxatdan o'tgan:</span>
                  <span className="text-white">{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Oxirgi kirish:</span>
                  <span className="text-white">{formatDate(selectedUser.lastLogin)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {/* Pro subscription toggle */}
                {!selectedUser.isAdmin && (
                  <div className="flex gap-2">
                    {selectedUser.subscriptionType === 'premium' ? (
                      <button
                        onClick={async () => {
                          try {
                            const res = await adminService.updateUserSubscription(selectedUser._id, 'free');
                            if (res.success) {
                              alert('Pro obuna olib tashlandi');
                              setSelectedUser({ ...selectedUser, subscriptionType: 'free', subscriptionEndDate: null });
                              fetchUsers();
                            }
                          } catch (e) { alert('Xatolik'); }
                        }}
                        className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Pro ni olib tashlash
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            const endDate = new Date();
                            endDate.setMonth(endDate.getMonth() + 1);
                            const res = await adminService.updateUserSubscription(selectedUser._id, 'premium', endDate);
                            if (res.success) {
                              alert('Pro obuna berildi (1 oy)');
                              setSelectedUser({ ...selectedUser, subscriptionType: 'premium', subscriptionEndDate: endDate });
                              fetchUsers();
                            }
                          } catch (e) { alert('Xatolik'); }
                        }}
                        className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Pro berish (1 oy)
                      </button>
                    )}
                  </div>
                )}
                
                {/* Ban/Unban */}
                <div className="flex gap-2">
                  {!selectedUser.isAdmin && (
                    selectedUser.isBanned ? (
                      <button
                        onClick={() => handleToggleBan(selectedUser._id, selectedUser.isBanned)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Blokdan chiqarish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleBan(selectedUser._id, selectedUser.isBanned)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        Bloklash
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Ilova sozlamalari
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Pro Subscription Toggle */}
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-xl">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Pro Obuna</h4>
                      <p className="text-sm text-gray-400">
                        {appSettings.pro_subscription_enabled 
                          ? 'Foydalanuvchilar Pro sotib olishi mumkin' 
                          : 'Pro obuna o\'chirilgan'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePro}
                    disabled={settingsLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      appSettings.pro_subscription_enabled 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {appSettings.pro_subscription_enabled ? (
                      <ToggleRight className="w-8 h-8 text-white" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>
                <div className={`mt-4 p-3 rounded-lg ${
                  appSettings.pro_subscription_enabled 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <p className={`text-sm font-medium ${
                    appSettings.pro_subscription_enabled ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {appSettings.pro_subscription_enabled 
                      ? '✅ Pro obuna YOQILGAN - Pricing sahifasi ko\'rinadi' 
                      : '❌ Pro obuna O\'CHIRILGAN - Pricing sahifasi yashirilgan'}
                  </p>
                </div>
              </div>

              {/* Challenges Toggle */}
              <div className="bg-gradient-to-r from-orange-900/50 to-yellow-900/50 rounded-xl p-6 border border-orange-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-600 rounded-xl">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Challengelar</h4>
                      <p className="text-sm text-gray-400">
                        {appSettings.challenges_enabled 
                          ? 'Foydalanuvchilar Challengelarga kirishi mumkin' 
                          : 'Challengelar o\'chirilgan'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleChallenges}
                    disabled={settingsLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      appSettings.challenges_enabled 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {appSettings.challenges_enabled ? (
                      <ToggleRight className="w-8 h-8 text-white" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>
                <div className={`mt-4 p-3 rounded-lg ${
                  appSettings.challenges_enabled 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <p className={`text-sm font-medium ${
                    appSettings.challenges_enabled ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {appSettings.challenges_enabled 
                      ? '✅ Challengelar YOQILGAN - Sidebar\'da ko\'rinadi' 
                      : '❌ Challengelar O\'CHIRILGAN - Sidebar\'da yashirilgan'}
                  </p>
                </div>
              </div>

              {/* Pro Prices */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Pro narxlari
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Oylik narx (so'm)</label>
                    <input
                      type="number"
                      value={appSettings.pro_monthly_price}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, pro_monthly_price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Yillik narx (so'm)</label>
                    <input
                      type="number"
                      value={appSettings.pro_yearly_price}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, pro_yearly_price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Card Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  To'lov kartasi
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Karta raqami</label>
                    <input
                      type="text"
                      value={appSettings.payment_card_number}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, payment_card_number: e.target.value }))}
                      placeholder="9860 0607 0978 0345"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Karta egasi</label>
                    <input
                      type="text"
                      value={appSettings.payment_card_holder}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, payment_card_holder: e.target.value }))}
                      placeholder="Muhammadaziz Yakubov"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {settingsLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Saqlash
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">To'lov ma'lumotlari</h3>
              <button
                onClick={() => { setShowPaymentModal(false); setRejectReason(''); }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedPayment.userId?.firstName?.charAt(0) || '?'}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {selectedPayment.userId?.firstName} {selectedPayment.userId?.lastName}
                  </h4>
                  <p className="text-gray-400">{selectedPayment.userId?.email || selectedPayment.userId?.phone}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                    selectedPayment.userId?.subscriptionType === 'premium' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedPayment.userId?.subscriptionType === 'premium' ? 'Pro' : 'Free'}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Plan</p>
                  <p className="text-xl font-bold text-blue-400">{selectedPayment.plan}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Miqdor</p>
                  <p className="text-xl font-bold text-green-400">{selectedPayment.amount?.toLocaleString()} so'm</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Davr</p>
                  <p className="text-lg font-bold text-white">{selectedPayment.billingCycle === 'yearly' ? 'Yillik' : 'Oylik'}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Holat</p>
                  <p className={`text-lg font-bold ${
                    selectedPayment.status === 'pending' ? 'text-yellow-400' :
                    selectedPayment.status === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedPayment.status === 'pending' ? 'Kutilmoqda' :
                     selectedPayment.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                  </p>
                </div>
              </div>

              {/* Receipt Image */}
              {selectedPayment.receiptUrl && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Chek rasmi:</p>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <img 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedPayment.receiptUrl}`}
                      alt="Chek"
                      className="max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <a 
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedPayment.receiptUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Katta ko'rinishda ochish
                    </a>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Yuborilgan:</span>
                  <span className="text-white">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                {selectedPayment.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ko'rib chiqilgan:</span>
                    <span className="text-white">{formatDate(selectedPayment.approvedAt)}</span>
                  </div>
                )}
                {selectedPayment.subscriptionEndDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Obuna tugash sanasi:</span>
                    <span className="text-green-400">{formatDate(selectedPayment.subscriptionEndDate)}</span>
                  </div>
                )}
              </div>

              {/* Actions for pending payments */}
              {selectedPayment.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Rad etish sababi (ixtiyoriy):</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Masalan: Chek noto'g'ri, summa mos kelmaydi..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprovePayment(selectedPayment._id)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Tasdiqlash (Pro berish)
                    </button>
                    <button
                      onClick={() => handleRejectPayment(selectedPayment._id)}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Ban className="w-5 h-5" />
                      Rad etish
                    </button>
                  </div>
                </div>
              )}

              {/* Close button for non-pending */}
              {selectedPayment.status !== 'pending' && (
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Yopish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
