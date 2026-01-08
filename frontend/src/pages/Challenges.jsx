import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Plus, Users, Calendar, Target, Flame,
  Clock, CheckCircle, X, Copy, Share2, Crown,
  Search, Trash2, LogOut, Check, RefreshCw, ChevronRight,
  MoreVertical
} from 'lucide-react';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  { id: 'programming', name: 'Dasturlash', emoji: '💻', color: '#3B82F6' },
  { id: 'custom', name: 'Boshqa', emoji: '🎯', color: '#6366F1' }
];



const Challenges = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [progressPage, setProgressPage] = useState(0); // For pagination
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionReason, setCompletionReason] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

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

    // Set progress page to today's page
    const today = getTodayDayNumber(challenge.startDate);
    const DAYS_PER_PAGE = 28;
    const todayPage = Math.floor((today - 1) / DAYS_PER_PAGE);
    setProgressPage(todayPage);
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

  const openEditModal = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description || '',
      category: challenge.category,
      duration: challenge.duration,
      dailyGoal: challenge.dailyGoal?.value || 1,
      unit: challenge.dailyGoal?.unit || 'times',
      maxParticipants: challenge.maxParticipants || 10,
      startDate: challenge.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleEditChallenge = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Challenge nomini kiriting');
      return;
    }
    try {
      setCreateLoading(true);
      await challengeService.updateChallenge(editingChallenge._id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        dailyGoal: {
          value: formData.dailyGoal,
          unit: formData.unit
        }
      });
      toast.success('Challenge yangilandi! ✅');
      setShowEditModal(false);
      setEditingChallenge(null);
      resetForm();
      loadChallenges();
    } catch (error) {
      console.error('Edit challenge error:', error);
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setCreateLoading(false);
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

  const handleCompleteChallenge = async () => {
    try {
      setCompleteLoading(true);
      await challengeService.completeChallenge(selectedChallenge._id, completionReason);
      toast.success('Challenge tugatildi! 🎉');
      setShowCompleteModal(false);
      setShowDetailModal(false);
      setCompletionReason('');
      setActiveMenu(null);
      setActiveTab('completed'); // Switch to completed tab
      loadChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setCompleteLoading(false);
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
    // Cap progress at 100% for display, but allow completion beyond duration
    const progress = (challenge.participantData.completedDays / challenge.duration) * 100;
    return Math.min(Math.round(progress), 100);
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getCategory = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7];

  const getTodayStatus = (challenge) => {
    if (!challenge.progress || challenge.progress.length === 0) {
      return 'pending';
    }
    const today = getTodayDayNumber(challenge.startDate);
    const todayProgress = challenge.progress.find(p => p.dayNumber === today);
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Challengelar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-24 sm:pb-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section - Goals sahifasiga o'xshash */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 lg:p-10 text-white shadow-xl">
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
              className="flex items-center justify-center gap-2 bg-white text-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-white/90 transition-all text-sm sm:text-base lg:text-lg shadow-lg"
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
              <Trophy className="w-5 h-5 text-white/80" />
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
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
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
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="bg-blue-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl hover:bg-blue-600 transition-colors inline-flex items-center justify-center gap-2 text-base lg:text-lg font-semibold shadow-lg"
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
                            <Search className="w-4 h-4" />
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
                          {isOwner && (
                            <button
                              onClick={() => openEditModal(challenge)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Tahrirlash
                            </button>
                          )}
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
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
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
                    <div className={`text-center p-2 rounded-lg ${daysLeft === 0 && challenge.status === 'active'
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}>
                      <div className={`flex items-center justify-center gap-1 ${daysLeft === 0 && challenge.status === 'active'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-blue-600 dark:text-blue-400'
                        }`}>
                        {daysLeft === 0 && challenge.status === 'active' ? (
                          <>
                            <span className="font-bold text-lg">∞</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            <span className="font-bold">{daysLeft}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {daysLeft === 0 && challenge.status === 'active' ? 'Davom' : 'Qoldi'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Info */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getTodayDayNumber(challenge.startDate) > challenge.duration
                          ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                          : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                          }`}>
                          {getTodayDayNumber(challenge.startDate)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Hozirgi kun</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {getTodayDayNumber(challenge.startDate) > challenge.duration ? (
                              <>
                                <span className="text-purple-600 dark:text-purple-400">Davom etmoqda!</span>
                                <span className="text-xs ml-1">({challenge.duration} kundan oshdi)</span>
                              </>
                            ) : (
                              `${challenge.duration} kundan ${getTodayDayNumber(challenge.startDate)}-kuni`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bajarildi</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {challenge.participantData?.completedDays || 0} kun
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {challenge.status === 'active' && (
                      <>
                        {/* Check if all days completed */}
                        {challenge.participantData?.completedDays >= challenge.duration ? (
                          <button
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setShowCompleteModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md active:scale-[0.98]"
                          >
                            <Trophy className="w-5 h-5" />
                            Tugatish
                          </button>
                        ) : todayStatus === 'done' ? (
                          <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium">
                            <CheckCircle className="w-5 h-5" />
                            Bajarildi ✅
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateProgress(challenge, 'done')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md active:scale-[0.98]"
                          >
                            <Check className="w-5 h-5" />
                            Bajardim
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => openDetailModal(challenge)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-[0.98]"
                    >
                      <Search className="w-4 h-4" />
                      Batafsil
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
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
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
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Challenge nomi *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: 30 kunlik sport challenge"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Target className="w-4 h-4 inline mr-2" />
                  Kategoriya
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 hover:scale-105 transform ${formData.category === cat.id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>


              {/* Duration - Custom Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Challenge davomiyligi
                </label>

                {/* Main Duration Input */}
                <div className="relative mb-3">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.duration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setFormData({ ...formData, duration: Math.min(Math.max(value, 1), 1000) });
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-bold text-3xl text-blue-600 dark:text-blue-400 transition-all"
                    placeholder="30"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500 text-base font-semibold">
                    kun
                  </div>
                </div>

                {/* Info Text */}
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                    💡 Challenge tugagandan keyin avtomatik davom etadi
                  </p>
                </div>

                {/* Range Info */}
                <div className="mb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Min: 1 kun
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Max: 1000 kun
                  </span>
                </div>

                {/* Quick Select Buttons */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 px-1">Tez tanlash:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[7, 14, 30, 60, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration: days })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${formData.duration === days
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 365, 1000].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration: days })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${formData.duration === days
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {days === 365 ? '1 yil' : days === 1000 ? 'Max' : days}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Challenge haqida qisqacha ma'lumot..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Daily Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Kunlik maqsad
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={formData.dailyGoal}
                      onChange={(e) => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-200 dark:border-green-800 rounded-xl text-center font-bold text-xl text-green-600 dark:text-green-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Birlik
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="times">⚡ Marta</option>
                    <option value="minutes">⏱️ Daqiqa</option>
                    <option value="pages">📖 Sahifa</option>
                    <option value="liters">💧 Litr</option>
                    <option value="steps">👣 Qadam</option>
                    <option value="custom">🎯 Boshqa</option>
                  </select>
                </div>
              </div>

              {/* Max Participants */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Maksimal qatnashuvchilar
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="flex-1 h-3 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-full appearance-none cursor-pointer accent-blue-500"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((formData.maxParticipants - 2) / 48) * 100}%, #E5E7EB ${((formData.maxParticipants - 2) / 48) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="min-w-[80px] px-4 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-center shadow-lg">
                    <span className="font-bold text-white text-lg">{formData.maxParticipants}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span>👥 2 kishi</span>
                  <span>👥👥👥 50 kishi</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {createLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      Challenge Yaratish
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

      {/* Edit Challenge Modal */}
      {showEditModal && editingChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Challengeni tahrirlash</h2>
                    <p className="text-white/80 text-sm">Ma'lumotlarni yangilash</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowEditModal(false); setEditingChallenge(null); resetForm(); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditChallenge} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Challenge nomi
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Kategoriya
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${formData.category === cat.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Challenge davomiyligi
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.duration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setFormData({ ...formData, duration: Math.min(Math.max(value, 1), 1000) });
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-xl text-blue-600 dark:text-blue-400"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500 text-sm font-semibold">
                    kun
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  1-1000 kun oralig'ida
                </p>
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

              {/* Max Participants */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Maksimal qatnashuvchilar
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="w-16 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                    <span className="font-bold text-blue-600">{formData.maxParticipants}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingChallenge(null); resetForm(); }}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
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
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Flame className="w-6 h-6 text-blue-500 mx-auto mb-2" />
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
                  {/* Check if all days completed */}
                  {selectedChallenge.participantData?.completedDays >= selectedChallenge.duration ? (
                    <>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">🎉 Barcha kunlar bajarildi!</p>
                      <button
                        onClick={() => setShowCompleteModal(true)}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg text-lg active:scale-95"
                      >
                        <Trophy className="w-6 h-6" />
                        Challengeni Tugatish
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
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
                    <>
                      {/* Progress Grid with Pagination */}
                      {(() => {
                        const today = getTodayDayNumber(selectedChallenge.startDate);
                        const totalDays = Math.max(selectedChallenge.duration, today);
                        const DAYS_PER_PAGE = 28; // 4 weeks
                        const totalPages = Math.ceil(totalDays / DAYS_PER_PAGE);
                        const currentPage = progressPage;
                        const startDay = currentPage * DAYS_PER_PAGE + 1;
                        const endDay = Math.min((currentPage + 1) * DAYS_PER_PAGE, totalDays);

                        return (
                          <>
                            {/* Pagination Controls - Top */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                <button
                                  onClick={() => setProgressPage(Math.max(0, currentPage - 1))}
                                  disabled={currentPage === 0}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  <ChevronRight className="w-4 h-4 rotate-180" />
                                  Oldingi
                                </button>

                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {startDay}-{endDay} kunlar
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {currentPage + 1} / {totalPages} sahifa
                                  </p>
                                </div>

                                <button
                                  onClick={() => setProgressPage(Math.min(totalPages - 1, currentPage + 1))}
                                  disabled={currentPage === totalPages - 1}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  Keyingi
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                              {Array.from({ length: endDay - startDay + 1 }, (_, i) => {
                                const dayNum = startDay + i;
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
                                    title={`Kun ${dayNum}${isToday ? ' (Bugun)' : ''} - ${status === 'done' ? 'Bajarildi ✓' :
                                      status === 'missed' ? 'O\'tkazildi ✗' :
                                        status === 'pending' && isToday ? 'Bajaring!' :
                                          status === 'pending' && isFuture ? 'Kelasi' : 'Kutilmoqda'
                                      }`}
                                    className={`
                                      aspect-square rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all
                                      ${isToday ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : ''}
                                      ${status === 'done' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md' : ''}
                                      ${status === 'missed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                                      ${status === 'skipped' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : ''}
                                      ${status === 'pending' && isPast ? 'bg-red-50 dark:bg-red-900/20 text-red-400' : ''}
                                      ${status === 'pending' && isToday ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:to-indigo-200 cursor-pointer active:scale-95 animate-pulse' : ''}
                                      ${status === 'pending' && isFuture ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : ''}
                                    `}
                                  >
                                    <span className="text-[10px] sm:text-xs font-bold">{dayNum}</span>
                                    {status === 'done' && <span className="text-sm sm:text-base">✓</span>}
                                    {status === 'missed' && <span className="text-sm sm:text-base">✗</span>}
                                    {status === 'pending' && isToday && <span className="text-sm sm:text-base">!</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Quick Jump to Today */}
                            {totalPages > 1 && !Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i).includes(today) && (
                              <div className="mt-3 text-center">
                                <button
                                  onClick={() => setProgressPage(Math.floor((today - 1) / DAYS_PER_PAGE))}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                >
                                  <Target className="w-4 h-4" />
                                  Bugungi kunga o'tish ({today}-kun)
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-emerald-600" />
                      <span>Bajarildi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
                      <span>O'tkazildi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-100 ring-2 ring-blue-500" />
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
                        className={`flex items-center gap-3 p-3 ${participant.user?.id === user?._id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                          }`}
                      >
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-orange-400 text-orange-900' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : participant.rank}
                        </div>

                        {/* Avatar & Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${participant.user?.id === user?._id ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'
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

      {/* Complete Challenge Modal */}
      {showCompleteModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Challengeni Tugatish</h2>
                    <p className="text-white/80 text-sm">{selectedChallenge.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCompleteModal(false); setCompletionReason(''); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Challenge tugatilgandan keyin uni qayta boshlay olmaysiz. Barcha ma'lumotlar saqlanadi.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.completedDays || 0}
                  </p>
                  <p className="text-xs text-gray-500">Bajarilgan kunlar</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.participantData?.totalPoints || 0}
                  </p>
                  <p className="text-xs text-gray-500">Jami ball</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tugatish sababi (ixtiyoriy)
                </label>
                <textarea
                  value={completionReason}
                  onChange={(e) => setCompletionReason(e.target.value)}
                  placeholder="Masalan: Maqsadimga erishdim, yangi challengega o'tmoqchiman..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-green-500 outline-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {completionReason.length}/500
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => { setShowCompleteModal(false); setCompletionReason(''); }}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleCompleteChallenge}
                  disabled={completeLoading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {completeLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Tugatilmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Tugatish
                    </>
                  )}
                </button>
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
