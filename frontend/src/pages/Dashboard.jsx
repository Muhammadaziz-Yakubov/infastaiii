import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Clock,
  Plus,
  Target,
  Zap,
  Award,
  ChevronRight,
  Bell,
  Activity,
  Star,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react';
import authService from '../services/authService';
import { goalsService } from '../services/goalsService';
import { taskService } from '../services/taskService';
import { financeService } from '../services/financeService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { userService } from '../services/userService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0 },
    goals: { total: 0, completed: 0, inProgress: 0 },
    finance: { income: 0, expense: 0, balance: 0 },
    recentActivity: []
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [profileResult, tasksData, goalsData, financeData] = await Promise.all([
          userService.getProfile().catch(err => ({ success: false })),
          taskService.getTasks().catch(() => ({ tasks: [] })),
          goalsService.getGoals().catch(() => ({ goals: [] })),
          financeService.getTransactions().catch(() => ({ transactions: [] }))
        ]);

        if (profileResult.success) {
          updateUser(profileResult.user);
        }

        const tasks = tasksData.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'completed');

        const goals = goalsData.goals || [];
        const goalsInProgress = goals.filter(g => g.status === 'in_progress');

        const transactions = financeData.transactions || [];
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Mix recent activity
        const recentTasks = tasks.slice(0, 3).map(t => ({
          type: 'task',
          date: new Date(t.createdAt),
          data: t
        }));
        const recentTx = transactions.slice(0, 3).map(t => ({
          type: 'finance',
          date: new Date(t.date || t.createdAt),
          data: t
        }));

        const activity = [...recentTasks, ...recentTx]
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);

        setStats({
          tasks: {
            total: tasks.length,
            completed: completedTasks.length,
            pending: tasks.length - completedTasks.length
          },
          goals: {
            total: goals.length,
            completed: goals.filter(g => g.status === 'completed').length,
            inProgress: goalsInProgress.length
          },
          finance: {
            income,
            expense,
            balance: income - expense
          },
          recentActivity: activity
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Hayrli tun';
    if (hour < 12) return 'Hayrli tong';
    if (hour < 18) return 'Hayrli kun';
    return 'Hayrli kech';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-8">
      {/* Header Section */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-200">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Salom, {user?.firstName || 'Foydalanuvchi'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{getGreeting()}!</p>
            </div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Umumiy balans</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-baseline gap-1">
            {showBalance ? (stats.finance.balance).toLocaleString() : '••••••••'} <span className="text-xl font-bold">so'm</span>
          </h2>
          {showBalance && (
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500 rotate-45" />
                <span className="text-xs text-emerald-500 font-medium">+{(stats.finance.income).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-red-500 -rotate-45" />
                <span className="text-xs text-red-500 font-medium">-{(stats.finance.expense).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions - Circle Buttons */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-2">
            <Link to="/finance" className="w-14 h-14 bg-[#D4FF00] rounded-full flex items-center justify-center shadow-lg shadow-[#D4FF00]/20 hover:scale-110 transition-transform active:scale-95">
              <TrendingUp className="w-6 h-6 text-black rotate-45" />
            </Link>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-300">Kirim</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link to="/finance" className="w-14 h-14 bg-[#D4FF00] rounded-full flex items-center justify-center shadow-lg shadow-[#D4FF00]/20 hover:scale-110 transition-transform active:scale-95">
              <TrendingDown className="w-6 h-6 text-black -rotate-45" />
            </Link>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-300">Chiqim</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => navigate('/more')} className="w-14 h-14 bg-[#D4FF00] rounded-full flex items-center justify-center shadow-lg shadow-[#D4FF00]/20 hover:scale-110 transition-transform active:scale-95">
              <Menu className="w-6 h-6 text-black" />
            </button>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-300">Boshqa</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Quick Actions Matrix */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tezkor amallar</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/tasks" className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Vazifa qo'shish</span>
            </Link>
            <Link to="/finance" className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Harajat qilish</span>
            </Link>
          </div>
        </section>

        {/* Goals Progress */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Maqsadlar</h3>
            <Link to="/goals" className="text-sm font-semibold text-blue-600 dark:text-blue-400">Barchasi</Link>
          </div>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">{stats.goals.inProgress} ta faol maqsad</p>
                <h4 className="text-2xl font-bold">Orzular sari olg'a!</h4>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>

            <button onClick={() => navigate('/goals')} className="mt-6 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Maqsadlarni ko'rish
            </button>

            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Tranzaksiyalar</h3>
            <Link to="/finance" className="text-sm font-bold text-[#6366F1]">Barchasi</Link>
          </div>

          <div className="space-y-3">
            {stats.recentActivity.filter(i => i.type === 'finance').length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700">
                <p className="text-gray-400 font-medium">Hozircha tranzaksiyalar yo'q</p>
              </div>
            ) : (
              stats.recentActivity.filter(i => i.type === 'finance').map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-[24px] border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.data.type === 'income'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                      }`}>
                      {item.data.type === 'income' ? <TrendingDown className="w-6 h-6 rotate-45" /> : <TrendingUp className="w-6 h-6 rotate-45" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-base truncate max-w-[150px]">
                        {item.data.description || item.data.category}
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        {item.data.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold text-lg ${item.data.type === 'income' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                      {item.data.type === 'income' ? '+' : '-'}{item.data.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;