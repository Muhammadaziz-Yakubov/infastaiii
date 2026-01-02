import React, { useState, useEffect } from 'react';
import {
  DollarSign, Calendar, User, Phone, Clock, AlertCircle,
  CheckCircle, TrendingUp, TrendingDown, Plus, Edit,
  Trash2, X, Search, Filter, RefreshCw, ArrowUpRight,
  ArrowDownRight, FileText, CreditCard, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import DebtForm from './DebtForm';
import DebtStatistics from './DebtStatistics';
import { financeService } from '../../services/financeService';

const Debt = () => {
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
    sort: 'due-date'
  });

  useEffect(() => {
    loadDebts();
    loadStatistics();
  }, [filters]);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;

      const data = await financeService.getDebts();
      
      if (data.success) {
        // Apply filters on frontend since backend may not support all filters
        let filteredDebts = data.debts || [];
        
        if (filters.type !== 'all') {
          filteredDebts = filteredDebts.filter(d => d.type === filters.type);
        }
        if (filters.status !== 'all') {
          filteredDebts = filteredDebts.filter(d => d.status === filters.status);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredDebts = filteredDebts.filter(d => 
            d.personName?.toLowerCase().includes(searchLower) ||
            d.description?.toLowerCase().includes(searchLower) ||
            d.personPhone?.toLowerCase().includes(searchLower)
          );
        }
        
        setDebts(filteredDebts);
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Load debts error:', error);
      toast.error('Server bilan bog\'lanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Calculate statistics from debts data
      const data = await financeService.getDebts();
      
      if (data.success) {
        const debts = data.debts || [];
        let totalBorrowed = 0;
        let totalLent = 0;
        let activeBorrowed = 0;
        let activeLent = 0;
        let overdueBorrowed = 0;
        let overdueLent = 0;
        
        debts.forEach(debt => {
          if (debt.type === 'borrow') {
            totalBorrowed += debt.amount || 0;
            activeBorrowed += debt.remainingAmount || 0;
            if (debt.status === 'overdue') overdueBorrowed += debt.remainingAmount || 0;
          } else {
            totalLent += debt.amount || 0;
            activeLent += debt.remainingAmount || 0;
            if (debt.status === 'overdue') overdueLent += debt.remainingAmount || 0;
          }
        });
        
        setStatistics({
          success: true,
          summary: {
            totalBorrowed,
            totalLent,
            activeBorrowed,
            activeLent,
            overdueBorrowed,
            overdueLent,
            netDebt: activeLent - activeBorrowed
          }
        });
      }
    } catch (error) {
      console.error('Load statistics error:', error);
    }
  };

  const handleCreateDebt = async (debtData) => {
    try {
      const data = await financeService.createDebt(debtData);
      
      if (data.success) {
        toast.success('Qarz yaratildi ✅');
        setShowForm(false);
        loadDebts();
        loadStatistics();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Create debt error:', error);
      toast.error('Server bilan bog\'lanishda xatolik');
    }
  };

  const handleUpdateDebt = async (debtId, debtData) => {
    try {
      const data = await financeService.updateDebt(debtId, debtData);
      
      if (data.success) {
        toast.success('Qarz yangilandi ✅');
        setShowForm(false);
        setEditingDebt(null);
        loadDebts();
        loadStatistics();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Update debt error:', error);
      toast.error('Server bilan bog\'lanishda xatolik');
    }
  };

  const handleDeleteDebt = async (debtId) => {
    if (!window.confirm('Qarzni o\'chirmoqchimisiz?')) return;

    try {
      const data = await financeService.deleteDebt(debtId);
      
      if (data.success) {
        toast.success('Qarz o\'chirildi 🗑️');
        loadDebts();
        loadStatistics();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Delete debt error:', error);
      toast.error('Server bilan bog\'lanishda xatolik');
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('To\'lov summasi noto\'g\'ri');
      return;
    }

    if (parseFloat(paymentAmount) > selectedDebt.remainingAmount) {
      toast.error('To\'lov summasi qolgan miqdordan ko\'p');
      return;
    }

    try {
      const data = await financeService.addDebtPayment(selectedDebt._id, {
        amount: parseFloat(paymentAmount),
        description: 'To\'lov'
      });
      
      if (data.success) {
        toast.success('To\'lov qo\'shildi ✅');
        setShowPaymentModal(false);
        setPaymentAmount('');
        setSelectedDebt(null);
        loadDebts();
        loadStatistics();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Add payment error:', error);
      toast.error('Server bilan bog\'lanishda xatolik');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Ertaga';
    if (diffDays > 0) return `${diffDays} kun qoldi`;
    if (diffDays < 0) return `${Math.abs(diffDays)} kun kechikdi`;
    
    return date.toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (debt) => {
    if (debt.status === 'completed') return 'bg-green-100 text-green-800';
    if (debt.status === 'overdue') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (debt) => {
    if (debt.status === 'completed') return 'To\'langan';
    if (debt.status === 'overdue') return 'Kechikkan';
    return 'Faol';
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Qarzlar</h1>
              <p className="text-white/80 text-sm">Olingan va berilgan qarzlar</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingDebt(null);
              setShowForm(true);
            }}
            className="bg-white text-blue-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Yangi qarz</span>
          </button>
        </div>

        {statistics && <DebtStatistics statistics={statistics} />}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Ism, telefon yoki izoh bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="all">Barcha qarzlar</option>
              <option value="borrow">Olingan qarzlar</option>
              <option value="lend">Berilgan qarzlar</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="all">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="overdue">Kechikkan</option>
              <option value="completed">To'langan</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="due-date">Muddati yaqin</option>
              <option value="newest">Yangi</option>
              <option value="oldest">Eski</option>
              <option value="amount-high">Summa (yuqori)</option>
              <option value="amount-low">Summa (past)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Debts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Qarzlar ro'yxati ({debts.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {debts.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Qarz topilmadi
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Birinchi qarzni qo'shing
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Qarz qo'shish
                  </button>
                </div>
              ) : (
                debts.map((debt) => (
                  <div
                    key={debt._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl ${
                        debt.type === 'borrow' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {debt.type === 'borrow' ? (
                          <ArrowDownRight className="w-6 h-6" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {debt.personName}
                            </h3>
                            {debt.personPhone && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <Phone className="w-4 h-4" />
                                {debt.personPhone}
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(debt)}`}>
                            {getStatusText(debt)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Umumiy summa</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(debt.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Qolgan summa</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(debt.remainingAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Muddati</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className={`font-semibold ${
                                debt.status === 'overdue' 
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {formatDate(debt.dueDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {debt.description && (
                          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                            {debt.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          {debt.remainingAmount > 0 && debt.status !== 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedDebt(debt);
                                setPaymentAmount('');
                                setShowPaymentModal(true);
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              To'lov qilish
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingDebt(debt);
                              setShowForm(true);
                            }}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDeleteDebt(debt._id)}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
                          >
                            O'chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Upcoming Debts */}
          {statistics?.upcomingDebts?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Yaqinlashayotgan qarzlar
              </h3>
              <div className="space-y-3">
                {statistics.upcomingDebts.map((debt) => (
                  <div key={debt._id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {debt.personName}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        debt.type === 'borrow' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {debt.type === 'borrow' ? 'Olingan' : 'Berilgan'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(debt.remainingAmount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(debt.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Debts */}
          {statistics?.overdueDebts?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Kechikkan qarzlar
              </h3>
              <div className="space-y-3">
                {statistics.overdueDebts.map((debt) => (
                  <div key={debt._id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {debt.personName}
                      </p>
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                        Kechikkan
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(debt.remainingAmount)}
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {formatDate(debt.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debt Form Modal */}
      {showForm && (
        <DebtForm
          debt={editingDebt}
          onSubmit={editingDebt ? 
            (data) => handleUpdateDebt(editingDebt._id, data) : 
            handleCreateDebt
          }
          onClose={() => {
            setShowForm(false);
            setEditingDebt(null);
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedDebt(null);
                setPaymentAmount('');
              }}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl"></div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    To'lov qilish
                  </h3>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedDebt(null);
                      setPaymentAmount('');
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shaxs</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {selectedDebt.personName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Umumiy summa</p>
                      <p className="font-bold text-gray-900 dark:text-white text-xl">
                        {formatCurrency(selectedDebt.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Qolgan summa</p>
                      <p className="font-bold text-gray-900 dark:text-white text-xl">
                        {formatCurrency(selectedDebt.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      To'lov summasi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="To'lov summasi"
                        className="w-full pl-10 pr-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        required
                        step="0.01"
                        min="0.01"
                        max={selectedDebt.remainingAmount}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Maksimal: {formatCurrency(selectedDebt.remainingAmount)}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedDebt(null);
                        setPaymentAmount('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleAddPayment}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                      disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    >
                      To'lov qilish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debt;