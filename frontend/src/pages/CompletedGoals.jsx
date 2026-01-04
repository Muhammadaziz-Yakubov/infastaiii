import React, { useState, useEffect } from 'react';
import {
    Target, Award, Calendar, ArrowLeft, Trophy,
    CheckCircle, TrendingUp, Sparkles, Home, Car,
    ShoppingBag, BookOpen, Briefcase, Gift, HeartPulse,
    Wallet, PiggyBank, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { goalsService } from '../services/goalsService';
import { formatCurrency, formatCurrencyShort } from '../utils/currency';

// Icon mapping for goals
const goalIconMap = {
    Home, Car, ShoppingBag, BookOpen, Briefcase,
    Gift, HeartPulse, Target, Wallet, PiggyBank,
    Award, Users
};

const CompletedGoals = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [completedGoals, setCompletedGoals] = useState([]);

    useEffect(() => {
        loadCompletedGoals();
    }, []);

    const loadCompletedGoals = async () => {
        try {
            const data = await goalsService.getGoals();
            if (data.success) {
                // Faqat completed statusdagi maqsadlarni olish
                const completed = data.goals.filter(goal => goal.status === 'completed');
                setCompletedGoals(completed);
            }
        } catch (error) {
            console.error('Load completed goals error:', error);
            toast.error('Erishilgan maqsadlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getGoalIcon = (iconName) => {
        return goalIconMap[iconName] || Target;
    };

    const calculateProgress = (goal) => {
        if (goal.goalType === 'financial') {
            if (!goal.targetAmount || goal.targetAmount === 0) return 0;
            return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
        } else {
            if (!goal.tracking || !goal.tracking.steps || goal.tracking.steps.length === 0) return 0;
            const completedSteps = goal.tracking.steps.filter(s => s.completed).length;
            return Math.round((completedSteps / goal.tracking.steps.length) * 100);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Erishilgan maqsadlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-24 sm:pb-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 lg:p-10 text-white shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/goals')}
                            className="p-3 lg:p-4 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>

                        <div>
                            <h1 className="text-2xl lg:text-4xl font-bold">Erishilgan Maqsadlar</h1>
                            <p className="text-white/80 text-sm lg:text-base">Siz erishgan barcha maqsadlar</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
                        <p className="text-white/80 text-sm lg:text-base mb-2">Jami Erishilgan</p>
                        <p className="text-2xl lg:text-3xl font-bold">{completedGoals.length}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
                        <p className="text-white/80 text-sm lg:text-base mb-2">Moliyaviy</p>
                        <p className="text-2xl lg:text-3xl font-bold">
                            {completedGoals.filter(g => g.goalType === 'financial').length}
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
                        <p className="text-white/80 text-sm lg:text-base mb-2">Moliyasiz</p>
                        <p className="text-2xl lg:text-3xl font-bold">
                            {completedGoals.filter(g => g.goalType === 'non-financial').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Completed Goals Grid */}
            {completedGoals.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 lg:p-16 text-center shadow-md">
                    <Trophy className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-gray-400" />
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                        Hali erishilgan maqsad yo'q
                    </h3>
                    <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 lg:mb-8">
                        Maqsadlaringizga erishing va bu yerda ko'ring!
                    </p>
                    <button
                        onClick={() => navigate('/goals')}
                        className="bg-green-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl hover:bg-green-600 transition-colors inline-flex items-center gap-2 text-base lg:text-lg font-semibold"
                    >
                        <Target className="w-5 h-5 lg:w-6 lg:h-6" />
                        Maqsadlarga qaytish
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
                    {completedGoals.map(goal => {
                        const progress = calculateProgress(goal);
                        const Icon = getGoalIcon(goal.icon);

                        return (
                            <div
                                key={goal._id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-green-200 dark:border-green-800 overflow-hidden hover:shadow-xl transition-all relative"
                            >
                                {/* Success Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Goal Header */}
                                <div
                                    className="h-3"
                                    style={{ backgroundColor: goal.color }}
                                ></div>

                                <div className="p-5 lg:p-7">
                                    {/* Goal Info */}
                                    <div className="flex items-start gap-3 lg:gap-4 mb-5 lg:mb-6">
                                        <div
                                            className="p-3 lg:p-4 rounded-xl"
                                            style={{
                                                backgroundColor: goal.color + '20',
                                                color: goal.color
                                            }}
                                        >
                                            <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg lg:text-xl text-gray-900 dark:text-white">
                                                {goal.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    ✅ Bajarilgan
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {goal.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {goal.description}
                                        </p>
                                    )}

                                    {/* Progress Bar */}
                                    {goal.goalType === 'financial' ? (
                                        <div className="mb-5 lg:mb-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">
                                                    {progress}%
                                                </span>
                                                <span className="text-sm lg:text-base font-bold text-gray-900 dark:text-white">
                                                    {formatCurrencyShort(goal.currentAmount)} / {formatCurrencyShort(goal.targetAmount)}
                                                </span>
                                            </div>
                                            <div className="h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 bg-green-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-5 lg:mb-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">
                                                    Progress
                                                </span>
                                                <span className="text-sm lg:text-base font-bold text-gray-900 dark:text-white">
                                                    {goal.tracking?.steps?.filter(s => s.completed).length || 0} / {goal.tracking?.steps?.length || 0} step
                                                </span>
                                            </div>
                                            <div className="h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 bg-green-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Deadline Info */}
                                    <div className="grid grid-cols-2 gap-3 lg:gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <div className="text-center">
                                            <Calendar className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Muddat</p>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                {formatDate(goal.deadline)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <Sparkles className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Yaratilgan</p>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                {formatDate(goal.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Success Message */}
                                    <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl text-center">
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                            🎉 Tabriklaymiz! Maqsadga erishdingiz!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CompletedGoals;
