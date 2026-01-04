import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Plus, Users, Calendar, Target, Flame, Star,
  Clock, CheckCircle, X, Copy, Share2, Crown, Medal,
  TrendingUp, Award, Zap, ChevronRight, Search,
  Filter, MoreVertical, Eye, Trash2, LogOut,
  Sparkles, Timer, BookOpen, Droplets, Brain,
  Dumbbell, Wallet, Heart, Flag, Check, RefreshCw,
  Gift, Bell, MessageCircle, Settings, Info
} from 'lucide-react';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../contexts/AuthContext';
import './Challenges.css';

const CHALLENGE_CATEGORIES = [
  { id: 'sport', name: 'Sport', icon: Dumbbell, color: '#EF4444', emoji: '💪' },
  { id: 'reading', name: 'Kitob o\'qish', icon: BookOpen, color: '#8B5CF6', emoji: '📚' },
  { id: 'water', name: 'Suv ichish', icon: Droplets, color: '#3B82F6', emoji: '💧' },
  { id: 'meditation', name: 'Meditatsiya', icon: Brain, color: '#10B981', emoji: '🧘' },
  { id: 'language', name: 'Til o\'rganish', icon: BookOpen, color: '#F59E0B', emoji: '🌍' },
  { id: 'finance', name: 'Moliyaviy', icon: Wallet, color: '#06B6D4', emoji: '💰' },
  { id: 'health', name: 'Salomatlik', icon: Heart, color: '#EC4899', emoji: '❤️' },
  { id: 'custom', name: 'Boshqa', icon: Target, color: '#6366F1', emoji: '🎯' }
];

const DURATION_OPTIONS = [
  { value: 7, label: '7 kun', description: 'Qisqa muddatli' },
  { value: 14, label: '14 kun', description: 'O\'rta muddatli' },
  { value: 30, label: '30 kun', description: 'To\'liq odat' }
];

const UNIT_OPTIONS = [
  { value: 'minutes', label: 'Daqiqa' },
  { value: 'times', label: 'Marta' },
  { value: 'pages', label: 'Sahifa' },
  { value: 'liters', label: 'Litr' },
  { value: 'steps', label: 'Qadam' },
  { value: 'custom', label: 'Boshqa' }
];

// Motivatsion xabarlar
const MOTIVATIONAL_QUOTES = [
  { text: "Har bir katta yutuq kichik qadamlardan boshlanadi.", author: "Konfutsiy" },
  { text: "Bugun qilgan harakatingiz ertangi o'zingizni shakllantiradi.", author: "Jim Rohn" },
  { text: "Muvaffaqiyat - bu har kuni takrorlanadigan kichik harakatlar yig'indisi.", author: "Robert Collier" },
  { text: "21 kun - odat, 90 kun - hayot tarzi.", author: "Maxwell Maltz" },
  { text: "Eng yaxshi vaqt - hozir. Eng yaxshi joy - bu yer.", author: "Budda" },
  { text: "Kichik g'alabalar katta o'zgarishlarga olib keladi.", author: "James Clear" },
  { text: "Har bir kun yangi imkoniyat. Undan foydalaning!", author: "Dalai Lama" },
  { text: "Izchillik - muvaffaqiyatning kaliti.", author: "Aristotel" }
];

// Streak bonuslari
const STREAK_BONUSES = [
  { days: 3, bonus: 15, badge: '🔥', title: '3 kunlik streak!' },
  { days: 7, bonus: 50, badge: '⭐', title: 'Haftalik champion!' },
  { days: 14, bonus: 100, badge: '💎', title: '2 haftalik ustoz!' },
  { days: 21, bonus: 200, badge: '🏆', title: 'Odat shakllandi!' },
  { days: 30, bonus: 500, badge: '👑', title: 'Oylik legenda!' }
];

// Kunlik tips
const DAILY_TIPS = [
  "💡 Har kuni bir xil vaqtda bajaring - odat tezroq shakllanadi",
  "💡 Kichik maqsadlar qo'ying - muvaffaqiyat kafolatlanadi",
  "💡 Do'stlaringiz bilan birga qiling - motivatsiya oshadi",
  "💡 Progress'ingizni kuzating - bu sizni rag'batlantiradi",
  "💡 O'zingizni mukofotlang - har bir g'alaba muhim",
  "💡 Sabab toping - nima uchun buni qilayotganingizni eslang",
  "💡 Muhitingizni tayyorlang - osonroq bajarish uchun",
  "💡 Kechiktirishdan qoching - hoziroq boshlang!"
];

