import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, TrendingUp, Activity, 
  Clock, BarChart3, RefreshCw, LogOut,
  Search, Eye, Ban, CheckCircle, AlertTriangle,
  Shield, ArrowUpRight, ArrowDownRight,
  Bell, Send, Trash2, Edit
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
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, notifications
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: '', message: '', type: 'announcement' });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
  }, [isAdminAuthenticated, navigate]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchUsers();
    }
  }, [searchQuery, statusFilter, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(1, 20, '', '')
      ]);
      

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

  // Send notification to all users
  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      alert('Sarlavha va xabar majburiy!');
      return;
    }
    setSendingNotification(true);
    try {
      const result = await adminService.sendNotification(
        notificationData.title,
        notificationData.message,
        notificationData.type
      );
      if (result.success) {
        alert(result.message);
        setShowNotificationModal(false);
        setNotificationData({ title: '', message: '', type: 'announcement' });
      }
    } catch (error) {
      alert('Xabar yuborishda xatolik!');
    }
    setSendingNotification(false);
  };

  // Update user profile
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const result = await adminService.updateUserProfile(editingUser._id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        phone: editingUser.phone
      });
      if (result.success) {
        setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...editingUser } : u));
        setShowEditModal(false);
        setEditingUser(null);
        alert('Profil yangilandi!');
      }
    } catch (error) {
      alert('Profilni yangilashda xatolik!');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const result = await adminService.deleteUser(userToDelete._id);
      if (result.success) {
        setUsers(users.filter(u => u._id !== userToDelete._id));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        if (showUserModal && selectedUser?._id === userToDelete._id) {
          setShowUserModal(false);
          setSelectedUser(null);
        }
        alert('Foydalanuvchi o\'chirildi!');
      }
    } catch (error) {
      alert('Foydalanuvchini o\'chirishda xatolik!');
    }
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
              onClick={() => setShowNotificationModal(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Xabar yuborish"
            >
              <Bell className="w-5 h-5" />
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
                {/* Action Buttons */}
                {!selectedUser.isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingUser({ ...selectedUser });
                        setShowEditModal(true);
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Tahrirlash
                    </button>
                    {selectedUser.isBanned ? (
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
                        className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        Bloklash
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserToDelete(selectedUser);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      O'chirish
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Xabar yuborish
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sarlavha</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Xabar sarlavhasi..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Xabar matni</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Xabar matnini kiriting..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Xabar turi</label>
                <select
                  value={notificationData.type}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="announcement">E'lon</option>
                  <option value="system">Tizim xabari</option>
                </select>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <p className="text-sm text-gray-400 mb-2">💡 Maslahat:</p>
                <p className="text-xs text-gray-500">
                  Xabar matniga havola qo'shish uchun to'liq URL yozing. Masalan:<br/>
                  <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">https://t.me/infastai</code>
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendNotification}
                  disabled={sendingNotification}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {sendingNotification ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Barcha foydalanuvchilarga yuborish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                Profilni tahrirlash
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ism</label>
                  <input
                    type="text"
                    value={editingUser.firstName || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Familiya</label>
                  <input
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefon</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Saqlash
                </button>
                <button
                  onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Foydalanuvchini o'chirish
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                <strong className="text-white">{getUserName(userToDelete)}</strong> foydalanuvchisini o'chirishni tasdiqlaysizmi?
              </p>
              <p className="text-red-400 text-sm mb-6">
                ⚠️ Bu amalni qaytarib bo'lmaydi! Foydalanuvchining barcha ma'lumotlari o'chiriladi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Ha, o'chirish
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
