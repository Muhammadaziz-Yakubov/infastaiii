import React, { useState } from 'react';
import {
  X, Plus, Calendar, DollarSign, CreditCard, Target,
  CheckSquare, ArrowUpRight, ArrowDownRight, User, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import { financeService } from '../services/financeService';
import { goalsService } from '../services/goalsService';
import { debtService } from '../services/debtService';
import CurrencyInput from './CurrencyInput';

const MobileModals = ({ isOpen, onClose, type, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen && type) {
      resetForm();
    }
  }, [isOpen, type]);

  const resetForm = () => {
    switch (type) {
      case 'task':
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          deadline: ''
        });
        break;
      case 'finance':
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        break;
      case 'goal':
        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '',
          deadline: '',
          description: ''
        });
        break;
      case 'debt':
        setFormData({
          type: 'borrow',
          personName: '',
          amount: '',
          description: '',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        break;
      default:
        setFormData({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      switch (type) {
        case 'task':
          result = await taskService.createTask(formData);
          break;
        case 'finance':
          result = await financeService.createTransaction({
            ...formData,
            amount: parseFloat(formData.amount)
          });
          break;
        case 'goal':
          result = await goalsService.createGoal({
            ...formData,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: parseFloat(formData.currentAmount) || 0
          });
          break;
        case 'debt':
          result = await debtService.createDebt({
            ...formData,
            amount: parseFloat(formData.amount)
          });
          break;
      }

      if (result.success) {
        toast.success(`${getTypeName()} muvaffaqiyatli qo'shildi!`);
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'task': return 'Vazifa';
      case 'finance': return 'Tranzaksiya';
      case 'goal': return 'Maqsad';
      case 'debt': return 'Qarz';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'finance': return DollarSign;
      case 'goal': return Target;
      case 'debt': return CreditCard;
      default: return Plus;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'task': return 'Yangi vazifa';
      case 'finance': return 'Tranzaksiya qo\'shish';
      case 'goal': return 'Yangi maqsad';
      case 'debt': return 'Qarz qo\'shish';
      default: return '';
    }
  };

  const renderForm = () => {
    const Icon = getIcon();

    switch (type) {
      case 'task':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vazifa nomi *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Vazifa nomini kiriting"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                rows={3}
                placeholder="Vazifa haqida..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muhimlik
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="low">Past</option>
                  <option value="medium">O'rta</option>
                  <option value="high">Yuqori</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muddat
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </form>
        );

      case 'finance':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tur *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income', category: ''})}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ArrowDownRight className="w-5 h-5 inline mr-1" />
                  Kirim
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense', category: ''})}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 inline mr-1" />
                  Chiqim
                </button>
              </div>
            </div>

            <CurrencyInput
              label="Summa *"
              value={formData.amount}
              onChange={(value) => setFormData({...formData, amount: value})}
              currency="UZS"
              placeholder="0"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategoriya *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">Tanlang...</option>
                {formData.type === 'income' ? (
                  <>
                    <option value="Maosh">Maosh</option>
                    <option value="Biznes">Biznes</option>
                    <option value="Investitsiya">Investitsiya</option>
                    <option value="Bonus">Bonus</option>
                  </>
                ) : (
                  <>
                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                    <option value="Transport">Transport</option>
                    <option value="Uy">Uy</option>
                    <option value="Kiyim">Kiyim</option>
                    <option value="Sog'liq">Sog'liq</option>
                    <option value="Ko'ngilochar">Ko'ngilochar</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tavsif
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
          </form>
        );

      case 'goal':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maqsad nomi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Masalan: MacBook olish"
                required
              />
            </div>

            <CurrencyInput
              label="Maqsad summasi *"
              value={formData.targetAmount}
              onChange={(value) => setFormData({...formData, targetAmount: value})}
              currency="UZS"
              placeholder="0"
              required
            />

            <CurrencyInput
              label="Boshlang'ich summa"
              value={formData.currentAmount}
              onChange={(value) => setFormData({...formData, currentAmount: value})}
              currency="UZS"
              placeholder="0"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Muddat *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                rows={3}
                placeholder="Maqsad haqida..."
              />
            </div>
          </form>
        );

      case 'debt':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qarz turi *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'borrow'})}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.type === 'borrow'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ArrowDownRight className="w-5 h-5 inline mr-1" />
                  Qarz oldim
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'lend'})}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.type === 'lend'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 inline mr-1" />
                  Qarz berdim
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.type === 'borrow' ? 'Kimdan oldingiz?' : 'Kimga berdingiz?'} *
              </label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => setFormData({...formData, personName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ism familiya"
                required
              />
            </div>

            <CurrencyInput
              label="Summa *"
              value={formData.amount}
              onChange={(value) => setFormData({...formData, amount: value})}
              currency="UZS"
              placeholder="0"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qaytarish muddati *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto md:hidden">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {getTitle()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ma'lumotlarni to'ldiring
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {renderForm()}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Qo'shish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileModals;

