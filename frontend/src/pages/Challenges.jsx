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

const Challenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showChallengeMenu, setShowChallengeMenu] = useState(null);

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
  }, []);

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
          showToast(`Bajarildi! +${data.pointsEarned || 10} ball 🎉`, 'success');
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

  const getTodayDayNumber = (startDate) => {
    if (!startDate) return 1;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yangi Challenge</h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="p-4 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Challenge nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: 30 kunlik sport"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Challenge haqida qisqacha..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategoriya
                </label>
                <div className="grid grid-cols-4 gap-2">
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
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.category === cat.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Davomiylik
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: opt.value })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.duration === opt.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kunlik maqsad
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.dailyGoal.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      dailyGoal: { ...formData.dailyGoal, value: parseInt(e.target.value) || 1 }
                    })}
                    className="w-24 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold"
                  />
                  <select
                    value={formData.dailyGoal.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      dailyGoal: { ...formData.dailyGoal, unit: e.target.value }
                    })}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {UNIT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* Max Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Maksimal ishtirokchilar
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 pb-6">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {createLoading ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Challenge Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Challengega Qo'shilish</h2>
              <button
                onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taklif kodi
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Masalan: A1B2C3D4"
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={8}
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Do'stingizdan olgan taklif kodini kiriting
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Bekor
                </button>
                <button
                  onClick={handleJoinChallenge}
                  disabled={joinLoading || !joinCode.trim()}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {joinLoading ? 'Tekshirilmoqda...' : 'Qo\'shilish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Detail Modal */}
      {showDetailModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className="sticky top-0 p-4 text-white z-10"
              style={{ backgroundColor: selectedChallenge.color || '#3B82F6' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedChallenge.icon || '🎯'}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedChallenge.title}</h2>
                    <p className="text-white/80 text-sm">
                      {selectedChallenge.participantData?.completedDays || 0}/{selectedChallenge.duration} kun bajarildi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(selectedChallenge)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 lg:space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
                <div className="text-center p-2 lg:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl relative group">
                  <Flame className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.currentStreak || 0}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500">Streak</p>
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50 shadow-lg">
                    Streak — foydalanuvchi ketma-ket qilayotgan harakatlar sonini ko'rsatadigan raqam.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                <div className="text-center p-2 lg:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl relative group">
                  <Star className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.totalPoints || 0}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500">Ball</p>
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50 shadow-lg">
                    Ball — har bajarilgan kun uchun +10, 7 kunlik streak uchun +50 ball beriladi.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                <div className="text-center p-2 lg:p-3 bg-green-50 dark:bg-green-900/20 rounded-xl relative group">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.maxStreak || 0}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500">Max Streak</p>
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50 shadow-lg">
                    Max Streak — sizning eng uzun ketma-ket bajarilgan kunlar rekordi.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                <div className="text-center p-2 lg:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl relative group">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.currentParticipants || 1}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500">Ishtirokchi</p>
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50 shadow-lg">
                    Ishtirokchi — bu challengega qo'shilgan barcha foydalanuvchilar soni.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>

              {/* Daily Progress Grid */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Kunlik Progress</h3>
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
                          aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all
                          ${day.status === 'done'
                            ? 'bg-green-500 text-white'
                            : day.status === 'missed'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                              : isToday
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 ring-2 ring-orange-500'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                          }
                          ${canComplete && day.status !== 'done' ? 'hover:scale-105 cursor-pointer' : ''}
                        `}
                      >
                        <span>{day.dayNumber}</span>
                        {day.status === 'done' && <Check className="w-3 h-3 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              {selectedChallenge.leaderboard && selectedChallenge.leaderboard.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Leaderboard</h3>
                  <div className="space-y-2">
                    {selectedChallenge.leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={entry.user?.id || index}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200' :
                          index === 1 ? 'bg-gray-100 dark:bg-gray-700 border border-gray-200' :
                          index === 2 ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200' :
                          'bg-gray-50 dark:bg-gray-800 border border-gray-100'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
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
                        </div>
                        
                        {/* Name and stats */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{entry.user?.name || 'Noma\'lum'}</p>
                          <p className="text-xs text-gray-500">{entry.completedDays} kun • {entry.currentStreak} 🔥</p>
                        </div>
                        
                        {/* Points */}
                        <div className="text-center">
                          <p className="font-bold text-gray-900 dark:text-white">{entry.totalPoints}</p>
                          <p className="text-xs text-gray-500">ball</p>
                        </div>
                        
                        {/* Rank badge on right */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {entry.rank}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {selectedChallenge.participantData?.badges && selectedChallenge.participantData.badges.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <p className="text-sm text-gray-500 mb-3">Yutuqlar</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedChallenge.participantData.badges.map((badge, idx) => {
                      const badgeInfo = getBadgeInfo(badge.type);
                      return (
                        <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1.5 ${badgeInfo.color} text-white rounded-full text-sm font-medium`}>
                          <span>{badgeInfo.emoji}</span>
                          {badgeInfo.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Invite Code */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Taklif kodi</p>
                  {selectedChallenge.participantData?.role === 'owner' && (
                    <button
                      onClick={() => handleGenerateNewInviteCode(selectedChallenge._id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Yangi kod
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-2xl font-mono font-bold text-center text-gray-900 dark:text-white tracking-widest">
                    {selectedChallenge.inviteCode}
                  </code>
                  <button
                    onClick={() => handleCopyInviteCode(selectedChallenge)}
                    className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 transition-all"
                    title="Nusxalash"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShareChallenge(selectedChallenge)}
                    className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all"
                    title="Ulashish"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {selectedChallenge.description && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChallenge.description}</p>
                </div>
              )}

              {/* Challenge Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Kunlik maqsad</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.dailyGoal?.value || 1} {selectedChallenge.dailyGoal?.unit === 'minutes' ? 'daqiqa' : selectedChallenge.dailyGoal?.unit === 'times' ? 'marta' : selectedChallenge.dailyGoal?.unit || ''}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Tugash sanasi</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.endDate ? new Date(selectedChallenge.endDate).toLocaleDateString('uz-UZ') : '-'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pb-6">
                {/* Primary action - Mark today as done */}
                {selectedChallenge.progress && (() => {
                  const todayDay = getTodayDayNumber(selectedChallenge.startDate);
                  const todayProgress = selectedChallenge.progress.find(p => p.dayNumber === todayDay);
                  if (todayProgress && todayProgress.status !== 'done') {
                    return (
                      <button
                        onClick={() => handleUpdateProgress(todayDay, 'done')}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Bugungi kunni bajardim!
                      </button>
                    );
                  }
                  return null;
                })()}

                {/* Secondary actions */}
                <div className="flex gap-3">
                  {selectedChallenge.participantData?.role === 'owner' ? (
                    <button
                      onClick={() => handleDeleteChallenge(selectedChallenge._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                      O'chirish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLeaveChallenge(selectedChallenge._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      Tark etish
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
