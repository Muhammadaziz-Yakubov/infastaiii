import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Target,
    Wallet,
    Calendar,
    Zap,
    TrendingUp,
    Plus,
    Bell,
    Heart,
    Smartphone,
    AlertTriangle,
    Loader2,
    Copy,
    Check,
    Settings as SettingsIcon,
    ChevronRight,
    Search,
    UserCircle,
    PlusCircle,
    X,
    Trophy,
    MessageCircle,
    Star,
    Gift,
    Camera,
    MapPin,
    Clock,
    Award,
    Activity,
    PieChart,
    FileText,
    Video,
    Music,
    BookOpen,
    Gamepad2,
    Coffee,
    Sun,
    Moon,
    Cloud,
    Zap as ZapIcon,
    Target as TargetIcon,
    Heart as HeartIcon,
    BarChart3
} from 'lucide-react';
import { familyService } from '../services/familyService';
import toast from 'react-hot-toast';

const FamilyManager = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Forms
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [userRole, setUserRole] = useState('dad'); // Default
    const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', deadline: '', color: 'blue' });
    const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });

    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const roles = [
        { id: 'dad', name: 'Dada' },
        { id: 'mom', name: 'Oyi' },
        { id: 'son', name: 'O\'g\'il' },
        { id: 'daughter', name: 'Qiz' },
        { id: 'grandfather', name: 'Bobo' },
        { id: 'grandmother', name: 'Buvijon' },
    ];

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const result = await familyService.getDashboard();
            setData(result);
            if (result?.family?.members?.length > 0) {
                setTaskForm(prev => ({ ...prev, assignedTo: result.family.members[0].user?._id }));
            }
        } catch (error) {
            console.error('Error fetching family dashboard:', error);
            toast.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleCreateFamily = async (e) => {
        e.preventDefault();
        try {
            await familyService.createFamily(familyName, userRole);
            toast.success('Oila muvaffaqiyatli yaratildi!');
            setShowCreateModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    const handleJoinFamily = async (e) => {
        e.preventDefault();
        try {
            await familyService.joinFamily(inviteCode, userRole);
            toast.success('Oilaga qo\'shildingiz!');
            setShowJoinModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Taklif kodi noto\'g\'ri');
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            await familyService.addGoal(goalForm);
            toast.success('Yangi maqsad qo\'shildi!');
            setShowGoalModal(false);
            setGoalForm({ title: '', targetAmount: '', deadline: '', color: 'blue' });
            fetchDashboard();
        } catch (error) {
            toast.error('Maqsad qo\'shishda xatolik');
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await familyService.assignTask(taskForm);
            toast.success('Vazifa tayinlandi!');
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', assignedTo: data?.family?.members[0]?.user?._id, priority: 'medium', deadline: '' });
            fetchDashboard();
        } catch (error) {
            toast.error('Vazifa qo\'shishda xatolik');
        }
    };

    const handleUpdateGoalProgress = async (goalId) => {
        try {
            const amountStr = prompt("Qancha qo'shmoqchisiz? (UZS)", "100000");
            if (amountStr === null) return;
            const addedAmount = parseFloat(amountStr);
            if (isNaN(addedAmount)) {
                toast.error('Iltimos, son kiriting');
                return;
            }
            await familyService.updateGoalProgress(goalId, addedAmount);
            toast.success('Maqsad balansi yangilandi!');
            fetchDashboard();
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        }
    };

    const copyInviteCode = () => {
        if (data?.family?.inviteCode) {
            navigator.clipboard.writeText(data.family.inviteCode);
            setCopied(true);
            toast.success('Taklif kodi nusxalandi!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Correct Avatar URL Helper
    const getAvatarUrl = (user) => {
        if (!user?.avatar) return null;
        if (user.avatar.startsWith('http')) return user.avatar;
        // Construct backend URL (adjust if your backend is on different port)
        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        return `${baseUrl}${user.avatar}`;
    };

    // NEW FUNCTIONS - 10 Additional Features
    
    // 1. Family Activity Tracker
    const handleAddActivity = async (activityData) => {
        try {
            await familyService.addActivity(activityData);
            toast.success('Faoliyat qo\'shildi!');
            setShowActivityModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error('Faoliyat qo\'shishda xatolik');
        }
    };

    // 2. Reward System
    const handleAddReward = async (rewardData) => {
        try {
            await familyService.addReward(rewardData);
            toast.success('Mukofot qo\'shildi!');
            setShowRewardModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error('Mukofot qo\'shishda xatolik');
        }
    };

    // 3. Family Chat
    const handleSendMessage = async (messageData) => {
        try {
            await familyService.sendMessage(messageData);
            toast.success('Xabar yuborildi!');
            fetchDashboard();
        } catch (error) {
            toast.error('Xabar yuborishda xatolik');
        }
    };

    // 4. Photo Gallery
    const handleUploadPhoto = async (photoData) => {
        try {
            await familyService.uploadPhoto(photoData);
            toast.success('Rasm yuklandi!');
            setShowPhotoModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error('Rasm yuklashda xatolik');
        }
    };

    // 5. Event Calendar
    const handleCreateEvent = async (eventData) => {
        try {
            await familyService.createEvent(eventData);
            toast.success('Tadbir yaratildi!');
            setShowEventModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error('Tadbir yaratishda xatolik');
        }
    };

    // 6. Budget Manager
    const handleUpdateBudget = async (budgetData) => {
        try {
            await familyService.updateBudget(budgetData);
            toast.success('Byudjet yangilandi!');
            setShowBudgetModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error('Byudjet yangilashda xatolik');
        }
    };

    // 7. Schedule Manager
    const handleCreateSchedule = async (scheduleData) => {
        try {
            await familyService.createSchedule(scheduleData);
            toast.success('Jadval yaratildi!');
            setShowScheduleModal(false);
            fetchDashboard();
        } catch (error) {
            toast.error('Jadval yaratishda xatolik');
        }
    };

    // 8. Location Sharing
    const handleShareLocation = async () => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };
                    await familyService.shareLocation(locationData);
                    toast.success('Lokatsiya ulashildi!');
                    fetchDashboard();
                });
            } else {
                toast.error('Lokatsiya ulashib bo\'lmaydi');
            }
        } catch (error) {
            toast.error('Lokatsiya ulashishda xatolik');
        }
    };

    // 9. Family Statistics
    const handleGenerateStats = async () => {
        try {
            const stats = await familyService.getFamilyStats();
            toast.success('Statistika yuklandi!');
            return stats;
        } catch (error) {
            toast.error('Statistika olishda xatolik');
        }
    };

    // 10. Emergency Alert
    const handleSendEmergencyAlert = async (alertData) => {
        try {
            await familyService.sendEmergencyAlert(alertData);
            toast.success('Favqulodda signal yuborildi!');
            fetchDashboard();
        } catch (error) {
            toast.error('Signal yuborishda xatolik');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    // Modal Components
    const RoleSelector = ({ value, onChange }) => (
        <div className="grid grid-cols-2 gap-2 mb-6">
            {roles.map((r) => (
                <button
                    key={r.id}
                    type="button"
                    onClick={() => onChange(r.id)}
                    className={`py-3 px-2 rounded-xl border-2 transition-all font-bold text-sm ${value === r.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-gray-100 dark:border-gray-700 text-gray-500'
                        }`}
                >
                    {r.name}
                </button>
            ))}
        </div>
    );

    if (!data?.family) {
        return (
            <div className="min-h-screen bg-transparent md:bg-gray-50 dark:md:bg-[#0f172a] p-4 flex items-center justify-center overflow-y-auto pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Users className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Family Manager</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                        Oilangizni tartibga solish, vazifalarni taqsimlash va byudjetni birgalikda boshqarish.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Oila yaratish
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-white py-4 rounded-2xl font-black hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                        >
                            Kodni kiritish
                        </button>
                    </div>
                </motion.div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <h3 className="text-2xl font-black mb-6 dark:text-white">Oila yaratish</h3>
                                <form onSubmit={handleCreateFamily}>
                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Oila nomi</label>
                                    <input
                                        type="text"
                                        value={familyName}
                                        onChange={(e) => setFamilyName(e.target.value)}
                                        placeholder="Masalan: Yakubovlar"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-4 rounded-2xl mb-6 outline-none focus:border-blue-500 dark:text-white font-bold"
                                        required
                                    />

                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Sizning rolingiz</label>
                                    <RoleSelector value={userRole} onChange={setUserRole} />

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-gray-500 font-black">Yopish</button>
                                        <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20">Yaratish</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Join Modal */}
                <AnimatePresence>
                    {showJoinModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <h3 className="text-2xl font-black mb-6 dark:text-white">Oilaga qo'shilish</h3>
                                <form onSubmit={handleJoinFamily}>
                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Taklif kodi</label>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="XXXX-XXXX"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl mb-6 outline-none focus:border-blue-500 dark:text-white text-center font-mono text-2xl tracking-widest uppercase"
                                        required
                                    />

                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Sizning rolingiz</label>
                                    <RoleSelector value={userRole} onChange={setUserRole} />

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-4 text-gray-500 font-black">Yopish</button>
                                        <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20">Qo'shilish</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 md:p-8 pt-20 md:pt-8">
            {/* Main Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                        <Users className="text-white w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            {data.family.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">Taklif kodi:</span>
                            <button
                                onClick={copyInviteCode}
                                className="bg-white dark:bg-gray-800 border-2 border-blue-500/20 text-blue-600 px-4 py-1.5 rounded-xl font-mono font-black flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group active:scale-95"
                            >
                                {data.family.inviteCode}
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 group-hover:scale-110" />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-blue-500 transition-colors group">
                        <Bell className="w-6 h-6 group-hover:animate-bounce" />
                    </button>
                    <button
                        onClick={() => setShowTaskModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                        Yangi vazifa
                    </button>
                </div>
            </div>

            {/* Quick Actions - 10 New Features */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[32px] p-6 mb-8 shadow-xl border border-gray-100 dark:border-gray-700"
            >
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <ZapIcon className="w-6 h-6 text-yellow-500" />
                    Tezkor amallar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* 1. Activity Tracker */}
                    <button
                        onClick={() => setShowActivityModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Faoliyat</span>
                    </button>

                    {/* 2. Reward System */}
                    <button
                        onClick={() => setShowRewardModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Gift className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mukofot</span>
                    </button>

                    {/* 3. Family Chat */}
                    <button
                        onClick={() => setShowChatModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Suhbat</span>
                    </button>

                    {/* 4. Photo Gallery */}
                    <button
                        onClick={() => setShowPhotoModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Camera className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rasm</span>
                    </button>

                    {/* 5. Event Calendar */}
                    <button
                        onClick={() => setShowEventModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tadbir</span>
                    </button>

                    {/* 6. Budget Manager */}
                    <button
                        onClick={() => setShowBudgetModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Byudjet</span>
                    </button>

                    {/* 7. Schedule Manager */}
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jadval</span>
                    </button>

                    {/* 8. Location Sharing */}
                    <button
                        onClick={handleShareLocation}
                        className="flex flex-col items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lokatsiya</span>
                    </button>

                    {/* 9. Family Statistics */}
                    <button
                        onClick={handleGenerateStats}
                        className="flex flex-col items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-2xl hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Statistika</span>
                    </button>

                    {/* 10. Emergency Alert */}
                    <button
                        onClick={() => setShowEventModal(true)}
                        className="flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform animate-pulse">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signal</span>
                    </button>
                </div>
            </motion.div>

            {/* AI Insight Hero */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-[40px] p-8 md:p-12 mb-12 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group border border-white/10"
            >
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                    <div className="w-24 h-24 bg-white/15 p-6 rounded-[30px] backdrop-blur-2xl border border-white/20 flex items-center justify-center shrink-0 animate-pulse">
                        <Zap className="w-12 h-12 text-yellow-300 fill-yellow-300 shadow-xl" />
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-3xl font-black mb-3 tracking-tight">Oila intellekti (AI)</h2>
                        <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl opacity-90 leading-relaxed">
                            {data.stats.completedTasks > 0
                                ? `Yaxshi natija! Oila a'zolari ushbu haftada ${data.stats.completedTasks}ta muhim vazifani 100% bajardilar. Samadorlik 25%ga oshdi!`
                                : "Bugun vazifalar qo'shilmadi. Keling, oilaviy rejani yangilaymiz va har bir a'zoga vazifa topshiramiz!"}
                        </p>
                    </div>
                    <button className="bg-white text-blue-700 px-10 py-5 rounded-[24px] font-black hover:bg-blue-50 transition-all shadow-2xl transform hover:scale-105 active:scale-95 shrink-0">
                        To'liq tahlil
                    </button>
                </div>
                {/* Visual Orbs */}
                <div className="absolute top-[-40%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute bottom-[-30%] left-[-10%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Section: Members, Budget, Tasks */}
                <div className="xl:col-span-8 space-y-12">

                    {/* Members Hub */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <Users className="w-7 h-7 text-blue-500" />
                                Oila a'zolari
                                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-xs px-3 py-1 rounded-full font-black">
                                    {data.family.members.length}
                                </span>
                            </h3>
                            <button className="text-blue-600 font-black hover:underline">Hammasi</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.family.members.map((member, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all relative group"
                                >
                                    <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-gray-300 dark:text-gray-600 tracking-widest">{member.role}</div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 p-1">
                                                <div className="w-full h-full rounded-[24px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg">
                                                    {getAvatarUrl(member.user) ? (
                                                        <img
                                                            src={getAvatarUrl(member.user)}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = ''; e.target.onerror = null; }}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <span className="text-3xl font-black text-blue-600">{member.user?.firstName?.[0] || '?'}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full shadow-lg"></div>
                                        </div>
                                        <h4 className="font-black text-lg dark:text-white mb-1">{member.user?.firstName || 'Noma\'lum'}</h4>
                                        <p className="text-sm text-gray-400 font-bold mb-4">{roles.find(r => r.id === member.role)?.name || member.role}</p>
                                        <div className="w-full grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Vazifalar</p>
                                                <p className="font-black text-gray-900 dark:text-white">12/15</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ballar</p>
                                                <p className="font-black text-indigo-600">850</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <button
                                onClick={copyInviteCode}
                                className="border-4 border-dashed border-gray-100 dark:border-gray-700 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-blue-500/50 hover:text-blue-500 transition-all group active:scale-95"
                            >
                                <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                    <PlusCircle className="w-10 h-10 transition-transform group-hover:rotate-90" />
                                </div>
                                <span className="font-black text-sm uppercase tracking-widest">Taklif qilish</span>
                            </button>
                        </div>
                    </section>

                    {/* Financial Center */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[44px] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-4 rounded-[22px] shadow-inner shadow-emerald-500/10">
                                    <Wallet className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Oila xazinasi</h3>
                                    <p className="text-gray-500 font-bold text-sm">Umumiy byudjet tahlili</p>
                                </div>
                            </div>
                            <button className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-2xl hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
                            <div className="md:col-span-7">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-black mb-2 uppercase tracking-widest">Jami hisob</p>
                                <div className="flex items-baseline gap-3 flex-wrap">
                                    <h4 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        {data.stats.balance.toLocaleString()}
                                    </h4>
                                    <span className="text-2xl font-black text-blue-500">UZS</span>
                                </div>
                            </div>
                            <div className="md:col-span-5 flex flex-col justify-center gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[24px] border border-emerald-100/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Daromad</p>
                                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">+{data.stats.income.toLocaleString()}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-emerald-500/50" />
                                </div>
                                <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-[24px] border border-rose-100/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Xarajat</p>
                                        <p className="text-2xl font-black text-rose-700 dark:text-rose-400">-{data.stats.expense.toLocaleString()}</p>
                                    </div>
                                    <Heart className="w-8 h-8 text-rose-500/50" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Oxirgi tranzaksiyalar</p>
                                <button className="text-sm font-black text-blue-600">Barchasi</button>
                            </div>
                            <div className="space-y-4">
                                {data.recentTransactions?.length > 0 ? (
                                    data.recentTransactions.map((exp, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-3xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${exp.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-rose-100 dark:bg-rose-900'}`}>
                                                    <Heart className={`w-6 h-6 ${exp.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`} />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-lg dark:text-white truncate max-w-[200px]">{exp.description || exp.category}</h5>
                                                    <p className="text-sm text-gray-400 font-bold">{new Date(exp.date).toLocaleDateString()} • {exp.category}</p>
                                                </div>
                                            </div>
                                            <p className={`text-xl font-black ${exp.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                                {exp.type === 'income' ? '+' : '-'}{exp.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-[30px]">
                                        <Loader2 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                        <p className="text-gray-400 font-bold">Har qanday moliya harakatlari yo'q</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Goals & Quick Actions */}
                <div className="xl:col-span-4 space-y-12">

                    {/* Goals Progress */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[44px] border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <Trophy className="w-7 h-7 text-amber-500" />
                                Oila maqsadlari
                            </h3>
                            <button
                                onClick={() => setShowGoalModal(true)}
                                className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {data.family.goals?.length > 0 ? (
                                data.family.goals.map((goal, i) => {
                                    const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                                    return (
                                        <div key={i} className={`p-6 rounded-[30px] border relative group transition-all ${goal.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100' :
                                            goal.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100' :
                                                'bg-purple-50 dark:bg-purple-900/10 border-purple-100'
                                            }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h5 className="font-black text-lg dark:text-white mb-1">{goal.title}</h5>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{goal.targetAmount.toLocaleString()} UZS</p>
                                                </div>
                                                <span className={`text-lg font-black ${goal.color === 'amber' ? 'text-amber-600' :
                                                    goal.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                                                    }`}>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-white dark:bg-gray-900 h-3 rounded-full overflow-hidden mb-2 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className={`h-full rounded-full ${goal.color === 'amber' ? 'bg-amber-500' :
                                                        goal.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                                                        }`}
                                                ></motion.div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                                <span>To'plandi: {goal.currentAmount.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleUpdateGoalProgress(goal._id)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Jamg'arish
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[30px]">
                                    <Target className="w-12 h-12 text-gray-100 dark:text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-400 font-bold px-4">Hali maqsadlar qo'yilmadi. Biror narsani orzu qilyapsizmi?</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 bg-blue-600 rounded-[30px] p-6 text-white shadow-xl shadow-blue-500/20">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Eng yaxshi natija</p>
                            <h4 className="text-xl font-black mb-1">Yakubova Madina</h4>
                            <p className="text-blue-100 text-sm font-bold">Bu oyda 45ta vazifa!</p>
                        </div>
                    </section>

                    {/* Pro Actions Grid */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[44px] border border-gray-100 dark:border-gray-700 shadow-xl">
                        <h3 className="font-black text-xl mb-6 dark:text-white uppercase tracking-widest">Tezkor boshqaruv</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center gap-4 p-8 rounded-[32px] bg-sky-50 dark:bg-sky-900/20 border border-sky-100/50 hover:bg-sky-500 hover:text-white transition-all group group relative active:scale-95">
                                <Calendar className="w-10 h-10 text-sky-500 transition-colors group-hover:text-white" />
                                <span className="text-xs font-black uppercase tracking-widest transition-colors group-hover:text-white">Taqvim</span>
                            </button>
                            <button className="flex flex-col items-center gap-4 p-8 rounded-[32px] bg-rose-50 dark:bg-rose-900/20 border border-rose-100/50 hover:bg-rose-500 hover:text-white transition-all group relative active:scale-95">
                                <AlertTriangle className="w-10 h-10 text-rose-500 transition-colors group-hover:text-white" />
                                <span className="text-xs font-black uppercase tracking-widest transition-colors group-hover:text-white">SOS!</span>
                                <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                            </button>
                            <button className="flex flex-col items-center gap-4 p-8 rounded-[32px] bg-purple-50 dark:bg-purple-900/20 border border-purple-100/50 hover:bg-purple-500 hover:text-white transition-all group active:scale-95">
                                <Smartphone className="w-10 h-10 text-purple-500 transition-colors group-hover:text-white" />
                                <span className="text-xs font-black uppercase tracking-widest transition-colors group-hover:text-white">GPS</span>
                            </button>
                            <button className="flex flex-col items-center gap-4 p-8 rounded-[32px] bg-amber-50 dark:bg-amber-900/20 border border-amber-100/50 hover:bg-amber-500 hover:text-white transition-all group active:scale-95">
                                <Target className="w-10 h-10 text-amber-500 transition-colors group-hover:text-white" />
                                <span className="text-xs font-black uppercase tracking-widest transition-colors group-hover:text-white">Darslar</span>
                            </button>
                        </div>
                    </section>

                </div>
            </div>

            {/* MODALS */}
            {/* Add Goal Modal */}
            <AnimatePresence>
                {showGoalModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-gray-800 rounded-[40px] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <button onClick={() => setShowGoalModal(false)} className="absolute top-6 right-6 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-6 h-6 dark:text-white" /></button>
                            <h3 className="text-3xl font-black mb-8 dark:text-white tracking-tight">Orzular ro'yxati</h3>
                            <form onSubmit={handleAddGoal} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Maqsad nomi</label>
                                    <input type="text" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Masalan: Dubayga sayohat" className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold" required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Kerakli summa</label>
                                        <input type="number" value={goalForm.targetAmount} onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })} placeholder="UZS" className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold text-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Muddat</label>
                                        <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold" required />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95">Saqlash</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Task Modal */}
            <AnimatePresence>
                {showTaskModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-gray-800 rounded-[40px] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden">
                            <button onClick={() => setShowTaskModal(false)} className="absolute top-6 right-6 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-6 h-6 dark:text-white" /></button>
                            <h3 className="text-3xl font-black mb-8 dark:text-white tracking-tight">Oila topshirig'i</h3>
                            <form onSubmit={handleAssignTask} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Nima qilish kerak?</label>
                                    <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Vazifa nomi" className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Kimga?</label>
                                    <select
                                        value={taskForm.assignedTo}
                                        onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold"
                                        required
                                    >
                                        {data.family.members.map(m => (
                                            <option key={m.user._id} value={m.user._id}>{m.user.firstName} {m.user.lastName} ({roles.find(r => r.id === m.role)?.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Muhimlik</label>
                                        <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold">
                                            <option value="high">Yuqori 🔥</option>
                                            <option value="medium">O'rta ⚡</option>
                                            <option value="low">Past 🍀</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Muddat</label>
                                        <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 p-5 rounded-2xl outline-none focus:border-blue-500 dark:text-white font-bold" required />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95">Vazifani topshirish</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FamilyManager;