const Challenges = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showChallengeMenu, setShowChallengeMenu] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [dailyTip, setDailyTip] = useState('');
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'custom',
    duration: 30,
    dailyGoal: { value: 1, unit: 'times', customUnit: '' },
    trackingType: 'manual',
    maxParticipants: 10,
    isPublic: false,
    startDate: new Date().toISOString().split('T')[0],
    icon: '🎯',
    color: '#3B82F6'
  });

  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadChallenges();
    fetchSettings();
    initializeDailyContent();
  }, [user]);

  // Kunlik motivatsion kontent
  const initializeDailyContent = () => {
    const today = new Date().getDate();
    const quoteIndex = today % MOTIVATIONAL_QUOTES.length;
    const tipIndex = today % DAILY_TIPS.length;
    setDailyQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
    setDailyTip(DAILY_TIPS[tipIndex]);
  };

  // Confetti effekti
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Umumiy statistika hisoblash
  const overallStats = useMemo(() => {
    const activeChallenges = challenges.filter(c => c.status === 'active' || c.status === 'pending');
    const completedChallenges = challenges.filter(c => c.status === 'completed');
    const totalPoints = challenges.reduce((sum, c) => sum + (c.participantData?.totalPoints || 0), 0);
    const totalCompletedDays = challenges.reduce((sum, c) => sum + (c.participantData?.completedDays || 0), 0);
    const maxStreak = Math.max(...challenges.map(c => c.participantData?.maxStreak || 0), 0);
    const currentStreaks = challenges.map(c => c.participantData?.currentStreak || 0);
    const bestCurrentStreak = Math.max(...currentStreaks, 0);
    
    // Haftalik progress
    const weeklyProgress = activeChallenges.reduce((sum, c) => {
      const progress = c.participantData?.completedDays || 0;
      const duration = c.duration || 30;
      return sum + (progress / duration) * 100;
    }, 0) / (activeChallenges.length || 1);

    // Keyingi bonus
    const nextBonus = STREAK_BONUSES.find(b => b.days > bestCurrentStreak) || STREAK_BONUSES[STREAK_BONUSES.length - 1];
    const daysToNextBonus = nextBonus ? nextBonus.days - bestCurrentStreak : 0;

    return {
      activeChallenges: activeChallenges.length,
      completedChallenges: completedChallenges.length,
      totalPoints,
      totalCompletedDays,
      maxStreak,
      bestCurrentStreak,
      weeklyProgress: Math.round(weeklyProgress),
      nextBonus,
      daysToNextBonus
    };
  }, [challenges]);

  // Helper function - bugungi kun raqamini hisoblash
  const getTodayDayNumber = (startDate) => {
    if (!startDate) return 1;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  };

  // Bugungi vazifalar
  const todaysTasks = useMemo(() => {
    return challenges.filter(c => {
      if (c.status !== 'active' && c.status !== 'pending') return false;
      const todayDay = getTodayDayNumber(c.startDate);
      const todayProgress = c.progress?.find(p => p.dayNumber === todayDay);
      return todayProgress && todayProgress.status !== 'done';
    });
  }, [challenges]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/public`);
      const data = await response.json();
      if (data.success) {
        setAppSettings(data.settings);
        // If Challenges is disabled, redirect to home
        if (!data.settings.challenges_enabled) {
          navigate('/');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges();
      if (data.success) {
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Load challenges error:', error);
      showToast('Challengelarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = useMemo(() => {
    let result = [...challenges];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }

    if (activeTab === 'active') {
      result = result.filter(c => c.status === 'active' || c.status === 'pending');
    } else if (activeTab === 'completed') {
      result = result.filter(c => c.status === 'completed');
    }

    return result;
  }, [challenges, searchTerm, activeTab]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Challenge nomini kiriting', 'warning');
      return;
    }

    try {
      setCreateLoading(true);
      const data = await challengeService.createChallenge(formData);

      if (data.success) {
        setChallenges(prev => [data.challenge, ...prev]);
        setShowCreateModal(false);
        resetForm();
        showToast('Challenge muvaffaqiyatli yaratildi! 🎉', 'success');
      }
    } catch (error) {
      console.error('Create challenge error:', error);
      showToast(error.response?.data?.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!joinCode.trim()) {
      showToast('Taklif kodini kiriting', 'warning');
      return;
    }

    try {
      setJoinLoading(true);
      const data = await challengeService.joinChallenge(joinCode.trim());

      if (data.success) {
        setChallenges(prev => [data.challenge, ...prev]);
        setShowJoinModal(false);
        setJoinCode('');
        showToast('Challengega muvaffaqiyatli qo\'shildingiz! 🎉', 'success');
      }
    } catch (error) {
      console.error('Join challenge error:', error);
      showToast(error.response?.data?.message || 'Taklif kodi noto\'g\'ri', 'error');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleViewChallenge = async (challenge) => {
    try {
      const data = await challengeService.getChallengeDetails(challenge._id);
      if (data.success) {
        setSelectedChallenge(data.challenge);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Get challenge details error:', error);
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
    }
  };

  const handleUpdateProgress = async (dayNumber, status) => {
    if (!selectedChallenge) return;

    try {
      const data = await challengeService.updateProgress(selectedChallenge._id, {
        dayNumber,
        status
      });

      if (data.success) {
        // Update local state
        setSelectedChallenge(prev => ({
          ...prev,
          progress: prev.progress.map(p =>
            p.dayNumber === dayNumber ? { ...p, status } : p
          ),
          participantData: data.participantData || prev.participantData
        }));

        // Update challenges list
        setChallenges(prev => prev.map(c =>
          c._id === selectedChallenge._id
            ? { ...c, participantData: data.participantData || c.participantData }
            : c
        ));

        if (status === 'done') {
          triggerConfetti();
          
          // Streak bonus tekshirish
          const newStreak = data.participantData?.currentStreak || 0;
          const streakBonus = STREAK_BONUSES.find(b => b.days === newStreak);
          
          if (streakBonus) {
            showToast(`${streakBonus.badge} ${streakBonus.title} +${streakBonus.bonus} bonus ball!`, 'success');
          } else {
            showToast(`Bajarildi! +${data.pointsEarned || 10} ball 🎉`, 'success');
          }
        }
      }
    } catch (error) {
      console.error('Update progress error:', error);
      showToast('Progressni yangilashda xatolik', 'error');
    }
  };

  const handleCopyInviteCode = async (challenge) => {
    try {
      await navigator.clipboard.writeText(challenge.inviteCode);
      showToast('Taklif kodi nusxalandi!', 'success');
    } catch (error) {
      showToast('Nusxalashda xatolik', 'error');
    }
  };

  const handleRefreshChallenges = async () => {
    await loadChallenges();
    showToast('Yangilandi!', 'success');
  };

  const handleGenerateNewInviteCode = async (challengeId) => {
    try {
      const data = await challengeService.generateInviteCode(challengeId);
      if (data.success) {
        // Update selected challenge with new invite code
        setSelectedChallenge(prev => ({
          ...prev,
          inviteCode: data.inviteCode,
          inviteCodeExpiry: data.expiresAt
        }));
        // Update challenges list
        setChallenges(prev => prev.map(c => 
          c._id === challengeId 
            ? { ...c, inviteCode: data.inviteCode, inviteCodeExpiry: data.expiresAt }
            : c
        ));
        showToast('Yangi taklif kodi yaratildi!', 'success');
      }
    } catch (error) {
      console.error('Generate invite code error:', error);
      showToast(error.response?.data?.message || 'Xatolik yuz berdi', 'error');
    }
  };

  const handleShareChallenge = async (challenge) => {
    const shareText = `🎯 "${challenge.title}" challengega qo'shiling!\n\n📅 ${challenge.duration} kunlik challenge\n🔑 Taklif kodi: ${challenge.inviteCode}\n\nInFast AI ilovasida qo'shiling!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: challenge.title,
          text: shareText
        });
      } catch (error) {
        // User cancelled or error
        handleCopyInviteCode(challenge);
      }
    } else {
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Ulashish matni nusxalandi!', 'success');
      } catch (error) {
        showToast('Nusxalashda xatolik', 'error');
      }
    }
  };

  const getBadgeInfo = (badgeType) => {
    const badges = {
      bronze: { name: 'Bronze', color: 'bg-amber-600', emoji: '🥉' },
      silver: { name: 'Silver', color: 'bg-gray-400', emoji: '🥈' },
      gold: { name: 'Gold', color: 'bg-yellow-500', emoji: '🥇' },
      legendary: { name: 'Legendary', color: 'bg-purple-600', emoji: '👑' }
    };
    return badges[badgeType] || badges.bronze;
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Bu challengeni o\'chirishni xohlaysizmi?')) return;

    try {
      const data = await challengeService.deleteChallenge(challengeId);
      if (data.success) {
        setChallenges(prev => prev.filter(c => c._id !== challengeId));
        setShowDetailModal(false);
        showToast('Challenge o\'chirildi', 'success');
      }
    } catch (error) {
      console.error('Delete challenge error:', error);
      showToast(error.response?.data?.message || 'O\'chirishda xatolik', 'error');
    }
  };

  const handleLeaveChallenge = async (challengeId) => {
    if (!window.confirm('Bu challengeni tark etmoqchimisiz?')) return;

    try {
      const data = await challengeService.leaveChallenge(challengeId);
      if (data.success) {
        setChallenges(prev => prev.filter(c => c._id !== challengeId));
        setShowDetailModal(false);
        showToast('Challengeni tark etdingiz', 'success');
      }
    } catch (error) {
      console.error('Leave challenge error:', error);
      showToast(error.response?.data?.message || 'Xatolik yuz berdi', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      category: 'custom',
      duration: 30,
      dailyGoal: { value: 1, unit: 'times', customUnit: '' },
      trackingType: 'manual',
      maxParticipants: 10,
      isPublic: false,
      startDate: new Date().toISOString().split('T')[0],
      icon: '🎯',
      color: '#3B82F6'
    });
  };

  const showToast = (message, type = 'info') => {
    const toastId = `toast-${Date.now()}`;
    let toastContainer = document.getElementById('challenge-toast-container');

    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'challenge-toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-[100] space-y-2';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `
      animate-slideInRight p-4 rounded-xl shadow-lg border max-w-sm
      ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
        type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-blue-50 border-blue-200 text-blue-800'}
    `;

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <p class="font-medium text-sm">${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getCategoryInfo = (categoryId) => {
    return CHALLENGE_CATEGORIES.find(c => c.id === categoryId) || CHALLENGE_CATEGORIES[7];
  };

  const getProgressPercentage = (challenge) => {
    if (!challenge.participantData) return 0;
    const { completedDays } = challenge.participantData;
    return Math.round((completedDays / challenge.duration) * 100);
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Challengelar yuklanmoqda</h3>
          <p className="text-gray-600">Iltimos, kuting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 sm:pb-8 px-4 sm:px-6 lg:px-8">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '⭐', '🔥', '💪', '🏆', '✨'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Challengelar</h1>
              <p className="text-white/80 text-sm mt-1">
                Do'stlar bilan birga odat shakllantiring
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl transition-all"
              title="Statistika"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleRefreshChallenges}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl transition-all"
              title="Yangilash"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl font-semibold transition-all"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Qo'shilish</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white text-orange-600 hover:bg-orange-50 rounded-xl font-semibold transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Yangi Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bugungi vazifalar - Quick Actions */}
      {todaysTasks.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Bugungi vazifalar</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{todaysTasks.length} ta challenge kutmoqda</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaysTasks.slice(0, 3).map((challenge) => {
              const category = getCategoryInfo(challenge.category);
              return (
                <button
                  key={challenge._id}
                  onClick={() => handleViewChallenge(challenge)}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all text-left group"
                >
                  <span className="text-2xl">{challenge.icon || category.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{challenge.title}</p>
                    <p className="text-xs text-gray-500">{challenge.participantData?.currentStreak || 0} 🔥 streak</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Streak Progress Card */}
      {overallStats.bestCurrentStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Joriy streak</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.bestCurrentStreak} kun</p>
              </div>
            </div>
            {overallStats.nextBonus && overallStats.daysToNextBonus > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Keyingi bonus</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {overallStats.nextBonus.badge} {overallStats.daysToNextBonus} kunda
                </p>
                <p className="text-xs text-gray-500">+{overallStats.nextBonus.bonus} ball</p>
              </div>
            )}
          </div>
          {/* Progress to next bonus */}
          {overallStats.nextBonus && (
            <div className="mt-4">
              <div className="h-2 bg-orange-200 dark:bg-orange-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(overallStats.bestCurrentStreak / overallStats.nextBonus.days) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Faol</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenges.filter(c => c.status === 'active' || c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tugatilgan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenges.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Flame className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Eng uzun streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.max(...challenges.map(c => c.participantData?.maxStreak || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jami ball</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenges.reduce((sum, c) => sum + (c.participantData?.totalPoints || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Faol
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Tugatilgan
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
              Barchasi
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {activeTab === 'completed' ? 'Tugatilgan challengelar yo\'q' : 'Hozircha challengelar yo\'q'}
          </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Yangi challenge yarating yoki do'stlaringiz bilan birga qo'shiling!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <Users className="w-5 h-5" />
              Qo'shilish
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Yangi Challenge
            </button>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredChallenges.map((challenge) => {
            const category = getCategoryInfo(challenge.category);
            const progress = getProgressPercentage(challenge);
            const daysRemaining = getDaysRemaining(challenge.endDate);
            const todayDay = getTodayDayNumber(challenge.startDate);

            return (
              <div
                key={challenge._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Header with gradient */}
                <div
                  className="p-4 text-white relative overflow-hidden"
                  style={{ backgroundColor: challenge.color || category.color }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{challenge.icon || category.emoji}</span>
                      <div>
                        <h3 className="font-bold text-lg line-clamp-1">{challenge.title}</h3>
                        <p className="text-white/80 text-sm">{category.name}</p>
                      </div>
                    </div>
                    {challenge.participantData?.role === 'owner' && (
                      <Crown className="w-5 h-5 text-yellow-300" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: challenge.color || category.color
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{challenge.participantData?.currentStreak || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">Streak</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold">{challenge.participantData?.completedDays || 0}/{challenge.duration}</span>
                      </div>
                      <p className="text-xs text-gray-500">Kun</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{challenge.currentParticipants || 1}</span>
                      </div>
                      <p className="text-xs text-gray-500">Ishtirokchi</p>
                    </div>
                  </div>

                  {/* Time remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{daysRemaining} kun qoldi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {challenge.participantData?.totalPoints || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewChallenge(challenge)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Ko'rish
                    </button>
                    <button
                      onClick={() => handleCopyInviteCode(challenge)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl font-medium hover:bg-orange-200 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full sm:max-w-xl max-h-[92vh] overflow-hidden animate-slideUp"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}
          >
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-6 py-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Yangi Challenge</h2>
                    <p className="text-white/80 text-sm mt-0.5">Do'stlar bilan birga o'sish</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateChallenge} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(92vh-120px)]">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Target className="w-4 h-4 text-orange-500" />
                  Challenge nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: 30 kunlik sport"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Challenge haqida qisqacha..."
                  rows={2}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Kategoriya
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                  {CHALLENGE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        category: cat.id,
                        icon: cat.emoji,
                        color: cat.color
                      })}
                      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.category === cat.id
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{cat.emoji}</span>
                      <span className={`text-[10px] sm:text-xs font-medium truncate w-full text-center ${formData.category === cat.id ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Davomiylik
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: opt.value })}
                      className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-center ${
                        formData.duration === opt.value
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <p className={`font-bold text-base sm:text-lg ${formData.duration === opt.value ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Goal */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Flag className="w-4 h-4 text-orange-500" />
                  Kunlik maqsad
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.dailyGoal.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      dailyGoal: { ...formData.dailyGoal, value: parseInt(e.target.value) || 1 }
                    })}
                    className="w-28 px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-center font-bold text-xl text-gray-900 dark:text-white"
                  />
                  <select
                    value={formData.dailyGoal.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      dailyGoal: { ...formData.dailyGoal, unit: e.target.value }
                    })}
                    className="flex-1 px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-gray-900 dark:text-white"
                  >
                    {UNIT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & Max Participants Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Boshlanish
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Users className="w-4 h-4 text-orange-500" />
                    Ishtirokchilar
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Yaratish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Challenge Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 px-6 py-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Qo'shilish</h2>
                    <p className="text-white/80 text-sm mt-0.5">Do'stlar challengesiga</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Copy className="w-4 h-4 text-indigo-500" />
                  Taklif kodini kiriting
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3D4"
                  className="w-full px-6 py-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-center text-3xl font-mono tracking-[0.3em] uppercase text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-all"
                  maxLength={8}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Do'stingizdan olgan 8 xonali taklif kodini kiriting
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleJoinChallenge}
                  disabled={joinLoading || !joinCode.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {joinLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-5 h-5" />
                      Qo'shilish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Detail Modal */}
      {showDetailModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden animate-slideUp"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Gradient Header */}
            <div
              className="relative px-4 sm:px-6 py-4 sm:py-6 text-white overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${selectedChallenge.color || '#3B82F6'} 0%, ${selectedChallenge.color || '#3B82F6'}dd 100%)` }}
            >
              <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl shadow-lg">
                    {selectedChallenge.icon || '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg sm:text-2xl font-bold line-clamp-1">{selectedChallenge.title}</h2>
                      {selectedChallenge.participantData?.role === 'owner' && (
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                      )}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">
                      {selectedChallenge.participantData?.completedDays || 0} / {selectedChallenge.duration} kun bajarildi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="relative mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Progress</span>
                  <span className="font-bold">{getProgressPercentage(selectedChallenge)}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${getProgressPercentage(selectedChallenge)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(92vh-180px)]">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl sm:rounded-2xl border border-orange-100 dark:border-orange-900/30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.currentStreak || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Streak</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl border border-purple-100 dark:border-purple-900/30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.totalPoints || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Ball</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl border border-green-100 dark:border-green-900/30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.maxStreak || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Max</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.currentParticipants || 1}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Odam</p>
                </div>
              </div>

              {/* Primary action - Mark today as done */}
              {selectedChallenge.progress && (() => {
                const todayDay = getTodayDayNumber(selectedChallenge.startDate);
                const todayProgress = selectedChallenge.progress.find(p => p.dayNumber === todayDay);
                if (todayProgress && todayProgress.status !== 'done') {
                  return (
                    <button
                      onClick={() => handleUpdateProgress(todayDay, 'done')}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                      Bugungi kunni bajardim!
                    </button>
                  );
                }
                return null;
              })()}

              {/* Daily Progress Grid */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Kunlik Progress
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {selectedChallenge.progress?.map((day) => {
                    const isToday = day.dayNumber === getTodayDayNumber(selectedChallenge.startDate);
                    const isPast = new Date(day.date) < new Date().setHours(0, 0, 0, 0);
                    const canComplete = isToday || (isPast && day.status === 'pending');

                    return (
                      <button
                        key={day.dayNumber}
                        onClick={() => canComplete && day.status !== 'done' && handleUpdateProgress(day.dayNumber, 'done')}
                        disabled={!canComplete || day.status === 'done'}
                        className={`
                          aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                          ${day.status === 'done'
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md shadow-green-500/30'
                            : day.status === 'missed'
                              ? 'bg-red-100 text-red-500 dark:bg-red-900/30'
                              : isToday
                                ? 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 dark:from-orange-900/40 dark:to-amber-900/40 ring-2 ring-orange-500 shadow-md'
                                : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                          }
                          ${canComplete && day.status !== 'done' ? 'hover:scale-110 cursor-pointer' : ''}
                        `}
                      >
                        <span>{day.dayNumber}</span>
                        {day.status === 'done' && <Check className="w-3.5 h-3.5 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              {selectedChallenge.leaderboard && selectedChallenge.leaderboard.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {selectedChallenge.leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={entry.user?.id || index}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800' :
                          index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-200 dark:border-gray-700' :
                          index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800' :
                          'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        {/* Rank badge */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {entry.rank}
                        </div>
                        
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md overflow-hidden">
                          {entry.user?.avatar ? (
                            <img 
                              src={entry.user.avatar.startsWith('http') ? entry.user.avatar : `${import.meta.env.VITE_API_URL || 'https://infastaiii.onrender.com'}${entry.user.avatar}`} 
                              alt={entry.user?.name || 'User'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className={entry.user?.avatar ? 'hidden' : 'flex'}>
                            {(entry.user?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Name and stats */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{entry.user?.name || 'Noma\'lum'}</p>
                          <p className="text-sm text-gray-500">{entry.completedDays} kun • {entry.currentStreak} 🔥</p>
                        </div>
                        
                        {/* Points */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{entry.totalPoints}</p>
                          <p className="text-xs text-gray-500">ball</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {selectedChallenge.participantData?.badges && selectedChallenge.participantData.badges.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Yutuqlar
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedChallenge.participantData.badges.map((badge, idx) => {
                      const badgeInfo = getBadgeInfo(badge.type);
                      return (
                        <span key={idx} className={`inline-flex items-center gap-2 px-4 py-2 ${badgeInfo.color} text-white rounded-xl text-sm font-bold shadow-lg`}>
                          <span className="text-lg">{badgeInfo.emoji}</span>
                          {badgeInfo.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Invite Code */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-orange-500" />
                    Taklif kodi
                  </h3>
                  {selectedChallenge.participantData?.role === 'owner' && (
                    <button
                      onClick={() => handleGenerateNewInviteCode(selectedChallenge._id)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg transition-all hover:bg-orange-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Yangilash
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 py-4 px-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <code className="text-3xl font-mono font-bold text-center text-gray-900 dark:text-white tracking-[0.2em] block">
                      {selectedChallenge.inviteCode}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyInviteCode(selectedChallenge)}
                    className="p-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    title="Nusxalash"
                  >
                    <Copy className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleShareChallenge(selectedChallenge)}
                    className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
                    title="Ulashish"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {selectedChallenge.description && (
                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Tavsif
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChallenge.description}</p>
                </div>
              )}

              {/* Challenge Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <p className="text-xs text-gray-500 font-medium">Kunlik maqsad</p>
                  </div>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                    {selectedChallenge.dailyGoal?.value || 1} {selectedChallenge.dailyGoal?.unit === 'minutes' ? 'daqiqa' : selectedChallenge.dailyGoal?.unit === 'times' ? 'marta' : selectedChallenge.dailyGoal?.unit || ''}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-gray-500 font-medium">Tugash sanasi</p>
                  </div>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                    {selectedChallenge.endDate ? new Date(selectedChallenge.endDate).toLocaleDateString('uz-UZ') : '-'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2 pb-4">
                {selectedChallenge.participantData?.role === 'owner' ? (
                  <button
                    onClick={() => handleDeleteChallenge(selectedChallenge._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    O'chirish
                  </button>
                ) : (
                  <button
                    onClick={() => handleLeaveChallenge(selectedChallenge._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Tark etish
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 px-6 py-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Statistika</h2>
                    <p className="text-white/80 text-sm mt-0.5">Sizning yutuqlaringiz</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-center">
                  <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.activeChallenges}</p>
                  <p className="text-sm text-gray-500">Faol challenge</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-900/30 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.completedChallenges}</p>
                  <p className="text-sm text-gray-500">Tugatilgan</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-center">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.totalPoints}</p>
                  <p className="text-sm text-gray-500">Jami ball</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                  <Flame className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.maxStreak}</p>
                  <p className="text-sm text-gray-500">Eng uzun streak</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Jami bajarilgan kunlar</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{overallStats.totalCompletedDays}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">O'rtacha progress</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{overallStats.weeklyProgress}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Joriy streak</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{overallStats.bestCurrentStreak} kun</span>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-center text-gray-700 dark:text-gray-300">
                  {overallStats.totalPoints >= 500 
                    ? "🏆 Siz haqiqiy champion! Davom eting!" 
                    : overallStats.totalPoints >= 100 
                    ? "⭐ Ajoyib natija! Yanada ko'proq ball to'plang!" 
                    : "💪 Yaxshi boshlang'ich! Har bir kun muhim!"}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
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

export default Challenges;
