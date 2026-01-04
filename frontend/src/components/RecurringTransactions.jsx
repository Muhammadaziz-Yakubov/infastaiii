import React, { useState, useEffect } from 'react';
import { Repeat, Calendar, DollarSign, Trash2, Edit, Plus, CheckCircle, Clock, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import CurrencyInput from './CurrencyInput';
import toast from 'react-hot-toast';
import { financeService } from '../services/financeService';

const RecurringTransactions = ({ onTransactionCreated }) => {
  const { isDark } = useTheme();
  const [recurring, setRecurring] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    category: 'Utilities',
    type: 'expense',
    frequency: 'monthly', // daily, weekly, monthly, yearly
    startDate: new Date().toISOString().split('T')[0],
    nextDate: new Date().toISOString().split('T')[0],
    description: '',
    isActive: true
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recurringTransactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecurring(parsed);
        checkAndCreateTransactions(parsed);
      } catch (error) {
        console.error('Recurring transactions yuklashda xatolik:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (recurring.length > 0) {
      localStorage.setItem('recurringTransactions', JSON.stringify(recurring));
    }
  }, [recurring]);

  // Check and create transactions
  const checkAndCreateTransactions = async (recurringList) => {
    const today = new Date().toISOString().split('T')[0];
    
    for (const item of recurringList) {
      if (!item.isActive) continue;
      
      const nextDate = new Date(item.nextDate);
      const todayDate = new Date(today);
      
      if (nextDate <= todayDate) {
        // Create transaction
        try {
          await financeService.createTransaction({
            type: item.type,
            amount: item.amount,
            category: item.category,
            description: item.description || item.name,
            date: today
          });
          
          // Update next date
          const updatedNextDate = calculateNextDate(item.nextDate, item.frequency);
          setRecurring(prev => prev.map(r => 
            r.name === item.name 
              ? { ...r, nextDate: updatedNextDate }
              : r
          ));
          
          toast.success(`✅ ${item.name} avtomatik qo'shildi`);
          if (onTransactionCreated) onTransactionCreated();
        } catch (error) {
          console.error('Transaction yaratishda xatolik:', error);
        }
      }
    }
  };

  const calculateNextDate = (currentDate, frequency) => {
    const date = new Date(currentDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || formData.amount <= 0) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    const nextDate = calculateNextDate(formData.startDate, formData.frequency);

    if (editing) {
      setRecurring(prev => prev.map(r => 
        r.name === editing.name 
          ? { ...formData, nextDate }
          : r
      ));
      toast.success('Takrorlanuvchi tranzaksiya yangilandi');
    } else {
      setRecurring(prev => [...prev, { ...formData, nextDate }]);
      toast.success('Takrorlanuvchi tranzaksiya qo\'shildi');
    }

    setShowModal(false);
    setEditing(null);
    setFormData({
      name: '',
      amount: 0,
      category: 'Utilities',
      type: 'expense',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      nextDate: new Date().toISOString().split('T')[0],
      description: '',
      isActive: true
    });
  };

  const handleDelete = (name) => {
    if (window.confirm('Bu takrorlanuvchi tranzaksiyani o\'chirmoqchimisiz?')) {
      setRecurring(prev => prev.filter(r => r.name !== name));
      toast.success('O\'chirildi');
    }
  };

  const handleToggle = (name) => {
    setRecurring(prev => prev.map(r => 
      r.name === name ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const frequencyLabels = {
    daily: 'Kunlik',
    weekly: 'Haftalik',
    monthly: 'Oylik',
    yearly: 'Yillik'
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Takrorlanuvchi Tranzaksiyalar
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Avtomatik xarajatlar va daromadlar
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Qo'shish
        </button>
      </div>

      {recurring.length === 0 ? (
        <div className="text-center py-12">
          <Repeat className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Takrorlanuvchi tranzaksiyalar yo'q
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Masalan: Internet, Kommunal, Maosh va boshqalar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((item, index) => {
            const daysUntil = Math.ceil((new Date(item.nextDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} ${
                  !item.isActive ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${item.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.category} • {frequencyLabels[item.frequency]}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.isActive 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {item.isActive ? 'Faol' : 'Nofaol'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Summa</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Keyingi sana</p>
                        <p className={`font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(item.nextDate).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                      {daysUntil >= 0 && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Qolgan</p>
                          <p className={`font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Clock className="w-3 h-3" />
                            {daysUntil} kun
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggle(item.name)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isActive
                          ? 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                          : 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                      title={item.isActive ? 'Nofaol qilish' : 'Faollashtirish'}
                    >
                      {item.isActive ? (
                        <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(item);
                        setFormData(item);
                        setShowModal(true);
                      }}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.name)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editing ? 'Tahrirlash' : 'Yangi Takrorlanuvchi Tranzaksiya'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masalan: Internet, Maosh, Kommunal"
                    className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Turi
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                    >
                      <option value="expense">Xarajat</option>
                      <option value="income">Daromad</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Takrorlanish
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                    >
                      <option value="daily">Kunlik</option>
                      <option value="weekly">Haftalik</option>
                      <option value="monthly">Oylik</option>
                      <option value="yearly">Yillik</option>
                    </select>
                  </div>
                </div>

                <CurrencyInput
                  label="Summa"
                  value={formData.amount}
                  onChange={(value) => setFormData({ ...formData, amount: value })}
                  currency="UZS"
                  placeholder="0"
                  required
                />

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Kategoriya
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                  >
                    <option value="Food">Ovqat</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Xarid</option>
                    <option value="Utilities">Kommunal</option>
                    <option value="Health">Sog'liq</option>
                    <option value="Education">Ta'lim</option>
                    <option value="Entertainment">Ko'ngilochar</option>
                    <option value="Other">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Boshlanish sanasi
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                    }}
                    className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg font-medium transition-colors`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {editing ? 'Yangilash' : 'Qo\'shish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;

