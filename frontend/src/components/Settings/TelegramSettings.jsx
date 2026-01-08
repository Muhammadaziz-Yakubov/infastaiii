import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Link2, 
  Unlink, 
  Bell, 
  BellOff,
  Copy, 
  Check, 
  ExternalLink,
  RefreshCw,
  Send,
  Wallet,
  CheckSquare,
  Target,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { infastAIService } from '../../services/infastAIService';

const TelegramSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState(null);
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [notifications, setNotifications] = useState({
    enabled: true,
    debts: true,
    tasks: true,
    goals: true,
    dailyReport: false
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await infastAIService.getStatus();
      if (response.success) {
        setStatus(response.data);
        setNotifications(response.data.notifications || {
          enabled: true,
          debts: true,
          tasks: true,
          goals: true,
          dailyReport: false
        });
      }
    } catch (error) {
      console.error('Load status error:', error);
      toast.error('Holatni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const response = await infastAIService.generateLinkCode();
      if (response.success) {
        const code = response.data.code;
        setLinkCode(code);
        setCodeExpiry(new Date(response.data.expiresAt));
        // Avtomatik Telegram'ni ochish
        window.open(`https://t.me/InFastAI_bot?start=link_${code}`, '_blank');
        toast.success('Telegram ochildi!');
      }
    } catch (error) {
      console.error('Generate code error:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const copyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(`/link ${linkCode}`);
      setCopied(true);
      toast.success('Kod nusxalandi!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Telegram ulanishni uzmoqchimisiz?')) return;
    
    try {
      setUnlinking(true);
      const response = await infastAIService.unlink();
      if (response.success) {
        setStatus({ ...status, isLinked: false });
        setLinkCode(null);
        toast.success('Telegram uzildi');
      }
    } catch (error) {
      console.error('Unlink error:', error);
      toast.error('Uzishda xatolik');
    } finally {
      setUnlinking(false);
    }
  };

  const handleNotificationToggle = async (field) => {
    const newSettings = { ...notifications, [field]: !notifications[field] };
    setNotifications(newSettings);

    try {
      await infastAIService.updateNotifications(newSettings);
      toast.success('Sozlama saqlandi');
    } catch (error) {
      console.error('Update notifications error:', error);
      setNotifications(notifications); // Revert
      toast.error('Saqlashda xatolik');
    }
  };

  const sendTestNotification = async () => {
    try {
      setSendingTest(true);
      const response = await infastAIService.sendTestNotification();
      if (response.success) {
        toast.success('Test xabari yuborildi!');
      } else {
        toast.error(response.message || 'Xabar yuborilmadi');
      }
    } catch (error) {
      console.error('Send test error:', error);
      toast.error('Test xabarini yuborishda xatolik');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl lg:rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
            InFast AI Bot
          </h3>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
            Telegram orqali eslatmalar olish
          </p>
        </div>
        {status?.isLinked && (
          <span className="ml-auto px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
            Ulangan
          </span>
        )}
      </div>

      {/* Linked State */}
      {status?.isLinked ? (
        <div className="space-y-4">
          {/* Connected Info */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  {status.telegramFirstName || status.telegramUsername || 'Telegram'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {status.telegramUsername ? `@${status.telegramUsername}` : 'Ulangan'}
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Eslatma sozlamalari
            </h4>

            {/* Master Toggle */}
            <div 
              onClick={() => handleNotificationToggle('enabled')}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                notifications.enabled 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                {notifications.enabled ? (
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  Barcha eslatmalar
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${
                notifications.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                  notifications.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </div>

            {notifications.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Debts */}
                <div 
                  onClick={() => handleNotificationToggle('debts')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    notifications.debts 
                      ? 'bg-red-50 dark:bg-red-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <Wallet className={`w-5 h-5 ${notifications.debts ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Qarzlar</p>
                    <p className="text-xs text-gray-500">10, 7, 3, 1 kun oldin</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    notifications.debts 
                      ? 'bg-red-500 border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {notifications.debts && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Tasks */}
                <div 
                  onClick={() => handleNotificationToggle('tasks')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    notifications.tasks 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <CheckSquare className={`w-5 h-5 ${notifications.tasks ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Tasklar</p>
                    <p className="text-xs text-gray-500">3, 1 kun va 3 soat oldin</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    notifications.tasks 
                      ? 'bg-yellow-500 border-yellow-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {notifications.tasks && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Goals */}
                <div 
                  onClick={() => handleNotificationToggle('goals')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    notifications.goals 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <Target className={`w-5 h-5 ${notifications.goals ? 'text-green-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Maqsadlar</p>
                    <p className="text-xs text-gray-500">7, 5, 3, 1 kun oldin</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    notifications.goals 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {notifications.goals && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Daily Report */}
                <div 
                  onClick={() => handleNotificationToggle('dailyReport')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    notifications.dailyReport 
                      ? 'bg-purple-50 dark:bg-purple-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${notifications.dailyReport ? 'text-purple-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Kunlik hisobot</p>
                    <p className="text-xs text-gray-500">Har kuni ertalab</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    notifications.dailyReport 
                      ? 'bg-purple-500 border-purple-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {notifications.dailyReport && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={sendTestNotification}
              disabled={sendingTest}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {sendingTest ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Test xabari
            </button>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {unlinking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Unlink className="w-4 h-4" />
              )}
              Uzish
            </button>
          </div>
        </div>
      ) : (
        /* Not Linked State */
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Telegram orqali statistikalarni ko'ring va eslatmalar oling
          </p>

          <button
            onClick={generateCode}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Telegram bilan ulash
            <ExternalLink className="w-4 h-4" />
          </button>

          {linkCode && (
            <button
              onClick={loadStatus}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Ulanishni tekshirish
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TelegramSettings;
