import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import CurrencyInput from './CurrencyInput';

const BudgetPlanner = ({ transactions = [], onBudgetSet }) => {
  const { isDark } = useTheme();
  const [budgets, setBudgets] = useState({});
  const [showPlanner, setShowPlanner] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Load budgets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('budgets');
    if (saved) {
      try {
        setBudgets(JSON.parse(saved));
      } catch (error) {
        console.error('Budget yuklashda xatolik:', error);
      }
    }
  }, []);

  // Save budgets to localStorage
  useEffect(() => {
    if (Object.keys(budgets).length > 0) {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  // Calculate current month expenses by category
  const currentMonthExpenses = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const selectedDate = new Date(selectedMonth + '-01');
      return (
        t.type === 'expense' &&
        transactionDate.getMonth() === selectedDate.getMonth() &&
        transactionDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

  const monthKey = selectedMonth;
  const monthBudgets = budgets[monthKey] || {};

  // Calculate budget status
  const getBudgetStatus = (category) => {
    const budget = monthBudgets[category] || 0;
    const spent = currentMonthExpenses[category] || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    if (percentage === 0) return { status: 'good', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (percentage < 50) return { status: 'good', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (percentage < 80) return { status: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (percentage < 100) return { status: 'danger', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    return { status: 'exceeded', color: 'text-red-500', bg: 'bg-red-500/20' };
  };

  const categories = [
    'Food', 'Transport', 'Shopping', 'Utilities', 'Health',
    'Education', 'Entertainment', 'Other'
  ];

  const handleBudgetChange = (category, amount) => {
    setBudgets(prev => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        [category]: amount
      }
    }));
    if (onBudgetSet) onBudgetSet(monthKey, category, amount);
  };

  const totalBudget = Object.values(monthBudgets).reduce((sum, val) => sum + (val || 0), 0);
  const totalSpent = Object.values(currentMonthExpenses).reduce((sum, val) => sum + val, 0);
  const remaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Byudjet Rejalashtirish
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Oylik xarajatlarni nazorat qiling
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showPlanner
              ? 'bg-blue-500 text-white'
              : `${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200 dark:hover:bg-gray-600`
          }`}
        >
          {showPlanner ? 'Yopish' : 'Sozlash'}
        </button>
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Oy tanlang
        </label>
        <div className="relative">
          <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
          />
        </div>
      </div>

      {/* Overall Budget Summary */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm opacity-90">Umumiy Byudjet</span>
          <span className="text-2xl font-bold">{formatCurrency(totalBudget)}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Sarflangan</span>
          <span className="text-xl font-semibold">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              budgetPercentage > 100 ? 'bg-red-400' :
              budgetPercentage > 80 ? 'bg-yellow-400' :
              'bg-green-400'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-90">Qolgan</span>
          <span className={`text-lg font-semibold ${remaining < 0 ? 'text-red-200' : 'text-green-200'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Budget by Category */}
      {showPlanner && (
        <div className="space-y-4 mb-6">
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Kategoriyalar bo'yicha byudjet
          </h4>
          {categories.map((category) => {
            const budget = monthBudgets[category] || 0;
            const spent = currentMonthExpenses[category] || 0;
            const status = getBudgetStatus(category);
            
            return (
              <div key={category} className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {category}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    {spent > 0 && budget > 0 ? `${Math.round((spent / budget) * 100)}%` : '0%'}
                  </div>
                </div>
                
                <CurrencyInput
                  label=""
                  value={budget}
                  onChange={(value) => handleBudgetChange(category, value)}
                  currency="UZS"
                  placeholder="0"
                />
                
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Sarflangan: {formatCurrency(spent)}
                  </span>
                  {budget > 0 && (
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Qolgan: {formatCurrency(budget - spent)}
                    </span>
                  )}
                </div>
                
                {budget > 0 && (
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        status.status === 'exceeded' ? 'bg-red-500' :
                        status.status === 'danger' ? 'bg-orange-500' :
                        status.status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-green-50'} border ${isDark ? 'border-gray-600' : 'border-green-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tejash
            </span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {remaining > 0 ? formatCurrency(remaining) : '0'}
          </p>
        </div>
        
        <div className={`p-4 rounded-xl ${budgetPercentage > 100 ? (isDark ? 'bg-red-900/30' : 'bg-red-50') : (isDark ? 'bg-gray-700/50' : 'bg-blue-50')} border ${budgetPercentage > 100 ? (isDark ? 'border-red-800' : 'border-red-200') : (isDark ? 'border-gray-600' : 'border-blue-200')}`}>
          <div className="flex items-center gap-2 mb-2">
            {budgetPercentage > 100 ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            )}
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Holat
            </span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {budgetPercentage > 100 ? 'Oshib ketdi' : 'Yaxshi'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;

