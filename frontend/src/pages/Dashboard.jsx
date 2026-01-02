// src/pages/Dashboard.jsx - Perfect Beautiful Dashboard
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wallet, 
  Goal, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Award,
  BarChart3,
  Activity,
  Zap,
  Plus,
  Target,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Flame,
  Star,
  Rocket
} from 'lucide-react';
import authService from '../services/authService';
import { goalsService } from '../services/goalsService';
import { taskService } from '../services/taskService';
import { financeService } from '../services/financeService';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
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

        // Fetch fresh user profile data
        try {
          const profileData = await userService.getProfile();
          if (profileData.success) {
            updateUser(profileData.user);
          }
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
        }

        // Load tasks
        const tasksData = await taskService.getTasks();
        const tasks = tasksData.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const pendingTasks = tasks.filter(t => t.status !== 'completed');
        const overdueTasks = tasks.filter(t => {
          if (!t.deadline) return false;
          return new Date(t.deadline) < new Date() && t.status !== 'completed';
        });

        // Load goals
        const goalsData = await goalsService.getGoals();
        const goals = goalsData.goals || [];
        const completedGoals = goals.filter(g => g.status === 'completed');
        const inProgressGoals = goals.filter(g => g.status === 'in_progress');

        // Load finance
        const financeData = await financeService.getTransactions();
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

        // Get upcoming deadlines
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
        // Silently fail - dashboard will show empty state
        // Network errors are already handled by api interceptor
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
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Ma'lumotlar yuklanmoqda...</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-6 w-full transition-colors duration-300">
      {/* Hero Section - Mobile optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-sm border border-gray-200 dark:border-gray-700 w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-6">
          <div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {getGreeting()}, {user?.firstName || 'Foydalanuvchi'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
              {new Date().toLocaleDateString('uz-UZ', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>

        </div>
      </div>

      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        {/* Tasks Card - Mobile optimized */}
        <Link 
          to="/tasks"
          className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-3 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.tasks.total}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Vazifalar</p>
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2 hidden sm:block">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bajarildi</span>
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
                <span>{stats.tasks.overdue} muddati o'tgan</span>
              </div>
            )}
          </div>
          {/* Mobile progress bar */}
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden sm:hidden mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </Link>

        {/* Goals Card - Mobile optimized */}
        <Link
          to="/goals"
          className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-3 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.goals.total}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Maqsadlar</p>
            </div>
          </div>
          <div className="space-y-2 hidden sm:block">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Yakunlandi</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.goals.completed}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${goalCompletionRate}%` }}
              />
            </div>
            {stats.goals.inProgress > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Rocket className="w-3 h-3" />
                <span>{stats.goals.inProgress} jarayonda</span>
              </div>
            )}
          </div>
          {/* Mobile progress bar */}
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden sm:hidden mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${goalCompletionRate}%` }}
            />
          </div>
        </Link>

        {/* Finance Card - Mobile optimized */}
        <Link 
          to="/finance"
          className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-3 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="sm:text-right">
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {stats.finance.balance >= 0 ? '+' : ''}{(stats.finance.balance / 1000).toFixed(0)}k
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Balans</p>
            </div>
          </div>
          <div className="space-y-2 hidden sm:block">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.finance.income.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                <span>{stats.finance.expense.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Bu oy: {stats.finance.thisMonth >= 0 ? '+' : ''}{stats.finance.thisMonth.toLocaleString()} UZS
            </div>
          </div>
        </Link>

        {/* Productivity Card - Mobile optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {taskCompletionRate + goalCompletionRate > 0
                  ? Math.round((taskCompletionRate + goalCompletionRate) / 2)
                  : 0}%
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Samaradorlik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Mobile optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Tasks Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                So'nggi vazifalar
              </h2>
              <Link
                to="/tasks"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 text-sm font-semibold transition-colors"
              >
                Barchasi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {stats.recentTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">Hozircha vazifalar yo'q</p>
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Vazifa qo'shish
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {stats.recentTasks.slice(0, 3).map((task, index) => (
                  <Link
                    key={task._id || index}
                    to="/tasks"
                    className="block p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm sm:text-base font-semibold truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {task.status === 'completed' ? '✓' : '○'}
                          </span>
                          {task.priority === 'high' && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              !
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines - Mobile optimized */}
          {stats.upcomingDeadlines.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-red-100 dark:border-red-900/30">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3 sm:mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                Yaqin muddatlar
              </h2>
              <div className="space-y-2">
                {stats.upcomingDeadlines.map((task, index) => (
                  <div key={task._id || index} className="flex items-center justify-between p-2 sm:p-3 bg-white/70 dark:bg-gray-800/50 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate flex-1 mr-2">{task.title}</span>
                    <span className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
                      {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block space-y-6">
          {/* Goals Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Maqsadlar
              </h2>
              <Link
                to="/goals"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                Barchasi
              </Link>
            </div>

            {stats.recentGoals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Maqsadlar yo'q</p>
                <Link
                  to="/goals"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Maqsad qo'shish
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentGoals.map((goal, index) => (
                  <Link
                    key={goal._id || index}
                    to="/goals"
                    className="block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-100 dark:border-blue-800"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                      {goal.title}
                    </h3>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {goal.progress || 0}% bajarildi
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Tezkor amallar
            </h2>
            <div className="space-y-2">
              <Link
                to="/tasks"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-300 group"
              >
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">Vazifa qo'shish</span>
              </Link>
              <Link
                to="/finance"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-300 group"
              >
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Tranzaksiya</span>
              </Link>
              <Link
                to="/goals"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-300 group"
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">Maqsad qo'shish</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
