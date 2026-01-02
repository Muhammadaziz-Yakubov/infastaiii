import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Tasks.css'
import {
  Plus, Play, CheckCircle, Trash2, Edit, Calendar, Flag,
  Clock, AlertTriangle, MoreVertical, CheckSquare, Square,
  TrendingUp, BarChart3, Filter, Search, Sparkles,
  Archive, RotateCcw, X, Eye, ListTodo,
  Grid, List, Loader2,
  ChevronDown, Star,
  RefreshCw, Download, Bell, WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import PomodoroTimer from '../components/PomodoroTimer';
import { saveToOffline, getFromOffline, addToPendingSync, STORES } from '../utils/offlineStorage';

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('active');
  const [viewMode, setViewMode] = useState('grid');
  const [showTaskMenu, setShowTaskMenu] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    tags: [],
    estimatedHours: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sort: 'newest',
    showOverdue: false,
    showToday: false
  });

  const [exportLoading, setExportLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    highPriority: 0,
    overdue: 0,
    today: 0
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(30000);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const tagInputRef = useRef(null);

  useEffect(() => {
    loadAllData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAllData();
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  // URL parametrini tekshirish (mobile + tugmasidan kelganda)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add') === 'true') {
      setShowModal(true);
      // URL dan parametrni tozalash
      navigate('/tasks', { replace: true });
    }
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Online bo'lsa serverdan olish
      if (navigator.onLine) {
        const data = await taskService.getTasks();
        if (data.success) {
          setTasks(data.tasks || []);
          // Offline uchun saqlash
          await saveToOffline(STORES.TASKS, data.tasks || []);
        }
      } else {
        // Offline bo'lsa IndexedDB dan olish
        const offlineTasks = await getFromOffline(STORES.TASKS);
        setTasks(offlineTasks || []);
        showToast('Offline rejim - saqlangan ma\'lumotlar ko\'rsatilmoqda', 'info');
      }

    } catch (error) {
      console.error('Load data error:', error);
      
      // Xatolik bo'lsa offline ma'lumotlarni ko'rsatish
      try {
        const offlineTasks = await getFromOffline(STORES.TASKS);
        if (offlineTasks && offlineTasks.length > 0) {
          setTasks(offlineTasks);
          showToast('Offline ma\'lumotlar ko\'rsatilmoqda', 'info');
          return;
        }
      } catch (offlineError) {
        console.error('Offline load error:', offlineError);
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Ma\'lumotlarni yuklashda xatolik';
      if (error.type === 'network' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        showToast('Serverga ulanib bo\'lmadi', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();

    setStats({
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      overdue: tasks.filter(t => {
        if (!t.deadline) return false;
        return new Date(t.deadline) < now;
      }).length,
      today: tasks.filter(t =>
        t.deadline && new Date(t.deadline).toDateString() === now.toDateString()
      ).length
    });
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(task =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
      );
    }
    // Status filter
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Today filter
    if (filters.showToday) {
      const today = new Date().toDateString();
      result = result.filter(task =>
        task.deadline && new Date(task.deadline).toDateString() === today
      );
    }

    // Overdue filter
    if (filters.showOverdue) {
      const now = new Date();
      result = result.filter(task =>
        task.deadline && new Date(task.deadline) < now
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'deadline_asc':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case 'deadline_desc':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(b.deadline) - new Date(a.deadline);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default: // created_desc (newest first)
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [tasks, searchTerm, filters]);

  // ✅ BU FUNKSIYALARI USE MEMO'DAN KEYIN QO'YING
  const handleView = (task) => {
    setViewingTask(task);
  };

  const handleCloseViewModal = () => {
    setViewingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Vazifa nomini kiriting', 'warning');
      return;
    }

    try {
      let data;
      if (editingTask) {
        data = await taskService.updateTask(editingTask._id, formData);
      } else {
        data = await taskService.createTask(formData);
      }

      if (data.success) {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          deadline: '',
          tags: [],
          estimatedHours: 0
        });
        setEditingTask(null);
        await loadAllData();
        showToast(
          editingTask ? 'Vazifa muvaffaqiyatli yangilandi' : 'Yangi vazifa yaratildi',
          'success'
        );
      } else {
        showToast(data.message || 'Xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('Server xatoligi', 'error');
    }
  };


  const handleComplete = async (taskId) => {
    if (!window.confirm('Bu vazifani tugatganingizni tasdiqlaysizmi? Vazifa arxivga o\'tadi.')) return;

    try {
      const data = await taskService.completeTask(taskId);

      if (data.success) {
        // Faqat faol vazifalardan o'chirish
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));

        showToast('Vazifa bajarildi! Arxiv sahifasida ko\'rishingiz mumkin', 'success');
      } else {
        showToast(data.message || 'Xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Complete error:', error);
      showToast('Server xatoligi', 'error');
    }
  };

  const handleDelete = async (taskId) => {
    const message = 'Vazifani o\'chirishni xohlaysizmi?';

    if (!window.confirm(message)) return;

    try {
      const data = await taskService.deleteTask(taskId);

      if (data.success) {
        await loadAllData();
        showToast('Vazifa o\'chirildi', 'success');
      } else {
        showToast(data.message || 'Xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Server xatoligi', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTasks.length === 0) {
      showToast('Hech qanday vazifa tanlanmagan', 'warning');
      return;
    }

    const confirmMessage = {
      delete: `${selectedTasks.length} ta vazifani o'chirishni xohlaysizmi?`,
      complete: `${selectedTasks.length} ta vazifani bajarilgan deb belgilashni xohlaysizmi?`
    }[action];

    if (!window.confirm(confirmMessage)) return;

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const taskId of selectedTasks) {
        try {
          let result;
          switch (action) {
            case 'delete':
              result = await taskService.deleteTask(taskId);
              break;
            case 'complete':
              result = await taskService.completeTask(taskId);
              break;
            default:
              continue;
          }

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      await loadAllData();
      setSelectedTasks([]);

      showToast(
        `${successCount} ta vazifa muvaffaqiyatli ${getActionText(action)}. ${errorCount > 0 ? `${errorCount} tasida xatolik.` : ''}`,
        errorCount > 0 ? 'warning' : 'success'
      );

    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('Amalni bajarishda xatolik', 'error');
    }
  };

  const getActionText = (action) => {
    const actions = {
      delete: "o'chirildi",
      complete: "tugatildi",
      start: "boshlangan"
    };
    return actions[action] || "bajarildi";
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      tags: task.tags || [],
      estimatedHours: task.estimatedHours || 0 // ✅ estimatedHours ni olish
    });
    setShowModal(true);
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task._id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: '⏳',
        label: 'Kutilmoqda'
      },
      in_progress: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '⚡',
        label: 'Jarayonda'
      }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
        <span className="text-xs">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <Flag className="w-3 h-3" />,
        label: 'Past'
      },
      medium: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <Flag className="w-3 h-3" />,
        label: 'O\'rta'
      },
      high: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: <Flag className="w-3 h-3" />,
        label: 'Yuqori'
      }
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;

    const now = new Date();
    const due = new Date(deadline);
    const diff = due - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hours = Math.ceil(diff / (1000 * 60 * 60));

    if (days < 0) {
      return {
        text: `${Math.abs(days)} kun o'tdi`,
        color: 'bg-rose-100 text-rose-700 border border-rose-200',
        icon: '⏰',
        urgent: true
      };
    } else if (days === 0) {
      if (hours <= 0) {
        return {
          text: 'Vaqt tugadi',
          color: 'bg-rose-100 text-rose-700 border border-rose-200',
          icon: '🔥',
          urgent: true
        };
      }
      return {
        text: `${hours} soat qoldi`,
        color: 'bg-amber-100 text-amber-700 border border-amber-200',
        icon: '⚡',
        urgent: true
      };
    } else if (days <= 1) {
      return {
        text: `${days} kun qoldi`,
        color: 'bg-amber-100 text-amber-700 border border-amber-200',
        icon: '⏳',
        urgent: true
      };
    } else if (days <= 3) {
      return {
        text: `${days} kun qoldi`,
        color: 'bg-blue-100 text-blue-700 border border-blue-200',
        icon: '📅',
        urgent: false
      };
    } else {
      return {
        text: `${days} kun qoldi`,
        color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        icon: '📅',
        urgent: false
      };
    }
  };

  const showToast = (message, type = 'info') => {
    const toastId = `toast-${Date.now()}`;
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `
      animate-slideInRight mb-3 p-4 rounded-xl shadow-lg border max-w-md
      ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
        type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-blue-50 border-blue-200 text-blue-800'}
    `;

    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="flex-1">
          <p class="font-medium">${message}</p>
        </div>
        <button onclick="document.getElementById('${toastId}').remove()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (document.getElementById(toastId)) {
        toast.classList.add('animate-slideOutRight');
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  };

  const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50';
    document.body.appendChild(container);
    return container;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belgilanmagan';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const addTag = () => {
    if (tagInputRef.current && tagInputRef.current.value.trim()) {
      const newTag = tagInputRef.current.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
      }
      tagInputRef.current.value = '';
      tagInputRef.current.focus();
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-[4px] border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ListTodo className="w-12 h-12 text-blue-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Vazifalar yuklanmoqda</h3>
          <p className="text-gray-600">Iltimos, kuting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-24 sm:pb-8">
      {/* Toast Container */}
      <div id="toast-container"></div>

      {/* Header Section - Mobile optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Vazifalar
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {stats.total} ta faol
              </p>
            </div>
          </div>

          {/* Action buttons - stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/archive')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm sm:text-base transition-all"
            >
              <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Bajarilganlar</span>
              <span className="sm:hidden">Arxiv</span>
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setFormData({
                  title: '',
                  description: '',
                  priority: 'medium',
                  deadline: '',
                  tags: [],
                  estimatedHours: 0
                });
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Yangi Vazifa
            </button>
          </div>
        </div>
      </div>

      {/* Pomodoro Timer Section */}
      {viewingTask && (
        <div className="mb-6">
          <PomodoroTimer 
            taskId={viewingTask._id}
            taskTitle={viewingTask.title}
            onComplete={() => {
              showToast('Pomodoro yakunlandi! Vazifa bajarildi deb belgilash mumkin.', 'success');
            }}
          />
        </div>
      )}

      {/* Stats Section - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:block">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg sm:hidden">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Jami</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
            <div className="hidden sm:block p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:block">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg sm:hidden">
                <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Bugun</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
              </div>
            </div>
            <div className="hidden sm:block p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Play className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:block">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg sm:hidden">
                <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Muhim</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</p>
              </div>
            </div>
            <div className="hidden sm:block p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:block">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg sm:hidden">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">O'tgan</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
              </div>
            </div>
            <div className="hidden sm:block p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid/List View */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 sm:py-20 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 dark:bg-gray-700 rounded-full mb-4 sm:mb-6 border border-gray-200 dark:border-gray-600">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Vazifalar yo'q
          </h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto px-4">
            {searchTerm || Object.values(filters).some(v => v && v !== 'newest')
              ? 'Filtrlar bo\'yicha vazifalar topilmadi. Filtrlarni o\'zgartirib ko\'ring.'
              : 'Hozircha vazifalar mavjud emas. Birinchi vazifangizni yarating va ishni boshlang!'}
          </p>
          {!searchTerm && !Object.values(filters).some(v => v && v !== 'newest') && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Birinchi Vazifani Yarating
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View - responsive */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredTasks.map((task) => {
            const timeRemaining = getTimeRemaining(task.deadline);
            const isSelected = selectedTasks.includes(task._id);

            return (
              <div
                key={task._id}
                className={`bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-lg group grid-task-card ${isSelected
                  ? 'border-orange-500 shadow-lg shadow-blue-500/20'
                  : 'border-gray-200 hover:border-orange-200'
                  } ${timeRemaining?.urgent ? 'ring-2 ring-amber-200' : ''}`}
              >
                <div className="p-5 task-card-content">
                  {/* Header with selection */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 flex-truncate-container">
                      <button
                        onClick={() => toggleTaskSelection(task._id)}
                        className="flex-shrink-0 mt-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="font-bold text-lg text-gray-900 task-title-truncate task-title-responsive"
                            title={task.title}
                          >
                            {task.title}
                          </h3>
                          <div className="flex-shrink-0">
                            {task.priority === 'high' && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </div>

                        {task.createdAt && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            Yaratilgan: {formatDate(task.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setShowTaskMenu(showTaskMenu === task._id ? null : task._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>

                      {showTaskMenu === task._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowTaskMenu(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 py-2">
                            <button
                              onClick={() => {
                                handleView(task);
                                setShowTaskMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                              Ko'rish
                            </button>
                            <button
                              onClick={() => {
                                handleEdit(task);
                                setShowTaskMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => {
                                handleComplete(task._id);
                                setShowTaskMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-emerald-50 flex items-center gap-3 text-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Bajarildi
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(task._id);
                                setShowTaskMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-rose-50 flex items-center gap-3 text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              O'chirish
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-4 task-description-truncate break-long-words">
                      {task.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="task-badge-container mb-5">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}

                    {timeRemaining && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${timeRemaining.color} rounded-lg text-xs font-medium`}>
                        <span>{timeRemaining.icon}</span>
                        {timeRemaining.text}
                      </div>
                    )}
                  </div>

                  {/* Deadline and Time */}
                  <div className="flex items-center justify-between mb-4">
                    {task.deadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(task.deadline)}
                        {task.estimatedHours > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {task.estimatedHours}h
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-400">
                      ID: {task._id?.substring(0, 8) || 'N/A'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-3">
                      {/* Asosiy amal - katta tugma */}
                      <button
                        onClick={() => handleComplete(task._id)}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Bajarildi
                      </button>

                      {/* Ikkinchi darajali amallar */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleView(task)}
                          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ko'rish
                        </button>

                        <button
                          onClick={() => handleEdit(task)}
                          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-medium transition-all"
                        >
                          <Edit className="w-4 h-4" />
                          Tahrirlash
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left">
                    <button
                      onClick={selectAllTasks}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Tanlash
                    </button>
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Vazifa</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Holat</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Muhimlik</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Muddat</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const timeRemaining = getTimeRemaining(task.deadline);
                  const isSelected = selectedTasks.includes(task._id);

                  return (
                    <tr
                      key={task._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-orange-50' : ''
                        } ${timeRemaining?.urgent ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleTaskSelection(task._id)}
                          className="flex items-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-6">
                        <div className="list-view-cell">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 task-title-truncate">
                              {task.title}
                            </h4>
                            {task.priority === 'high' && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 task-description-truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(task.status)}
                      </td>

                      <td className="py-4 px-6">
                        {getPriorityBadge(task.priority)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {task.deadline ? (
                            <>
                              <div className="text-sm text-gray-900">
                                {formatDate(task.deadline)}
                              </div>
                              {timeRemaining && (
                                <div className={`text-xs ${timeRemaining.urgent ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                                  {timeRemaining.text}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Belgilanmagan</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleComplete(task._id)}
                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Bajarildi"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal - Mobile optimized */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-modal-up sm:animate-none">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Vazifani Tahrirlash' : 'Yangi Vazifa'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    deadline: '',
                    tags: [],
                    estimatedHours: 0
                  });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Vazifa nomi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Vazifa nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Vazifa nomini kiriting"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Ta'rif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ta'rif (ixtiyoriy)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Qo'shimcha ma'lumot..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                />
              </div>

              {/* Muhimlik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Muhimlik
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'low', label: 'Past', color: 'bg-gray-100 text-gray-700' },
                    { value: 'medium', label: "O'rta", color: 'bg-yellow-100 text-yellow-700' },
                    { value: 'high', label: 'Yuqori', color: 'bg-red-100 text-red-700' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value })}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${formData.priority === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-gray-300`
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Muddat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      priority: 'medium',
                      deadline: '',
                      tags: [],
                      estimatedHours: 0
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium"
                >
                  {editingTask ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Task Modal - Mobile optimized */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-modal-up sm:animate-none">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                    {viewingTask.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(viewingTask.status)}
                    {getPriorityBadge(viewingTask.priority)}
                  </div>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Tavsif */}
              {viewingTask.description && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{viewingTask.description}</p>
                </div>
              )}

              {/* Ma'lumotlar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Muddat</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {viewingTask.deadline ? formatDate(viewingTask.deadline) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yaratilgan</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {formatDate(viewingTask.createdAt)}
                  </p>
                </div>
              </div>

              {/* Amallar */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => {
                    handleComplete(viewingTask._id);
                    handleCloseViewModal();
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-xs font-medium">Bajarildi</span>
                </button>

                <button
                  onClick={() => {
                    handleEdit(viewingTask);
                    handleCloseViewModal();
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl"
                >
                  <Edit className="w-5 h-5" />
                  <span className="text-xs font-medium">Tahrirlash</span>
                </button>

                <button
                  onClick={() => {
                    handleDelete(viewingTask._id);
                    handleCloseViewModal();
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-xs font-medium">O'chirish</span>
                </button>
              </div>

              {/* Yopish tugmasi */}
              <button
                onClick={handleCloseViewModal}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Tasks;