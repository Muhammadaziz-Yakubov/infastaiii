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
  Star
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
      <div className="px-6 pt-8 pb-6 bg-white dark:bg-gray-800 rounded-b-[32px] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.firstName || 'Foydalanuvchi'}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  {user?.firstName?.[0] || 'U'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Stats Cards - Scrollable on Mobile */}
        <div className="flex overflow-x-auto gap-4 pb-2 -mx-6 px-6 scrollbar-hide">
          {/* Balance Card */}
          <div className="min-w-[280px] h-[160px] rounded-[24px] bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-md">Jami balans</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold tracking-tight mb-1">
                  {(stats.finance.balance).toLocaleString()} <span className="text-lg font-medium text-gray-400">so'm</span>
                </h3>
                <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                  <span className="flex items-center text-emerald-400 gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" /> +{(stats.finance.income).toLocaleString()}
                  </span>
                  <span className="flex items-center text-rose-400 gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    <TrendingDown className="w-3 h-3" /> -{(stats.finance.expense).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Card */}
          <div className="min-w-[280px] h-[160px] rounded-[24px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-xl shadow-blue-500/5 dark:shadow-none relative group">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Samaradorlik</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Vazifalar</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stats.tasks.completed}/{stats.tasks.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.tasks.total > 0 ? (stats.tasks.completed / stats.tasks.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
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

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">So'nggi faoliyat</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-[24px] p-2 shadow-sm border border-gray-100 dark:border-gray-700">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Hozircha faoliyat yo'q</p>
              </div>
            ) : (
              stats.recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-2xl transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'task'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : item.data.type === 'income'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                    {item.type === 'task' ? <CheckSquare className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                      {item.type === 'task' ? item.data.title : (item.data.description || item.data.category)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>

                  {item.type === 'finance' && (
                    <span className={`font-bold text-sm ${item.data.type === 'income' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                      {item.data.type === 'income' ? '+' : '-'}{item.data.amount.toLocaleString()}
                    </span>
                  )}
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