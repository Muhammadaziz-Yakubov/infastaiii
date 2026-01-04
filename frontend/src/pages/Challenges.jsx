import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Plus, Users, Calendar, Target, Flame,
  Clock, CheckCircle, X, Copy, Share2, Crown,
  Search, Eye, Trash2, LogOut, BookOpen, Droplets, Brain,
  Dumbbell, Wallet, Heart, Check, RefreshCw, ChevronRight,
  MoreVertical, Award, Zap, Star, Play, Pause
} from 'lucide-react';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'sport', name: 'Sport', emoji: '💪', color: '#EF4444' },
  { id: 'reading', name: 'Kitob o\'qish', emoji: '📚', color: '#8B5CF6' },
  { id: 'water', name: 'Suv ichish', emoji: '💧', color: '#3B82F6' },
  { id: 'meditation', name: 'Meditatsiya', emoji: '🧘', color: '#10B981' },
  { id: 'language', name: 'Til o\'rganish', emoji: '🌍', color: '#F59E0B' },
  { id: 'finance', name: 'Moliyaviy', emoji: '💰', color: '#06B6D4' },
  { id: 'health', name: 'Salomatlik', emoji: '❤️', color: '#EC4899' },
  { id: 'health', name: 'Dasturlash', emoji: '💻', color: '#0004ffff' },
  { id: 'custom', name: 'Boshqa', emoji: '🎯', color: '#6366F1' }
];

