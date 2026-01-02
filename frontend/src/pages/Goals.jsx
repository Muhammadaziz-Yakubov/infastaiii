import React, { useState, useEffect, useRef } from 'react';
import {
    Target, TrendingUp, Calendar, Wallet, Clock,
    Plus, Edit, Trash2, X, CheckCircle, AlertCircle,
    ChevronRight, DollarSign, Percent, Sparkles,
    BarChart3, PiggyBank, Brain, Bell, Settings,
    RefreshCw, Download, Filter, Search, MoreVertical,
    Play, Pause, CheckSquare, Circle, Award,
    ArrowUpRight, ArrowDownRight, Users, Home, Car,
    ShoppingBag, BookOpen, Briefcase, Gift, HeartPulse, WifiOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CurrencyInput from '../components/CurrencyInput';
import { goalsService } from '../services/goalsService';
import { financeService } from '../services/financeService';
import { taskService } from '../services/taskService';
import { formatCurrency, formatCurrencyShort } from '../utils/currency';
import GoalProgressChart from '../components/GoalProgressChart';
import { saveToOffline, getFromOffline, STORES } from '../utils/offlineStorage';

// Icon mapping for goals
const goalIconMap = {
    Home, Car, ShoppingBag, BookOpen, Briefcase,
    Gift, HeartPulse, Target, Wallet, PiggyBank,
    Award, Users
};

const Goals = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [userStats, setUserStats] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [showAutoSaveModal, setShowAutoSaveModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showStatisticsModal, setShowStatisticsModal] = useState(false);

    // Selected goal
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        icon: 'Target',
        color: '#3B82F6',
        status: 'active',
        priority: 'medium',
        category: 'personal'
    });

    // Funding form
    const [fundFormData, setFundFormData] = useState({
        amount: 0,
        source: 'manual',
        description: ''
    });

    // Auto-save settings
    const [autoSaveSettings, setAutoSaveSettings] = useState({
        type: 'monthly',
        amount: '',
        percentage: 10,
        startDate: new Date().toISOString().split('T')[0]
    });

    // Task generator form
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium'
    });

    // AI Suggestions
    const [aiSuggestions, setAiSuggestions] = useState([]);

    // refreshAiSuggestions funksiyasini qo'shing
    const refreshAiSuggestions = () => {
        generateAiSuggestions();
        toast.success('AI maslahatlari yangilandi 🔄');
    };

    // handleSuggestionAction funksiyasini qo'shing
    const handleSuggestionAction = (suggestion) => {
        if (suggestion.goalId) {
            const goal = goals.find(g => g._id === suggestion.goalId);
            if (goal) {
                setSelectedGoal(goal);
                // Modallarni yopish
                setShowFundModal(false);
                setShowAutoSaveModal(false);
                setShowTaskModal(false);
                
                // AI maslahatiga qarab harakat qilish
                if (suggestion.type === 'funding') {
                    handleFund(goal);
                } else if (suggestion.type === 'autosave') {
                    handleAutoSave(goal);
                }
            }
        }
    };

    // dismissSuggestion funksiyasini qo'shing
    const dismissSuggestion = (suggestionId) => {
        setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    };

    // Progress calculator
    const calculateProgress = (goal) => {
        if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        return Math.min(100, Math.round(progress * 10) / 10); // 1 o'nli kasrgacha
    };

    // Days remaining calculator
    const calculateDaysRemaining = (deadline) => {
        if (!deadline) return null;
        const now = new Date();
        const due = new Date(deadline);
        const diff = due - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    // Load all data
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (goals.length > 0 && !loading) {
            generateAiSuggestions();
        }
    }, [goals, loading]);

    // URL parametrini tekshirish (mobile + tugmasidan kelganda)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('add') === 'true') {
            setShowAddModal(true);
            // URL dan parametrni tozalash
            navigate('/goals', { replace: true });
        }
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (navigator.onLine) {
                // Online - serverdan olish
                const goalsData = await goalsService.getGoals();
                
                if (goalsData.success) {
                    const loadedGoals = goalsData.goals || [];
                    setGoals(loadedGoals);
                    await saveToOffline(STORES.GOALS, loadedGoals);
                    
                    setTimeout(() => generateAiSuggestions(), 100);
                } else {
                    setGoals(demoGoals);
                    generateAiSuggestions();
                }
                
                const transData = await financeService.getTransactions();
                if (transData.success) {
                    setTransactions(transData.transactions || []);
                }
            } else {
                // Offline - IndexedDB dan olish
                const offlineGoals = await getFromOffline(STORES.GOALS);
                setGoals(offlineGoals || []);
                toast('Offline rejim - saqlangan ma\'lumotlar', { icon: '📴' });
            }
            
        } catch (error) {
            console.error('Load error:', error);
            
            // Xatolik bo'lsa offline ma'lumotlarni ko'rsatish
            try {
                const offlineGoals = await getFromOffline(STORES.GOALS);
                if (offlineGoals?.length > 0) {
                    setGoals(offlineGoals);
                    toast('Offline ma\'lumotlar ko\'rsatilmoqda', { icon: '📴' });
                    return;
                }
            } catch (offlineError) {
                console.error('Offline load error:', offlineError);
            }
            
            if (error.message?.includes('Network Error')) {
                toast.error('Serverga ulanib bo\'lmadi');
            } else {
                toast.error(error.message || 'Yuklashda xatolik');
            }
            
            if (!goals.length) {
                setGoals(demoGoals);
                generateAiSuggestions();
            }
        } finally {
            setLoading(false);
        }
    };

    const generateAiSuggestions = () => {
        const suggestions = [];

        if (!goals || goals.length === 0) {
            // Agar goals yo'q bo'lsa
            suggestions.push({
                id: 'no-goals',
                type: 'funding',
                title: 'Birinchi maqsadingizni yarating! 🎯',
                description: 'Maqsadlar yo\'q. Birinchi maqsadingizni yarating va moliyaviy rejangizni boshlang!',
                priority: 'high'
            });
            setAiSuggestions(suggestions);
            return;
        }

        // Har bir goal uchun maslahatlar generatsiya qilish
        goals.forEach((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = calculateDaysRemaining(goal.deadline);
            const neededAmount = goal.targetAmount - goal.currentAmount;
            const dailyNeeded = daysRemaining > 0 ? neededAmount / daysRemaining : neededAmount;
            const monthlyNeeded = dailyNeeded * 30;

            // Progress milestone maslahatlari
            const milestones = [25, 50, 75, 90, 100];
            const reachedMilestone = milestones.find(m => progress >= m);
            const nextMilestone = milestones.find(m => progress < m);

            if (reachedMilestone) {
                suggestions.push({
                    id: `goal-${goal._id}-milestone-${reachedMilestone}`,
                    type: 'milestone',
                    title: `🎉 Tabriklaymiz! "${goal.name}" ${reachedMilestone}% ga yetdi!`,
                    description: `Maqsadingizning ${reachedMilestone}% qismi bajarildi. Qolgan ${100 - reachedMilestone}% ga e'tibor qarating.`,
                    goalId: goal._id,
                    priority: 'high'
                });
            }

            // Deadline yaqinlashganda
            if (daysRemaining > 0 && daysRemaining <= 30) {
                suggestions.push({
                    id: `goal-${goal._id}-deadline-${daysRemaining}`,
                    type: 'reminder',
                    title: `⏳ "${goal.name}" uchun ${daysRemaining} kun qoldi!`,
                    description: `Har kuni ${formatCurrency(dailyNeeded)} yoki har oy ${formatCurrency(monthlyNeeded)} ajratsangiz, maqsadga erishasiz.`,
                    goalId: goal._id,
                    priority: daysRemaining <= 7 ? 'high' : 'medium'
                });
            }

            // Progress past bo'lsa
            if (progress < 20 && daysRemaining > 0 && daysRemaining <= 90) {
                suggestions.push({
                    id: `goal-${goal._id}-low-progress`,
                    type: 'funding',
                    title: `⚠️ "${goal.name}" progressi past: ${progress}%`,
                    description: `Progress juda past. Har oy ${formatCurrency(monthlyNeeded)} ajratishni rejalashtiring.`,
                    goalId: goal._id,
                    priority: 'high'
                });
            }

            // Auto-save yo'q bo'lsa
            if (!goal.autoSave && progress < 80) {
                suggestions.push({
                    id: `goal-${goal._id}-autosave`,
                    type: 'funding',
                    title: `💰 "${goal.name}" uchun avtomatik tejash`,
                    description: `Har oy ${formatCurrency(goal.targetAmount / 12)} ajratsangiz, 12 oyda maqsadga erishasiz.`,
                    goalId: goal._id,
                    priority: 'medium'
                });
            }

            // Mablag' yetarli emas
            if (progress > 80 && neededAmount > 0) {
                suggestions.push({
                    id: `goal-${goal._id}-final-push`,
                    type: 'milestone',
                    title: `🚀 "${goal.name}" yaqinlashmoqda!`,
                    description: `Faqat ${formatCurrency(neededAmount)} qoldi. So'nggi mablag'ni ajratish uchun harakat qiling.`,
                    goalId: goal._id,
                    priority: 'high'
                });
            }
        });

        // Goal completion analytics
        const completedGoals = goals.filter(g => g.status === 'completed').length;
        const activeGoals = goals.filter(g => g.status === 'active').length;
        const totalProgress = goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length;

        if (completedGoals > 0) {
            suggestions.push({
                id: 'summary-completed',
                type: 'milestone',
                title: `🏆 ${completedGoals} ta maqsad bajarildi!`,
                description: 'Sizning motivatsiyangiz ajoyib! Yangi maqsadlar qo\'shing.',
                priority: 'medium'
            });
        }

        if (totalProgress >= 50) {
            suggestions.push({
                id: 'summary-good-progress',
                type: 'milestone',
                title: `📊 O'rtacha progress: ${totalProgress.toFixed(1)}%`,
                description: 'Maqsadlaringizga erishishda yaxshi natijalar qayd etmoqdasiz!',
                priority: 'medium'
            });
        }

        // Priority bo'yicha sort qilish
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        suggestions.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

        // Faqat 5 ta eng muhim maslahatni ko'rsatish
        setAiSuggestions(suggestions.slice(0, 5));
    };

    // Format currency - currency utils dan import qilingan

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || colors.active;
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const colors = {
            high: 'bg-red-100 text-red-800 border border-red-200',
            medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            low: 'bg-green-100 text-green-800 border border-green-200'
        };
        return colors[priority] || colors.medium;
    };

    // Filter goals
    const filteredGoals = goals.filter(goal => {
        // Search filter
        if (searchQuery && !goal.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !goal.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Status filter
        if (statusFilter !== 'all' && goal.status !== statusFilter) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        // Sorting
        switch (sortBy) {
            case 'deadline':
                return new Date(a.deadline) - new Date(b.deadline);
            case 'amount':
                return b.targetAmount - a.targetAmount;
            case 'progress':
                return calculateProgress(b) - calculateProgress(a);
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    // Handle create/update goal
    const handleGoalSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.targetAmount || !formData.deadline) {
            toast.error('Nomi, maqsad summasi va muddati majburiy');
            return;
        }

        try {
            const goalData = {
                ...formData,
                targetAmount: typeof formData.targetAmount === 'number' ? formData.targetAmount : parseFloat(formData.targetAmount),
                currentAmount: typeof formData.currentAmount === 'number' ? formData.currentAmount : (parseFloat(formData.currentAmount) || 0)
            };

            let data;
            if (selectedGoal) {
                data = await goalsService.updateGoal(selectedGoal._id, goalData);
            } else {
                data = await goalsService.createGoal(goalData);
            }

            if (data.success) {
                toast.success(selectedGoal ? 'Maqsad yangilandi ✅' : 'Maqsad yaratildi ✅');
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
                loadData();
            } else {
                toast.error(data.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Server bilan bog\'lanishda xatolik');
        }
    };

    // Handle funding
    const handleFundSubmit = async (e) => {
        e.preventDefault();

        if (!fundFormData.amount || parseFloat(fundFormData.amount) <= 0) {
            toast.error('Summani kiriting');
            return;
        }

        try {
            const fundValue = typeof fundFormData.amount === 'number' ? fundFormData.amount : parseFloat(fundFormData.amount);
            
            // 1. Goal ga mablag' qo'shish
            const goalData = await goalsService.fundGoal(selectedGoal._id, {
                amount: fundValue,
                description: fundFormData.description || 'Mablag\' ajratish'
            });

            if (goalData.success) {
                // 2. Agar source = finance bo'lsa, moliyaviy tranzaksiya yaratish
                if (fundFormData.source === 'finance') {
                    await financeService.createTransaction({
                        type: 'expense',
                        amount: fundValue,
                        category: 'Goal Funding',
                        description: fundFormData.description || `${selectedGoal.name} maqsadi uchun mablag'`,
                        date: new Date().toISOString().split('T')[0]
                    });
                }

                toast.success(`Mablag' ajratildi: ${formatCurrency(fundValue)}`);
                setShowFundModal(false);
                setFundFormData({ amount: 0, source: 'manual', description: '' });
                loadData();

                // Progress milestone notification
                const progress = calculateProgress(selectedGoal);
                const milestones = [25, 50, 75, 100];
                const reachedMilestone = milestones.find(m => progress >= m && (progress - fundValue / selectedGoal.targetAmount * 100) < m);

                if (reachedMilestone) {
                    toast.success(`🎉 Tabriklaymiz! "${selectedGoal.name}" maqsadi ${reachedMilestone}% ga yetdi!`);
                }
            }
        } catch (error) {
            console.error('Funding error:', error);
            toast.error('Mablag\' ajratishda xatolik');
        }
    };

    // Handle auto-save setup
    const handleAutoSaveSubmit = async (e) => {
        e.preventDefault();

        if (!autoSaveSettings.amount && autoSaveSettings.type !== 'percentage') {
            toast.error('Summani kiriting');
            return;
        }

        try {
            // Note: Auto-save endpoint may not be fully implemented in backend
            // This is a placeholder for when it's ready
            const data = await goalsService.setupAutoSave(selectedGoal._id, autoSaveSettings);

            if (data.success) {
                toast.success('Avtomatik tejash yoqildi ✅');
                setShowAutoSaveModal(false);
                setAutoSaveSettings({
                    type: 'monthly',
                    amount: '',
                    percentage: 10,
                    startDate: new Date().toISOString().split('T')[0]
                });
                loadData();
            }
        } catch (error) {
            console.error('Auto-save error:', error);
            toast.error('Avtomatik tejashni sozlashda xatolik');
        }
    };

    // Handle task generation
    const handleTaskGenerate = async (e) => {
        e.preventDefault();

        if (!taskFormData.title) {
            toast.error('Vazifa nomini kiriting');
            return;
        }

        try {
            const data = await taskService.createTask({
                ...taskFormData,
                goalId: selectedGoal._id,
                status: 'pending'
            });

            if (data.success) {
                toast.success('Vazifa yaratildi ✅');
                setShowTaskModal(false);
                setTaskFormData({
                    title: '',
                    description: '',
                    deadline: '',
                    priority: 'medium'
                });

                // AI suggestion to add progress
                setTimeout(() => {
                    toast.success('💡 Maslahat: Vazifani bajarganingizda, maqsad progressiga 5% qo\'shiladi!');
                }, 1000);
            }
        } catch (error) {
            console.error('Task generation error:', error);
            toast.error('Vazifa yaratishda xatolik');
        }
    };

    // Handle goal status change
    const handleStatusChange = async (goalId, newStatus) => {
        try {
            const data = await goalsService.updateGoalStatus(goalId, newStatus);

            if (data.success) {
                toast.success(`Status "${newStatus}" ga o'zgartirildi`);
                loadData();
            }
        } catch (error) {
            console.error('Status change error:', error);
            toast.error('Statusni o\'zgartirishda xatolik');
        }
    };

    // Handle goal delete
    const handleDeleteGoal = async (goalId) => {
        if (!window.confirm('Bu maqsadni o\'chirmoqchimisiz? Barcha bog\'liq ma\'lumotlar ham o\'chiriladi.')) {
            return;
        }

        try {
            const data = await goalsService.deleteGoal(goalId);

            if (data.success) {
                toast.success('Maqsad o\'chirildi 🗑️');
                loadData();
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('O\'chirishda xatolik');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            targetAmount: 0,
            currentAmount: 0,
            deadline: '',
            icon: 'Target',
            color: '#3B82F6',
            status: 'active',
            priority: 'medium',
            category: 'personal'
        });
        setSelectedGoal(null);
    };

    // Edit goal
    const handleEdit = (goal) => {
        setSelectedGoal(goal);
        setFormData({
            name: goal.name,
            description: goal.description || '',
            targetAmount: goal.targetAmount || 0,
            currentAmount: goal.currentAmount || 0,
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
            icon: goal.icon || 'Target',
            color: goal.color || '#3B82F6',
            status: goal.status || 'active',
            priority: goal.priority || 'medium',
            category: goal.category || 'personal'
        });
        setShowEditModal(true);
    };

    // Open fund modal
    const handleFund = (goal) => {
        setSelectedGoal(goal);
        setShowFundModal(true);
    };

    // Open auto-save modal
    const handleAutoSave = (goal) => {
        setSelectedGoal(goal);
        setShowAutoSaveModal(true);
    };

    // Open task generator modal
    const handleTaskGenerator = (goal) => {
        setSelectedGoal(goal);
        setTaskFormData({
            title: `${goal.name} uchun harakat`,
            description: `"${goal.name}" maqsadi uchun qo'shimcha vazifa`,
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
            priority: 'medium'
        });
        setShowTaskModal(true);
    };

    // Handle statistics
    const handleStatistics = (goal) => {
        setSelectedGoal(goal);
        setShowStatisticsModal(true);
    };

    // Get goal icon component
    const getGoalIcon = (iconName) => {
        return goalIconMap[iconName] || Target;
    };

    // Calculate total goals stats
    const goalsStats = {
        total: goals.length,
        active: goals.filter(g => g.status === 'active').length,
        completed: goals.filter(g => g.status === 'completed').length,
        totalTarget: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
        totalSaved: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
        totalProgress: goals.length > 0
            ? goals.reduce((sum, goal) => sum + calculateProgress(goal), 0) / goals.length
            : 0
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Maqsadlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 sm:space-y-6 pb-24 sm:pb-8">
            {/* Header Section - Mobile optimized */}
            <div className="bg-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                                <Target className="w-5 h-5 sm:w-8 sm:h-8" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-3xl font-bold">Maqsadlar</h1>
                                <p className="text-white/80 text-xs sm:text-sm hidden sm:block">O'z maqsadlaringizga erishing</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-all text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Yangi Maqsad
                    </button>
                </div>

                {/* Stats Grid - 2x2 on mobile */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm">Jami</p>
                        <p className="text-xl sm:text-2xl font-bold">{goalsStats.total}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm">Progress</p>
                        <p className="text-xl sm:text-2xl font-bold">{goalsStats.totalProgress.toFixed(0)}%</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm">Maqsad</p>
                        <p className="text-lg sm:text-2xl font-bold">{formatCurrencyShort(goalsStats.totalTarget)}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm">Yig'ilgan</p>
                        <p className="text-lg sm:text-2xl font-bold">{formatCurrencyShort(goalsStats.totalSaved)}</p>
                    </div>
                </div>
            </div>

            {/* AI Suggestions */}
            {/* {aiSuggestions.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Brain className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Coach Maslahatlari</h3>
                        </div>
                        <button
                            onClick={refreshAiSuggestions}
                            className="p-2 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded-lg transition-colors"
                            title="Yangilash"
                        >
                            <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {aiSuggestions.map(suggestion => (
                            <div
                                key={suggestion.id}
                                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-800/50 hover:shadow-md transition-shadow"
                            >
                                <div className={`p-2 rounded-lg ${suggestion.priority === 'high'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : suggestion.priority === 'medium'
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    }`}>
                                    {suggestion.type === 'milestone' ? <Award className="w-4 h-4" /> :
                                        suggestion.type === 'funding' ? <PiggyBank className="w-4 h-4" /> :
                                            <Bell className="w-4 h-4" />}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {suggestion.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {suggestion.description}
                                    </p>

                                    {suggestion.goalId && (
                                        <button
                                            onClick={() => handleSuggestionAction(suggestion)}
                                            className="mt-2 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1"
                                        >
                                            Ko'rish
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => dismissSuggestion(suggestion.id)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Yopish"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {aiSuggestions.length === 0 && (
                        <div className="text-center py-8">
                            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 dark:text-gray-400">
                                AI Coach hozircha maslahat bermadi. Yangi maqsad yarating!
                            </p>
                        </div>
                    )}
                </div>
            )} */}

            {/* Goals Grid - Mobile optimized */}
            {filteredGoals.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center shadow-md">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Maqsad yo'q
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                        Birinchi maqsadingizni yarating
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Maqsad yaratish
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {filteredGoals.map(goal => {
                        const progress = calculateProgress(goal);
                        const daysRemaining = calculateDaysRemaining(goal.deadline);
                        const Icon = getGoalIcon(goal.icon);

                        return (
                            <div
                                key={goal._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Goal Header */}
                                <div
                                    className="h-3"
                                    style={{ backgroundColor: goal.color }}
                                ></div>

                                <div className="p-6">
                                    {/* Goal Info */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-3 rounded-xl"
                                                style={{
                                                    backgroundColor: goal.color + '20',
                                                    color: goal.color
                                                }}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {goal.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                                                        {goal.status === 'active' ? 'Faol' :
                                                            goal.status === 'paused' ? 'To\'xtatilgan' :
                                                                goal.status === 'completed' ? 'Bajarilgan' : 'Bekor qilingan'}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                                                        {goal.priority === 'high' ? 'Yuqori' :
                                                            goal.priority === 'medium' ? "O'rta" : 'Past'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                       <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedGoal(selectedGoal?._id === goal._id ? null : goal);
                                                }}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </button>

                                            {selectedGoal?._id === goal._id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(goal);
                                                            setSelectedGoal(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Tahrirlash
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatistics(goal);
                                                            setSelectedGoal(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                        Statistika
                                                    </button>
                                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGoal(goal._id);
                                                            setSelectedGoal(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        O'chirish
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar - Mobile optimized */}
                                    <div className="mb-4 sm:mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {progress}%
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrencyShort(goal.currentAmount)} / {formatCurrencyShort(goal.targetAmount)}
                                            </span>
                                        </div>
                                        <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${progress}%`,
                                                    backgroundColor: goal.color
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Deadline and Stats - Compact on mobile */}
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                                        <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 sm:mb-2 text-gray-500" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Muddat</p>
                                            <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                                {goal.deadline ? formatDate(goal.deadline) : '-'}
                                            </p>
                                        </div>

                                        <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 sm:mb-2 text-gray-500" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Qoldi</p>
                                            <p className={`font-bold text-xs sm:text-sm ${daysRemaining > 30 ? 'text-green-600' :
                                                daysRemaining > 7 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                {daysRemaining !== null ? `${daysRemaining}` : '∞'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleFund(goal)}
                                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Ajratish
                                        </button>

                                        {goal.status === 'active' && (
                                            <button
                                                onClick={() => handleStatusChange(goal._id, 'paused')}
                                                className="px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-medium transition-colors"
                                            >
                                                <Pause className="w-4 h-4" />
                                            </button>
                                        )}

                                        {goal.status === 'paused' && (
                                            <button
                                                onClick={() => handleStatusChange(goal._id, 'active')}
                                                className="px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Goal Modal */}
            {(showAddModal || showEditModal) && (
                <GoalModal
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleGoalSubmit}
                    onClose={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                    }}
                    isEditing={!!selectedGoal}
                />
            )}

            {/* Fund Modal */}
            {showFundModal && selectedGoal && (
                <FundModal
                    selectedGoal={selectedGoal}
                    fundFormData={fundFormData}
                    setFundFormData={setFundFormData}
                    handleSubmit={handleFundSubmit}
                    formatCurrency={formatCurrency}
                    onClose={() => {
                        setShowFundModal(false);
                        setFundFormData({ amount: 0, source: 'manual', description: '' });
                    }}
                />
            )}

            {/* Auto-Save Modal */}
            {showAutoSaveModal && selectedGoal && (
                <AutoSaveModal
                    selectedGoal={selectedGoal}
                    autoSaveSettings={autoSaveSettings}
                    setAutoSaveSettings={setAutoSaveSettings}
                    handleSubmit={handleAutoSaveSubmit}
                    formatCurrency={formatCurrency}
                    onClose={() => {
                        setShowAutoSaveModal(false);
                        setAutoSaveSettings({
                            type: 'monthly',
                            amount: '',
                            percentage: 10,
                            startDate: new Date().toISOString().split('T')[0]
                        });
                    }}
                />
            )}

            {/* Task Generator Modal */}
            {showTaskModal && selectedGoal && (
                <TaskModal
                    selectedGoal={selectedGoal}
                    taskFormData={taskFormData}
                    setTaskFormData={setTaskFormData}
                    handleSubmit={handleTaskGenerate}
                    formatDate={formatDate}
                    onClose={() => {
                        setShowTaskModal(false);
                        setTaskFormData({
                            title: '',
                            description: '',
                            deadline: '',
                            priority: 'medium'
                        });
                    }}
                />
            )}

            {/* Statistics Modal */}
            {showStatisticsModal && selectedGoal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                            onClick={() => setShowStatisticsModal(false)}
                        ></div>

                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl">
                            <div className="h-2 bg-blue-500 rounded-t-2xl"></div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Progress Tahlili
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {selectedGoal.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowStatisticsModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>

                                <GoalProgressChart goal={selectedGoal} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close menu */}
            {selectedGoal && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSelectedGoal(null)}
                ></div>
            )}
        </div>
    );
};


// Goal Modal Component - Mobile optimized
const GoalModal = ({ formData, setFormData, handleSubmit, onClose, isEditing }) => {
    const iconOptions = [
        { name: 'Target', label: 'Maqsad' },
        { name: 'Home', label: 'Uy' },
        { name: 'Car', label: 'Mashina' },
        { name: 'ShoppingBag', label: 'Xarid' },
        { name: 'BookOpen', label: 'Ta\'lim' },
        { name: 'Briefcase', label: 'Biznes' },
        { name: 'Gift', label: 'Sovg\'a' },
        { name: 'HeartPulse', label: 'Sog\'liq' },
    ];

    const colorOptions = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Green', value: '#10B981' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Orange', value: '#F59E0B' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Pink', value: '#EC4899' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Maqsadni Tahrirlash' : 'Yangi Maqsad'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-3 space-y-3">
                    {/* Maqsad nomi */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Maqsad nomi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Masalan: MacBook olish"
                            className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            required
                        />
                    </div>

                    {/* Summalar */}
                    <div className="grid grid-cols-2 gap-2">
                        <CurrencyInput
                            label="Maqsad summasi"
                            value={formData.targetAmount}
                            onChange={(value) => setFormData({ ...formData, targetAmount: value })}
                            currency="UZS"
                            placeholder="0"
                            required
                        />
                        <CurrencyInput
                            label="Boshlang'ich"
                            value={formData.currentAmount}
                            onChange={(value) => setFormData({ ...formData, currentAmount: value })}
                            currency="UZS"
                            placeholder="0"
                        />
                    </div>

                    {/* Muddat */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Muddati <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            required
                        />
                    </div>

                    {/* Ikon va Rang - bir qatorda */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ikon
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                                {iconOptions.map(icon => {
                                    const IconComponent = goalIconMap[icon.name] || Target;
                                    return (
                                        <button
                                            key={icon.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: icon.name })}
                                            className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${formData.icon === icon.name
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <IconComponent className="w-4 h-4" style={{ color: formData.color }} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Rang
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                                {colorOptions.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        className={`w-6 h-6 rounded-full transition-all ${formData.color === color.value
                                            ? 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                                            : ''
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Muhimlik */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Muhimlik
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { value: 'low', label: 'Past', color: 'bg-gray-100 text-gray-700' },
                                { value: 'medium', label: "O'rta", color: 'bg-yellow-100 text-yellow-700' },
                                { value: 'high', label: 'Yuqori', color: 'bg-red-100 text-red-700' },
                            ].map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.value })}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${formData.priority === p.value
                                        ? `${p.color} ring-1 ring-offset-1 ring-gray-300`
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                        >
                            Bekor
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                        >
                            {isEditing ? 'Saqlash' : 'Yaratish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Fund Modal Component - Mobile optimized
const FundModal = ({ selectedGoal, fundFormData, setFundFormData, handleSubmit, formatCurrency, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-modal-up sm:animate-none">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Mablag' Ajratish
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    {/* Goal info */}
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Maqsad</p>
                        <p className="font-bold text-gray-900 dark:text-white">{selectedGoal.name}</p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Qolgan: {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CurrencyInput
                            label="Summa"
                            value={fundFormData.amount}
                            onChange={(value) => setFundFormData({ ...fundFormData, amount: value })}
                            currency="UZS"
                            placeholder="0"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Manba
                            </label>
                            <select
                                value={fundFormData.source}
                                onChange={(e) => setFundFormData({ ...fundFormData, source: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                            >
                                <option value="manual">Qo'lda</option>
                                <option value="finance">Moliya hisobidan</option>
                                <option value="savings">Tejam jamg'armasi</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2 pb-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                            >
                                Bekor
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium"
                            >
                                Ajratish
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Auto-Save Modal Component
const AutoSaveModal = ({ selectedGoal, autoSaveSettings, setAutoSaveSettings, handleSubmit, formatCurrency, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="h-2 bg-blue-500 rounded-t-2xl"></div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PiggyBank className="w-5 h-5 text-blue-500" />
                                Avtomatik Tejash
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-medium text-blue-700 dark:text-blue-300">AI Maslahati</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Agar oyiga {formatCurrency(500000)} ajratsangiz, {selectedGoal.name} maqsadiga 5 oyda erishasiz.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    To'lov turi
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAutoSaveSettings({ ...autoSaveSettings, type: 'monthly' })}
                                        className={`py-3 px-4 rounded-xl font-semibold transition-all ${autoSaveSettings.type === 'monthly'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        Oylik
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAutoSaveSettings({ ...autoSaveSettings, type: 'percentage' })}
                                        className={`py-3 px-4 rounded-xl font-semibold transition-all ${autoSaveSettings.type === 'percentage'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        Foiz
                                    </button>
                                </div>
                            </div>

                            {autoSaveSettings.type === 'monthly' ? (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Oylik summa <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                                        <input
                                            type="number"
                                            value={autoSaveSettings.amount}
                                            onChange={(e) => setAutoSaveSettings({ ...autoSaveSettings, amount: e.target.value })}
                                            placeholder="500,000"
                                            className="w-full pl-10 pr-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Har kirimdan foiz <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                                        <input
                                            type="number"
                                            value={autoSaveSettings.percentage}
                                            onChange={(e) => setAutoSaveSettings({ ...autoSaveSettings, percentage: e.target.value })}
                                            placeholder="10"
                                            className="w-full pl-10 pr-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            min="0"
                                            max="100"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Boshlanish sanasi
                                </label>
                                <input
                                    type="date"
                                    value={autoSaveSettings.startDate}
                                    onChange={(e) => setAutoSaveSettings({ ...autoSaveSettings, startDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                                >
                                    Yoqish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Task Modal Component
const TaskModal = ({ selectedGoal, taskFormData, setTaskFormData, handleSubmit, formatDate, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="h-2 bg-yellow-500 rounded-t-2xl"></div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-orange-500" />
                                Vazifa Yaratish
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                💡 Bu vazifa bajarilganda, "{selectedGoal.name}" maqsadi progressiga 5% qo'shiladi!
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Vazifa nomi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={taskFormData.title}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                    placeholder="Masalan: Har oy 500,000 so'm yig'ish"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Tavsif (ixtiyoriy)
                                </label>
                                <textarea
                                    value={taskFormData.description}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                                    placeholder="Vazifa haqida qo'shimcha ma'lumot..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Muddati
                                    </label>
                                    <input
                                        type="date"
                                        value={taskFormData.deadline}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Muhimlik
                                    </label>
                                    <select
                                        value={taskFormData.priority}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="low">Past</option>
                                        <option value="medium">O'rta</option>
                                        <option value="high">Yuqori</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                    Vazifa turlari:
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Mablag' yig'ish</p>
                                            <p className="text-sm text-gray-500">Har oy ma'lum summa ajratish</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                                            <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Xarajatlarni kamaytirish</p>
                                            <p className="text-sm text-gray-500">Keraksiz harajatlarni optimallashtirish</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                                            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Qo'shimcha daromad</p>
                                            <p className="text-sm text-gray-500">Yangi daromad manbalarini topish</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                                >
                                    Yaratish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Demo data for testing
const demoGoals = [
    {
        _id: '1',
        name: 'MacBook Pro olish',
        description: 'Yangi MacBook Pro 16" M3 Max sotib olish',
        targetAmount: 25000000,
        currentAmount: 7500000,
        deadline: '2025-12-31',
        icon: 'ShoppingBag',
        color: '#3B82F6',
        status: 'active',
        priority: 'high',
        category: 'technology',
        createdAt: '2024-01-15'
    },
    {
        _id: '2',
        name: 'Dubai sayohati',
        description: 'Oilaviy sayohat uchun mablag\' yig\'ish',
        targetAmount: 15000000,
        currentAmount: 5000000,
        deadline: '2025-08-30',
        icon: 'Home',
        color: '#10B981',
        status: 'active',
        priority: 'medium',
        category: 'travel',
        createdAt: '2024-02-20'
    },
    {
        _id: '3',
        name: 'Avtomobil uchun boshlang\'ich to\'lov',
        description: 'Yangi mashina uchun 30% boshlang\'ich to\'lov',
        targetAmount: 30000000,
        currentAmount: 10000000,
        deadline: '2025-11-15',
        icon: 'Car',
        color: '#EF4444',
        status: 'active',
        priority: 'high',
        category: 'vehicle',
        createdAt: '2024-03-10'
    },
    {
        _id: '4',
        name: 'Oliy ta\'lim uchun stipendiya',
        description: 'Chetdagi universitet uchun bir yillik stipendiya',
        targetAmount: 50000000,
        currentAmount: 20000000,
        deadline: '2025-06-01',
        icon: 'BookOpen',
        color: '#8B5CF6',
        status: 'paused',
        priority: 'medium',
        category: 'education',
        createdAt: '2024-01-05'
    }
];

const demoAiSuggestions = [
    {
        id: 1,
        type: 'milestone',
        title: 'MacBook maqsadingiz 30% ga yetdi! 🔥',
        description: '7.5 million so\'m yig\'dingiz. Davom eting, qolgan 17.5 million so\'m bor.',
        goalId: '1',
        priority: 'high'
    },
    {
        id: 2,
        type: 'funding',
        title: 'Avtomatik tejashni yoqing',
        description: 'Har oy 500,000 so\'m ajratsangiz, Dubai sayohatiga 20 oyda erishasiz.',
        goalId: '2',
        priority: 'medium'
    },
    {
        id: 3,
        type: 'reminder',
        title: '3 kun harakat yo\'q',
        description: 'Avtomobil maqsadi uchun oxirgi mablag\' ajratishingiz 3 kun oldin. Bugun kichik summa ajrating.',
        goalId: '3',
        priority: 'high'
    }
];

export default Goals;