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
  Award,
  Plus,
  Target,
  CheckCircle2,
  AlertCircle,
  Rocket
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
    tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
    goals: { total: 0, completed: 0, inProgress: 0 },
    finance: { income: 0, expense: 0, balance: 0, thisMonth: 0 },
    recentTasks: [],
    recentGoals: [],
    upcomingDeadlines: []
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
          userService.getProfile().catch(err => ({ success: false, error: err })),
          taskService.getTasks().catch(err => ({ tasks: [] })),
          goalsService.getGoals().catch(err => ({ goals: [] })),
          financeService.getTransactions().catch(err => ({ transactions: [] }))
        ]);

        if (profileResult.success) {
          updateUser(profileResult.user);
        }

        const tasks = tasksData.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const pendingTasks = tasks.filter(t => t.status !== 'completed');
        const overdueTasks = tasks.filter(t => {
          if (!t.deadline) return false;
          return new Date(t.deadline) < new Date() && t.status !== 'completed';
        });

        const goals = goalsData.goals || [];
        const completedGoals = goals.filter(g => g.status === 'completed');
        const inProgressGoals = goals.filter(g => g.status === 'in_progress');

        const transactions = financeData.transactions || [];
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const thisMonth = new Date().getMonth();
        const thisMonthTransactions = transactions.filter(t => {
          const date = new Date(t.date || t.createdAt);
          return date.getMonth() === thisMonth;
        });
        const thisMonthIncome = thisMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const thisMonthExpense = thisMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const upcomingDeadlines = tasks
          .filter(t => t.deadline && t.status !== 'completed')
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 3);

        setStats({
          tasks: {
            total: tasks.length,
            completed: completedTasks.length,
            pending: pendingTasks.length,
            overdue: overdueTasks.length
          },
          goals: {
            total: goals.length,
            completed: completedGoals.length,
            inProgress: inProgressGoals.length
          },
          finance: {
            income,
            expense,
            balance: income - expense,
            thisMonth: thisMonthIncome - thisMonthExpense
          },
          recentTasks: tasks.slice(0, 5),
          recentGoals: goals.slice(0, 3),
          upcomingDeadlines
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 w-full">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const taskCompletionRate = stats.tasks.total > 0
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const goalCompletionRate = stats.goals.total > 0
    ? Math.round((stats.goals.completed / stats.goals.total) * 100)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-6 w-full">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getGreeting()}, {user?.firstName || 'Foydalanuvchi'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('uz-UZ', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.tasks.total}</div>
              <div className="text-xs text-gray-500">Vazifalar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.goals.total}</div>
              <div className="text-xs text-gray-500">Maqsadlar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Tasks Card */}
        <Link
          to="/tasks"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.tasks.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vazifalar</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bajarilgan</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.tasks.completed}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
            {stats.tasks.overdue > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span>{stats.tasks.overdue} kechikkan</span>
              </div>
            )}
          </div>
        </Link>

        {/* Goals Card */}
        <Link
          to="/goals"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.goals.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Maqsadlar</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tugatilgan</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.goals.completed}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${goalCompletionRate}%` }}
              />
            </div>
            {stats.goals.inProgress > 0 && (
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                <Rocket className="w-3 h-3" />
                <span>{stats.goals.inProgress} jarayonda</span>
              </div>
            )}
          </div>
        </Link>

        {/* Finance Card */}
        <Link
          to="/finance"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.finance.balance >= 0 ? '+' : ''}{(stats.finance.balance / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balans</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>{(stats.finance.income / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                <span>{(stats.finance.expense / 1000).toFixed(0)}k</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Bu oy: {stats.finance.thisMonth >= 0 ? '+' : ''}{(stats.finance.thisMonth / 1000).toFixed(0)}k UZS
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                So'nggi vazifalar
              </h2>
              <Link
                to="/tasks"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 text-sm font-semibold"
              >
                Barchasi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {stats.recentTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Vazifalar yo'q</p>
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Vazifa qo'shish
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTasks.slice(0, 5).map((task, index) => (
                  <div
                    key={task._id || index}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        {task.priority === 'high' && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Muhim
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          {stats.upcomingDeadlines.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-900/30">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-red-500" />
                Yaqinlashayotgan muddatlar
              </h2>
              <div className="space-y-2">
                {stats.upcomingDeadlines.map((task, index) => (
                  <div key={task._id || index} className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/50 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white truncate flex-1 mr-2">{task.title}</span>
                    <span className="text-sm text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
                      {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Goals */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Maqsadlar
              </h2>
              <Link
                to="/goals"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 text-sm font-semibold"
              >
                Barchasi
              </Link>
            </div>

            {stats.recentGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Maqsadlar yo'q</p>
                <Link
                  to="/goals"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Maqsad qo'shish
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentGoals.map((goal, index) => (
                  <div
                    key={goal._id || index}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                      {goal.title}
                    </h3>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {goal.progress || 0}% bajarildi
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;