const DURATIONS = [
  { value: 7, label: '7 kun', desc: 'Qisqa' },
  { value: 14, label: '14 kun', desc: 'O\'rta' },
  { value: 30, label: '30 kun', desc: 'Uzun' }
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
  const [challengeDetails, setChallengeDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'custom',
    duration: 30,
    dailyGoal: 1,
    unit: 'times',
    maxParticipants: 10,
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges();
      if (data.success) {
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Load challenges error:', error);
      toast.error('Challengelarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = useMemo(() => {
    let result = [...challenges];
    if (searchTerm.trim()) {
      result = result.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (activeTab === 'active') {
      result = result.filter(c => c.status === 'active' || c.status === 'pending');
    } else if (activeTab === 'completed') {
      result = result.filter(c => c.status === 'completed');
    }
    return result;
  }, [challenges, searchTerm, activeTab]);

  // Stats
  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active' || c.status === 'pending').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    totalStreak: Math.max(...challenges.map(c => c.participantData?.currentStreak || 0), 0),
    totalPoints: challenges.reduce((sum, c) => sum + (c.participantData?.totalPoints || 0), 0)
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Challenge nomini kiriting');
      return;
    }
    try {
      setCreateLoading(true);
      const category = CATEGORIES.find(c => c.id === formData.category);
      const data = await challengeService.createChallenge({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        dailyGoal: { value: formData.dailyGoal, unit: formData.unit },
        startDate: formData.startDate,
        maxParticipants: formData.maxParticipants,
        icon: category?.emoji || '🎯',
        color: category?.color || '#6366F1'
      });
      if (data.success) {
        toast.success('Challenge yaratildi! 🎉');
        setShowCreateModal(false);
        resetForm();
        loadChallenges();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!joinCode.trim()) {
      toast.error('Taklif kodini kiriting');
      return;
    }
    try {
      setJoinLoading(true);
      const data = await challengeService.joinChallenge(joinCode.trim());
      if (data.success) {
        toast.success('Challengega qo\'shildingiz! 🎉');
        setShowJoinModal(false);
        setJoinCode('');
        loadChallenges();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleUpdateProgress = async (challenge, status) => {
    try {
      const today = getTodayDayNumber(challenge.startDate);
      const data = await challengeService.updateProgress(challenge._id, {
        dayNumber: today,
        status,
        value: challenge.dailyGoal?.value || 1
      });
      if (data.success) {
        toast.success(status === 'done' ? '✅ Bajarildi! +10 ball' : 'O\'tkazib yuborildi');
        loadChallenges();
        // Detail modalda bo'lsa, leaderboard ni ham yangilash
        if (showDetailModal && selectedChallenge?._id === challenge._id) {
          loadChallengeDetails(challenge._id);
        }
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleCopyInviteCode = (challenge) => {
    if (challenge.inviteCode) {
      navigator.clipboard.writeText(challenge.inviteCode);
      toast.success('Taklif kodi nusxalandi! 📋');
    }
  };

  const loadChallengeDetails = async (challengeId) => {
    try {
      setDetailLoading(true);
      const data = await challengeService.getChallengeDetails(challengeId);
      if (data.success) {
        setChallengeDetails(data.challenge);
      }
    } catch (error) {
      console.error('Load challenge details error:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetailModal = (challenge) => {
    setSelectedChallenge(challenge);
    setShowDetailModal(true);
    loadChallengeDetails(challenge._id);
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Challengeni o\'chirmoqchimisiz?')) return;
    try {
      await challengeService.deleteChallenge(challengeId);
      toast.success('Challenge o\'chirildi');
      setShowDetailModal(false);
      setActiveMenu(null);
      loadChallenges();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleLeaveChallenge = async (challengeId) => {
    if (!window.confirm('Challengedan chiqmoqchimisiz?')) return;
    try {
      await challengeService.leaveChallenge(challengeId);
      toast.success('Challengedan chiqdingiz');
      setShowDetailModal(false);
      setActiveMenu(null);
      loadChallenges();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'custom',
      duration: 30,
      dailyGoal: 1,
      unit: 'times',
      maxParticipants: 10,
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const getTodayDayNumber = (startDate) => {
    if (!startDate) return 1;
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  };

  const getProgress = (challenge) => {
    if (!challenge.participantData) return 0;
    return Math.round((challenge.participantData.completedDays / challenge.duration) * 100);
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getCategory = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7];

  const getTodayStatus = (challenge) => {
    const today = getTodayDayNumber(challenge.startDate);
    const todayProgress = challenge.progress?.find(p => p.dayNumber === today);
    return todayProgress?.status || 'pending';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { text: 'Faol', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
      case 'pending':
        return { text: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'completed':
        return { text: 'Tugatilgan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Challengelar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-24 sm:pb-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section - Goals sahifasiga o'xshash */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 lg:p-10 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 lg:p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="w-7 h-7 lg:w-10 lg:h-10" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold">Challengelar</h1>
              <p className="text-white/80 text-sm lg:text-base">Do'stlar bilan birga odat shakllantiring</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base lg:text-lg"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span>Qo'shilish</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-white text-orange-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-white/90 transition-all text-sm sm:text-base lg:text-lg shadow-lg"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span>Yangi Challenge</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm lg:text-base">Faol</p>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{stats.active}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm lg:text-base">Tugatilgan</p>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{stats.completed}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm lg:text-base">Eng uzun streak</p>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{stats.totalStreak} kun</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm lg:text-base">Jami ball</p>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{stats.totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
          {[
            { id: 'active', label: 'Faol' },
            { id: 'completed', label: 'Tugatilgan' },
            { id: 'all', label: 'Barchasi' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button
            onClick={loadChallenges}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 lg:p-16 text-center shadow-md border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {activeTab === 'completed' ? 'Tugatilgan challengelar yo\'q' : 'Hozircha challengelar yo\'q'}
          </h3>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 lg:mb-8">
            Yangi challenge yarating yoki do'stlaringiz bilan qo'shiling!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors inline-flex items-center justify-center gap-2 font-semibold"
            >
              <Users className="w-5 h-5" />
              Qo'shilish
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2 text-base lg:text-lg font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
              Yangi Challenge
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredChallenges.map((challenge) => {
            const category = getCategory(challenge.category);
            const progress = getProgress(challenge);
            const todayStatus = getTodayStatus(challenge);
            const isOwner = challenge.participantData?.role === 'owner';
            const statusBadge = getStatusBadge(challenge.status);
            const daysLeft = getDaysLeft(challenge.endDate);

            return (
              <div
                key={challenge._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Color Header */}
                <div
                  className="h-2"
                  style={{ backgroundColor: challenge.color || category.color }}
                />

                <div className="p-5 lg:p-6">
                  {/* Challenge Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center text-2xl lg:text-3xl"
                        style={{ backgroundColor: `${challenge.color || category.color}20` }}
                      >
                        {challenge.icon || category.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                            {challenge.title}
                          </h3>
                          {isOwner && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                          <span className="text-xs text-gray-500">{category.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === challenge._id ? null : challenge._id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {activeMenu === challenge._id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                          <button
                            onClick={() => {
                              openDetailModal(challenge);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                          >
                            <Eye className="w-4 h-4" />
                            Batafsil
                          </button>
                          <button
                            onClick={() => {
                              handleCopyInviteCode(challenge);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                          >
                            <Copy className="w-4 h-4" />
                            Kodni nusxalash
                          </button>
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          {isOwner ? (
                            <button
                              onClick={() => handleDeleteChallenge(challenge._id)}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              O'chirish
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLeaveChallenge(challenge._id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                            >
                              <LogOut className="w-4 h-4" />
                              Chiqish
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: challenge.color || category.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{challenge.participantData?.currentStreak || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Streak</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold">{challenge.participantData?.completedDays || 0}/{challenge.duration}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Kun</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold">{daysLeft}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Qoldi</p>
                    </div>
                  </div>

                  {/* Mini Progress Grid - oxirgi 7 kun */}
                  <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Oxirgi 7 kun:</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {getTodayDayNumber(challenge.startDate)}-kun
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 7 }, (_, i) => {
                        const today = getTodayDayNumber(challenge.startDate);
                        const dayNum = Math.max(1, today - 6 + i);
                        if (dayNum > challenge.duration || dayNum < 1) {
                          return <div key={i} className="flex-1 h-6 rounded bg-gray-200 dark:bg-gray-700 opacity-30" />;
                        }
                        const dayProgress = challenge.progress?.find(p => p.dayNumber === dayNum);
                        const status = dayProgress?.status || 'pending';
                        const isToday = dayNum === today;
                        const isPast = dayNum < today;
                        
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-6 rounded flex items-center justify-center text-[10px] font-medium
                              ${isToday ? 'ring-1 ring-orange-500' : ''}
                              ${status === 'done' ? 'bg-green-500 text-white' : ''}
                              ${status === 'missed' || (status === 'pending' && isPast) ? 'bg-red-200 dark:bg-red-900/40 text-red-600' : ''}
                              ${status === 'pending' && isToday ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-600' : ''}
                              ${status === 'pending' && !isPast && !isToday ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : ''}
                            `}
                          >
                            {status === 'done' ? '✓' : dayNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {challenge.status === 'active' && (
                      <>
                        {todayStatus === 'done' ? (
                          <div className="flex items-center justify-center gap-2 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium">
                            <CheckCircle className="w-5 h-5" />
                            Bugun bajarildi! ✅
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateProgress(challenge, 'done')}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md active:scale-[0.98]"
                          >
                            <Check className="w-5 h-5" />
                            ✅ Bugun bajarildi
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => openDetailModal(challenge)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-[0.98]"
                    >
                      <Calendar className="w-4 h-4" />
                      Batafsil ko'rish
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Yangi Challenge</h2>
                    <p className="text-white/80 text-sm">Do'stlar bilan birga o'sish</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateChallenge} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Challenge nomi *
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

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Kategoriya
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.category === cat.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Davomiylik
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: d.value })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.duration === d.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-bold text-lg ${formData.duration === d.value ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                        {d.label}
                      </p>
                      <p className="text-xs text-gray-500">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Kunlik maqsad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dailyGoal}
                    onChange={(e) => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-center font-bold text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Birlik
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <option value="times">Marta</option>
                    <option value="minutes">Daqiqa</option>
                    <option value="pages">Sahifa</option>
                    <option value="liters">Litr</option>
                    <option value="steps">Qadam</option>
                    <option value="custom">Boshqa</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Qo'shilish</h2>
                    <p className="text-white/80 text-sm">Do'stlar challengesiga</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                  Taklif kodini kiriting
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3D4"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl font-mono tracking-[0.2em] uppercase focus:border-blue-500 outline-none"
                  maxLength={8}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Do'stingizdan olgan 8 xonali taklif kodini kiriting
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleJoinChallenge}
                  disabled={joinLoading || !joinCode.trim()}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joinLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      {/* Detail Modal */}
      {showDetailModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div
              className="px-6 py-5 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${selectedChallenge.color || '#6366F1'} 0%, ${selectedChallenge.color || '#6366F1'}cc 100%)` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    {selectedChallenge.icon || '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedChallenge.title}</h2>
                      {selectedChallenge.participantData?.role === 'owner' && (
                        <Crown className="w-5 h-5 text-yellow-300" />
                      )}
                    </div>
                    <p className="text-white/80 text-sm">
                      {selectedChallenge.participantData?.completedDays || 0}/{selectedChallenge.duration} kun bajarildi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDetailModal(false); setChallengeDetails(null); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Progress</span>
                  <span className="font-bold">{getProgress(selectedChallenge)}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${getProgress(selectedChallenge)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.currentStreak || 0}
                  </p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.completedDays || 0}
                  </p>
                  <p className="text-xs text-gray-500">Bajarildi</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getDaysLeft(selectedChallenge.endDate)}
                  </p>
                  <p className="text-xs text-gray-500">Qoldi</p>
                </div>
              </div>

              {/* Today's Action */}
              {selectedChallenge.status === 'active' && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📅 Bugungi vazifa ({getTodayDayNumber(selectedChallenge.startDate)}-kun):</p>
                  {getTodayStatus(selectedChallenge) === 'done' ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-lg">
                      <CheckCircle className="w-6 h-6" />
                      Bajarildi! Zo'r! 🎉
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateProgress(selectedChallenge, 'done')}
                      className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg text-lg active:scale-95"
                    >
                      <Check className="w-6 h-6" />
                      ✅ Bugun bajarildi!
                    </button>
                  )}
                </div>
              )}

              {/* Progress Calendar - Kunlik progress */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Kunlik progress</span>
                  </div>
                  <span className="text-sm text-white/80">
                    {selectedChallenge.participantData?.completedDays || 0}/{selectedChallenge.duration} kun
                  </span>
                </div>
                <div className="p-4">
                  {detailLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {Array.from({ length: selectedChallenge.duration }, (_, i) => {
                        const dayNum = i + 1;
                        const today = getTodayDayNumber(selectedChallenge.startDate);
                        const dayProgress = challengeDetails?.progress?.find(p => p.dayNumber === dayNum);
                        const status = dayProgress?.status || 'pending';
                        const isToday = dayNum === today;
                        const isPast = dayNum < today;
                        const isFuture = dayNum > today;

                        return (
                          <button
                            key={dayNum}
                            onClick={() => {
                              if (isToday && status !== 'done') {
                                handleUpdateProgress(selectedChallenge, 'done');
                              }
                            }}
                            disabled={isFuture || (isPast && status !== 'pending')}
                            className={`
                              aspect-square rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all
                              ${isToday ? 'ring-2 ring-orange-500 ring-offset-1' : ''}
                              ${status === 'done' ? 'bg-green-500 text-white' : ''}
                              ${status === 'missed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                              ${status === 'skipped' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : ''}
                              ${status === 'pending' && isPast ? 'bg-red-50 dark:bg-red-900/20 text-red-400' : ''}
                              ${status === 'pending' && isToday ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200 cursor-pointer active:scale-95' : ''}
                              ${status === 'pending' && isFuture ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : ''}
                            `}
                          >
                            <span className="text-[10px] sm:text-xs opacity-70">{dayNum}</span>
                            {status === 'done' && <span className="text-sm sm:text-base">✓</span>}
                            {status === 'missed' && <span className="text-sm sm:text-base">✗</span>}
                            {status === 'pending' && isToday && <span className="text-sm sm:text-base">!</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Bajarildi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
                      <span>O'tkazildi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-orange-100 ring-2 ring-orange-500" />
                      <span>Bugun</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                      <span>Kelasi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard - Jamoadoshlar */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Jamoadoshlar reytingi</span>
                </div>
                {detailLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Yuklanmoqda...</p>
                  </div>
                ) : challengeDetails?.leaderboard?.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {challengeDetails.leaderboard.map((participant, index) => (
                      <div
                        key={participant.user?.id || index}
                        className={`flex items-center gap-3 p-3 ${
                          participant.user?.id === user?._id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : participant.rank}
                        </div>
                        
                        {/* Avatar & Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            participant.user?.id === user?._id ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {participant.user?.name || 'Foydalanuvchi'}
                            {participant.user?.id === user?._id && ' (Siz)'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {participant.currentStreak}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {participant.completedDays}/{selectedChallenge.duration}
                            </span>
                          </div>
                        </div>
                        
                        {/* Points */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{participant.totalPoints}</p>
                          <p className="text-xs text-gray-500">ball</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Hozircha ishtirokchilar yo'q</p>
                  </div>
                )}
              </div>

              {/* Invite Code */}
              {selectedChallenge.inviteCode && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">🔗 Taklif kodi:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-lg tracking-widest text-center border border-gray-200 dark:border-gray-700">
                      {selectedChallenge.inviteCode}
                    </code>
                    <button
                      onClick={() => handleCopyInviteCode(selectedChallenge)}
                      className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Do'stlaringizga yuboring!</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2">
                {selectedChallenge.participantData?.role === 'owner' ? (
                  <button
                    onClick={() => handleDeleteChallenge(selectedChallenge._id)}
                    className="w-full py-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Challengeni o'chirish
                  </button>
                ) : (
                  <button
                    onClick={() => handleLeaveChallenge(selectedChallenge._id)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Challengedan chiqish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};

export default Challenges;
