import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, CheckCircle, Circle, Plus, Trash2,
    TrendingUp, Target, Edit, X, Check, Clock, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { goalsService } from '../services/goalsService';

const GoalTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState(null);
    const [showAddStepModal, setShowAddStepModal] = useState(false);
    const [stepFormData, setStepFormData] = useState({
        title: '',
        description: ''
    });

    useEffect(() => {
        loadGoal();
    }, [id]);

    const loadGoal = async () => {
        setLoading(true);
        try {
            const data = await goalsService.getGoals();
            if (data.success) {
                const foundGoal = data.goals.find(g => g._id === id);
                if (foundGoal) {
                    setGoal(foundGoal);
                } else {
                    toast.error('Maqsad topilmadi');
                    navigate('/goals');
                }
            }
        } catch (error) {
            console.error('Load goal error:', error);
            toast.error('Maqsadni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleDailyCheck = async () => {
        try {
            const data = await goalsService.addDailyCheck(id, {
                date: new Date().toISOString(),
                completed: true
            });

            if (data.success) {
                toast.success('Bugungi kun belgilandi! ✅');
                loadGoal();
            }
        } catch (error) {
            console.error('Daily check error:', error);
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleAddStep = async (e) => {
        e.preventDefault();

        if (!stepFormData.title) {
            toast.error('Step nomini kiriting');
            return;
        }

        try {
            const data = await goalsService.addStep(id, stepFormData);

            if (data.success) {
                toast.success('Step qo\'shildi ✅');
                setShowAddStepModal(false);
                setStepFormData({ title: '', description: '' });
                loadGoal();
            }
        } catch (error) {
            console.error('Add step error:', error);
            toast.error('Step qo\'shishda xatolik');
        }
    };

    const handleToggleStep = async (stepId, currentStatus) => {
        try {
            const data = await goalsService.updateStep(id, stepId, {
                completed: !currentStatus
            });

            if (data.success) {
                toast.success(!currentStatus ? 'Step bajarildi! 🎉' : 'Step bekor qilindi');
                loadGoal();
            }
        } catch (error) {
            console.error('Toggle step error:', error);
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDeleteStep = async (stepId) => {
        if (!window.confirm('Bu stepni o\'chirmoqchimisiz?')) {
            return;
        }

        try {
            const data = await goalsService.deleteStep(id, stepId);

            if (data.success) {
                toast.success('Step o\'chirildi');
                loadGoal();
            }
        } catch (error) {
            console.error('Delete step error:', error);
            toast.error('O\'chirishda xatolik');
        }
    };

    const calculateProgress = () => {
        if (!goal?.tracking?.steps || goal.tracking.steps.length === 0) return 0;
        const completed = goal.tracking.steps.filter(s => s.completed).length;
        return Math.round((completed / goal.tracking.steps.length) * 100);
    };

    const calculateDaysProgress = () => {
        if (!goal?.tracking?.totalDays || goal.tracking.totalDays === 0) return 0;
        return Math.round((goal.tracking.completedDays / goal.tracking.totalDays) * 100);
    };

    const isTodayChecked = () => {
        if (!goal?.tracking?.dailyChecks) return false;
        const today = new Date().setHours(0, 0, 0, 0);
        return goal.tracking.dailyChecks.some(check => {
            const checkDate = new Date(check.date).setHours(0, 0, 0, 0);
            return checkDate === today && check.completed;
        });
    };

    const getDaysRemaining = () => {
        if (!goal?.deadline) return null;
        const now = new Date();
        const due = new Date(goal.deadline);
        const diff = due - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Maqsad topilmadi</p>
                </div>
            </div>
        );
    }

    const progress = calculateProgress();
    const daysRemaining = getDaysRemaining();
    const todayChecked = isTodayChecked();

    return (
        <div className="w-full space-y-4 sm:space-y-6 pb-24 sm:pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl">
                <button
                    onClick={() => navigate('/goals')}
                    className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Orqaga
                </button>

                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{goal.name}</h1>
                        {goal.description && (
                            <p className="text-white/80 text-sm sm:text-base">{goal.description}</p>
                        )}
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Target className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm mb-1">Progress</p>
                        <p className="text-2xl sm:text-3xl font-bold">{progress}%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm mb-1">Qolgan kunlar</p>
                        <p className="text-2xl sm:text-3xl font-bold">{daysRemaining}</p>
                    </div>
                </div>
            </div>

            {/* Daily Check Button */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bugungi kun</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date().toLocaleDateString('uz-UZ', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDailyCheck}
                    disabled={todayChecked}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                        todayChecked
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                    }`}
                >
                    {todayChecked ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Bugun bajarildi
                        </>
                    ) : (
                        <>
                            <Circle className="w-5 h-5" />
                            Bugunni belgilash
                        </>
                    )}
                </button>

                {goal.tracking?.completedDays > 0 && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Jami bajarilgan kunlar: <span className="font-bold text-blue-500">{goal.tracking.completedDays}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Umumiy Progress</h3>
                    <span className="text-2xl font-bold text-blue-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {goal.tracking?.steps?.filter(s => s.completed).length || 0} / {goal.tracking?.steps?.length || 0} step bajarildi
                </p>
            </div>

            {/* Steps Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Steplar</h3>
                    <button
                        onClick={() => setShowAddStepModal(true)}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Step qo'shish
                    </button>
                </div>

                {goal.tracking?.steps && goal.tracking.steps.length > 0 ? (
                    <div className="space-y-3">
                        {goal.tracking.steps
                            .sort((a, b) => a.order - b.order)
                            .map((step, index) => (
                                <div
                                    key={step._id}
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                                        step.completed
                                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                            : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
                                    }`}
                                >
                                    <button
                                        onClick={() => handleToggleStep(step._id, step.completed)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            step.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                                        }`}
                                    >
                                        {step.completed && <Check className="w-4 h-4 text-white" />}
                                    </button>

                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${
                                            step.completed
                                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                                : 'text-gray-900 dark:text-white'
                                        }`}>
                                            {index + 1}. {step.title}
                                        </h4>
                                        {step.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {step.description}
                                            </p>
                                        )}
                                        {step.completedAt && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                {new Date(step.completedAt).toLocaleDateString('uz-UZ')}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDeleteStep(step._id)}
                                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Award className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Hali steplar yo'q</p>
                        <button
                            onClick={() => setShowAddStepModal(true)}
                            className="text-blue-500 hover:text-blue-600 font-medium"
                        >
                            Birinchi stepni qo'shing
                        </button>
                    </div>
                )}
            </div>

            {/* Add Step Modal */}
            {showAddStepModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Yangi Step</h3>
                            <button
                                onClick={() => {
                                    setShowAddStepModal(false);
                                    setStepFormData({ title: '', description: '' });
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStep} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Step nomi *
                                </label>
                                <input
                                    type="text"
                                    value={stepFormData.title}
                                    onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Masalan: Darslik o'qish"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tavsif
                                </label>
                                <textarea
                                    value={stepFormData.description}
                                    onChange={(e) => setStepFormData({ ...stepFormData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                    placeholder="Qo'shimcha ma'lumot..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddStepModal(false);
                                        setStepFormData({ title: '', description: '' });
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Qo'shish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalTracking;
