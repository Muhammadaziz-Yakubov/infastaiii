import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Zap, DollarSign, Target, CheckSquare,
  Calendar, Clock, Plus, X, TrendingUp,
  TrendingDown, AlertCircle, Sparkles, Wallet,
  ArrowRight, Send, Loader2, Mic, MicOff,
  Lightbulb, Star, Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';
import { financeService } from '../../services/financeService';
import { goalsService } from '../../services/goalsService';
import { useTheme } from '../../contexts/ThemeContext';

const SmartQuickAdd = ({ onAddTask, onAddFinance, onAddGoal, existingGoals = [] }) => {
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Uzbek tilidagi keyword mapping
  const keywordMaps = {
    finance: {
      expense: ['sarfladim', 'xarid qildim', 'ovqatlandim', 'taksi', 'benzin', 'kiyim', 'telefon', 'internet', 'kommunal', 'kafe', 'restoran', 'transport', 'shifokor', 'dori', 'sotib oldim'],
      income: ['oldim', 'daromad', 'maosh', 'havola', 'pul keldi', 'tushdi', 'qarz qaytarildi'],
      keywords: ['ming', 'so\'m', 'k', 'mln', 'million', 'rubl', 'dollar', 'yevro']
    },
    goal: {
      create: ['yangi maqsad', 'yangi g\'oya', 'orzu qildim', 'rejalashtirdim', 'istak', 'yangi'],
      update: ['maqsadimga', 'uchun', 'qo\'shdim', 'tejam qildim', 'yig\'dim', 'ortirdim'],
      keywords: ['maqsad', 'g\'oya', 'orzu', 'istak', 'reja', 'muddat', 'deadline']
    },
    task: {
      create: ['vazifa', 'ish', 'topshiriq', 'bajarish', 'qilish kerak', 'tayyorlash', 'rejalashtirish'],
      keywords: ['bugun', 'ertaga', 'hafta', 'oy', 'yil', 'soat', 'kun']
    }
  };

  // Category mapping
  const categoryMap = {
    'taksi': 'Transport',
    'taxi': 'Transport',
    'benzin': 'Transport',
    'yoqilg\'i': 'Transport',
    'avtobus': 'Transport',
    'metro': 'Transport',
    'ovqat': 'Food',
    'osh': 'Food',
    'lag\'mon': 'Food',
    'kafe': 'Food',
    'restoran': 'Food',
    'kiyim': 'Shopping',
    'ko\'ylak': 'Shopping',
    'shim': 'Shopping',
    'oyoq kiyim': 'Shopping',
    'telefon': 'Electronics',
    'kompyuter': 'Electronics',
    'noutbuk': 'Electronics',
    'internet': 'Utilities',
    'kommunal': 'Utilities',
    'svet': 'Utilities',
    'gaz': 'Utilities',
    'shifokor': 'Health',
    'dori': 'Health',
    'vitamin': 'Health',
    'ta\'lim': 'Education',
    'kitob': 'Education',
    'kurs': 'Education',
    'sayr': 'Entertainment',
    'kino': 'Entertainment',
    'teatr': 'Entertainment'
  };

  const priorityKeywords = {
    'high': ['muhim', 'zarur', 'shoshilinch', 'tez', 'bugun', 'darhol'],
    'medium': ['odatiy', 'hafta', 'keyin', 'ortga'],
    'low': ['vaqt bor', 'keyinroq', 'shart emas', 'ixtiyoriy']
  };

  // Smart parser function
  const parseInput = (text) => {
    if (!text.trim()) return null;

    const lowerText = text.toLowerCase().trim();
    let result = {
      type: 'unknown',
      confidence: 0,
      data: {},
      raw: text
    };

    // 1️⃣ Extract amount (Uzbek format)
    const amountMatch = lowerText.match(/(\d+[,.]?\d*)\s?(ming|k|mln|million|so\'m|rubl|dollar|yevro)?/i);
    let amount = 0;

    if (amountMatch) {
      const number = parseFloat(amountMatch[1].replace(',', '.'));
      const unit = amountMatch[2]?.toLowerCase();

      if (unit === 'ming' || unit === 'k') {
        amount = number * 1000;
      } else if (unit === 'mln' || unit === 'million') {
        amount = number * 1000000;
      } else {
        amount = number;
      }

      result.data.amount = Math.round(amount);
    }

    // 2️⃣ Extract date (Uzbek format)
    const today = new Date();
    let date = null;

    if (lowerText.includes('bugun') || lowerText.includes('hozir')) {
      date = today.toISOString().split('T')[0];
    } else if (lowerText.includes('ertaga')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    } else if (lowerText.includes('hafta')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      date = nextWeek.toISOString().split('T')[0];
    } else {
      const monthMap = {
        'yanvar': 0, 'fevral': 1, 'mart': 2, 'aprel': 3,
        'may': 4, 'iyun': 5, 'iyul': 6, 'avgust': 7,
        'sentyabr': 8, 'oktyabr': 9, 'noyabr': 10, 'dekabr': 11
      };

      for (const [monthName, monthIndex] of Object.entries(monthMap)) {
        if (lowerText.includes(monthName)) {
          const yearMatch = lowerText.match(/(\d{4})\s?yil/i);
          const year = yearMatch ? parseInt(yearMatch[1]) : today.getFullYear();
          date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
          break;
        }
      }
    }

    if (date) {
      result.data.date = date;
    }

    // 3️⃣ Detect type based on keywords
    const financeKeywords = [...keywordMaps.finance.expense, ...keywordMaps.finance.income, ...keywordMaps.finance.keywords];
    const goalKeywords = [...keywordMaps.goal.create, ...keywordMaps.goal.update, ...keywordMaps.goal.keywords];
    const taskKeywords = [...keywordMaps.task.create, ...keywordMaps.task.keywords];

    let financeScore = financeKeywords.filter(keyword => lowerText.includes(keyword)).length;
    let goalScore = goalKeywords.filter(keyword => lowerText.includes(keyword)).length;
    let taskScore = taskKeywords.filter(keyword => lowerText.includes(keyword)).length;

    // 4️⃣ Determine category
    let detectedCategory = 'Other';
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerText.includes(keyword)) {
        detectedCategory = category;
        break;
      }
    }

    // 5️⃣ Determine priority
    let priority = 'medium';
    for (const [prioLevel, keywords] of Object.entries(priorityKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        priority = prioLevel;
        break;
      }
    }

    // 6️⃣ Determine type with confidence
    if (goalScore > financeScore && goalScore > taskScore) {
      result.type = 'goal';
      result.confidence = Math.min(goalScore * 25, 100);

      if (keywordMaps.goal.create.some(keyword => lowerText.includes(keyword))) {
        result.subtype = 'create';
        const goalTitleMatch = text.match(/maqsad\s+(.+?)(?=\s+(uchun|muddati|\d|$))/i) ||
          text.match(/(.+?)\s+(uchun|muddati)/i);
        if (goalTitleMatch) {
          result.data.title = goalTitleMatch[1].trim();
        }
        if (!result.data.date) {
          const deadlineMatch = lowerText.match(/muddati\s+(.+?)(?=\s|$)/i);
          if (deadlineMatch) {
            result.data.deadline = deadlineMatch[1];
          }
        }
      } else {
        result.subtype = 'update';
        const existingGoal = existingGoals.find(goal =>
          lowerText.includes(goal.name.toLowerCase())
        );
        if (existingGoal) {
          result.data.goalId = existingGoal._id;
          result.data.goalName = existingGoal.name;
        }
      }
    } else if (financeScore > goalScore && financeScore > taskScore) {
      result.type = 'finance';
      result.confidence = Math.min(financeScore * 25, 100);

      if (keywordMaps.finance.expense.some(keyword => lowerText.includes(keyword))) {
        result.subtype = 'expense';
        result.data.category = detectedCategory;
      } else if (keywordMaps.finance.income.some(keyword => lowerText.includes(keyword))) {
        result.subtype = 'income';
        result.data.category = 'Income';
      } else {
        result.subtype = 'expense';
        result.data.category = detectedCategory;
      }

      if (!result.data.date && result.data.amount) {
        result.data.date = today.toISOString().split('T')[0];
      }
    } else if (taskScore > 0 || (financeScore === 0 && goalScore === 0)) {
      result.type = 'task';
      result.confidence = Math.min(taskScore * 25, 100);
      result.subtype = 'create';

      const words = text.split(' ');
      if (words.length > 2) {
        result.data.title = words.slice(0, 3).join(' ');
      } else {
        result.data.title = text;
      }

      result.data.priority = priority;
      result.data.status = 'pending';

      if (result.data.date) {
        result.data.deadline = result.data.date;
      }
    }

    if (detectedCategory !== 'Other' && !result.data.category) {
      result.data.category = detectedCategory;
    }

    return result;
  };

  // Generate suggestions based on input
  const generateSuggestions = (text) => {
    if (!text.trim()) return [];

    const lowerText = text.toLowerCase();
    const suggestionsList = [];

    if (lowerText.includes('ming') || lowerText.includes('mln') || /\d/.test(lowerText)) {
      suggestionsList.push({
        type: 'finance',
        text: `${text} - Moliya tranzaksiyasi sifatida qo'shish`,
        action: () => handleAddFinance(text)
      });
    }

    if (lowerText.includes('maqsad') || lowerText.includes('orzu')) {
      suggestionsList.push({
        type: 'goal',
        text: `${text} - Yangi maqsad sifatida yaratish`,
        action: () => handleAddGoal(text)
      });
    }

    if (lowerText.includes('vazifa') || lowerText.includes('ish') || lowerText.includes('bajar')) {
      suggestionsList.push({
        type: 'task',
        text: `${text} - Vazifa sifatida yaratish`,
        action: () => handleAddTask(text)
      });
    }

    if (suggestionsList.length === 0) {
      suggestionsList.push(
        {
          type: 'task',
          text: `"${text}" vazifasi sifatida qo'shish`,
          action: () => handleAddTask(text)
        },
        {
          type: 'finance',
          text: `"${text}" xarajati sifatida qo'shish`,
          action: () => handleAddFinance(text)
        }
      );
    }

    return suggestionsList.slice(0, 3);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim().length > 2) {
      const parsed = parseInput(value);
      setParsedResult(parsed);
      const suggestions = generateSuggestions(value);
      setSuggestions(suggestions);
    } else {
      setParsedResult(null);
      setSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error('Matn kiriting');
      return;
    }

    setIsProcessing(true);

    try {
      const result = parseInput(input);

      if (!result || result.confidence < 30) {
        toast.custom((t) => (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} max-w-md`}>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Qanday qo'shmoqchisiz?</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleAddTask(input);
                  toast.dismiss(t.id);
                }}
                className={`w-full text-left px-4 py-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg flex items-center gap-3 transition-colors`}
              >
                <CheckSquare className="w-4 h-4 text-blue-500" />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Vazifa sifatida</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>To-do ro'yxatiga qo'shish</p>
                </div>
              </button>
              <button
                onClick={() => {
                  handleAddFinance(input);
                  toast.dismiss(t.id);
                }}
                className={`w-full text-left px-4 py-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg flex items-center gap-3 transition-colors`}
              >
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Xarajat sifatida</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Moliya hisobiga qo'shish</p>
                </div>
              </button>
              <button
                onClick={() => {
                  handleAddGoal(input);
                  toast.dismiss(t.id);
                }}
                className={`w-full text-left px-4 py-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg flex items-center gap-3 transition-colors`}
              >
                <Target className="w-4 h-4 text-purple-500" />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Maqsad sifatida</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Maqsadlar ro'yxatiga qo'shish</p>
                </div>
              </button>
            </div>
          </div>
        ), { duration: 10000 });
        return;
      }

      if (result.type === 'task') {
        await handleAddTask(input, result);
      } else if (result.type === 'finance') {
        await handleAddFinance(input, result);
      } else if (result.type === 'goal') {
        await handleAddGoal(input, result);
      }

    } catch (error) {
      console.error('Smart add error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTask = async (text, parsedResult = null) => {
    try {
      let taskData = {
        title: text,
        description: '',
        status: 'pending',
        priority: 'medium',
        deadline: new Date().toISOString().split('T')[0]
      };

      if (parsedResult) {
        taskData = {
          ...taskData,
          title: parsedResult.data.title || text,
          priority: parsedResult.data.priority || 'medium',
          deadline: parsedResult.data.deadline || new Date().toISOString().split('T')[0]
        };
      }

      await taskService.createTask(taskData);
      toast.success('✅ Vazifa muvaffaqiyatli qo\'shildi!');
      setInput('');
      setParsedResult(null);
      setSuggestions([]);
      setShowQuickAdd(false);
      if (onAddTask) onAddTask();
    } catch (error) {
      toast.error('Vazifa qo\'shishda xatolik');
    }
  };

  const handleAddFinance = async (text, parsedResult = null) => {
    try {
      let financeData = {
        type: 'expense',
        amount: 0,
        category: 'Other',
        description: text,
        date: new Date().toISOString().split('T')[0]
      };

      if (parsedResult) {
        financeData = {
          type: parsedResult.subtype || 'expense',
          amount: parsedResult.data.amount || 0,
          category: parsedResult.data.category || 'Other',
          description: text,
          date: parsedResult.data.date || new Date().toISOString().split('T')[0]
        };
      }

      await financeService.createTransaction(financeData);
      toast.success(`✅ ${financeData.type === 'expense' ? 'Xarajat' : 'Daromad'} qo'shildi!`);
      setInput('');
      setParsedResult(null);
      setSuggestions([]);
      setShowQuickAdd(false);
      if (onAddFinance) onAddFinance();
    } catch (error) {
      toast.error('Moliya qo\'shishda xatolik');
    }
  };

  const handleAddGoal = async (text, parsedResult = null) => {
    try {
      let goalData = {
        name: text,
        targetAmount: 0,
        currentAmount: 0,
        deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'active',
        priority: 'medium'
      };

      if (parsedResult) {
        goalData = {
          name: parsedResult.data.title || text,
          targetAmount: parsedResult.data.amount || 0,
          currentAmount: 0,
          deadline: parsedResult.data.deadline || parsedResult.data.date ||
            new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          status: 'active',
          priority: parsedResult.data.priority || 'medium'
        };
      }

      await goalsService.createGoal(goalData);
      toast.success('🎯 Maqsad muvaffaqiyatli yaratildi!');
      setInput('');
      setParsedResult(null);
      setSuggestions([]);
      setShowQuickAdd(false);
      if (onAddGoal) onAddGoal();
    } catch (error) {
      toast.error('Maqsad yaratishda xatolik');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowQuickAdd(false);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showQuickAdd && e.target.classList.contains('modal-backdrop')) {
        setShowQuickAdd(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showQuickAdd]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (showQuickAdd && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [showQuickAdd]);

  const getResultIcon = () => {
    if (!parsedResult) return <Brain className="w-5 h-5 text-gray-400" />;
    switch (parsedResult.type) {
      case 'task': return <CheckSquare className="w-5 h-5 text-blue-500" />;
      case 'finance':
        return parsedResult.subtype === 'income'
          ? <TrendingUp className="w-5 h-5 text-green-500" />
          : <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'goal': return <Target className="w-5 h-5 text-purple-500" />;
      default: return <Brain className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResultColor = () => {
    if (!parsedResult) return isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200';
    switch (parsedResult.type) {
      case 'task': return isDark ? 'border-blue-700 bg-blue-900/20' : 'border-blue-200 bg-blue-50';
      case 'finance':
        return parsedResult.subtype === 'income'
          ? (isDark ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50')
          : (isDark ? 'border-red-700 bg-red-900/20' : 'border-red-200 bg-red-50');
      case 'goal': return isDark ? 'border-purple-700 bg-purple-900/20' : 'border-purple-200 bg-purple-50';
      default: return isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200';
    }
  };

  const getResultText = () => {
    if (!parsedResult) return 'AI tahlil qilmoqda...';
    const { type, subtype, confidence, data } = parsedResult;
    if (type === 'task') {
      return `📝 Vazifa: ${data.title || 'Yangi vazifa'}`;
    } else if (type === 'finance') {
      return `💰 ${subtype === 'income' ? 'Daromad' : 'Xarajat'}: ${data.amount ? new Intl.NumberFormat('uz-UZ').format(data.amount) + ' so\'m' : 'Summa aniqlanmadi'}`;
    } else if (type === 'goal') {
      return `🎯 ${subtype === 'create' ? 'Yangi maqsad' : 'Maqsad yangilash'}: ${data.title || 'Maqsad'}`;
    }
    return 'Turi aniqlanmadi';
  };

  const examplePhrases = [
    { text: "Taksi ga 25 ming sarfladim", type: "finance", icon: DollarSign },
    { text: "Bugun 30 minglik ovqatlandim", type: "finance", icon: Wallet },
    { text: "Kompuyuter olish maqsadimga 100 ming qo'shdim", type: "goal", icon: Target },
    { text: "Moshina olish uchun 500 ming kerak", type: "goal", icon: Rocket },
    { text: "Ertaga meeting tayyorlash kerak", type: "task", icon: CheckSquare },
    { text: "Haftaga report yozish vazifasi", type: "task", icon: Calendar }
  ];

  return (
    <div className="relative">
      {/* Quick Add Trigger Button */}
      {/* {!showQuickAdd && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-30 w-16 h-16 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 rounded-full shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 flex items-center justify-center transition-all duration-300 group hover:scale-110"
          title="Smart Quick Add (Ctrl+K)"
        >
          <Sparkles className="w-7 h-7 text-white group-hover:rotate-180 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
        </button>
      )} */}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div 
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) {
              setShowQuickAdd(false);
            }
          }}
        >
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl w-full max-w-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} animate-slide-up overflow-hidden`}>
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      Smart Quick Add
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI</span>
                    </h2>
                    <p className="text-white/90 text-sm mt-1">Tabiiy til orqali vazifa, maqsad yoki xarajat qo'shing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Tabs */}
              <div className={`flex gap-2 mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} p-1.5 rounded-xl`}>
                {[
                  { id: 'all', label: 'AI Avtomatik', icon: Zap },
                  { id: 'task', label: 'Vazifa', icon: CheckSquare },
                  { id: 'finance', label: 'Moliya', icon: Wallet },
                  { id: 'goal', label: 'Maqsad', icon: Target }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isActive
                          ? `${isDark ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-gray-900 shadow'}`
                          : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="mb-6">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Masalan: Bugun taksi ga 25 ming sarfladim, yoki Ertaga meeting tayyorlash kerak..."
                    className={`w-full px-4 py-4 ${isDark ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'} border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[140px] resize-none transition-all`}
                    rows={4}
                    maxLength={500}
                  />
                  <div className={`absolute bottom-3 right-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                    {input.length}/500
                  </div>
                </div>

                {/* AI Analysis Result */}
                {parsedResult && (
                  <div className={`mt-4 p-4 border-2 rounded-xl ${getResultColor()} transition-all animate-fade-in`}>
                    <div className="flex items-start gap-3">
                      {getResultIcon()}
                      <div className="flex-1">
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getResultText()}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                            Aniqlik: {parsedResult.confidence}%
                          </span>
                          {parsedResult.data.date && (
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                              <Calendar className="w-3 h-3" />
                              {parsedResult.data.date === new Date().toISOString().split('T')[0] ? 'Bugun' : parsedResult.data.date}
                            </span>
                          )}
                          {parsedResult.data.category && (
                            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                              {parsedResult.data.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2 flex items-center gap-2`}>
                      <Lightbulb className="w-4 h-4" />
                      Takliflar:
                    </p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={suggestion.action}
                        className={`w-full text-left p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'} border rounded-xl transition-all hover:scale-[1.02] flex items-center gap-3`}
                      >
                        {suggestion.type === 'task' && <CheckSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        {suggestion.type === 'finance' && <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        {suggestion.type === 'goal' && <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{suggestion.text}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Example Phrases */}
              <div className="mb-6">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3 flex items-center gap-2`}>
                  <Star className="w-4 h-4" />
                  Namuna iboralar:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examplePhrases.map((phrase, index) => {
                    const Icon = phrase.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setInput(phrase.text)}
                        className={`text-left p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'} border rounded-lg text-sm transition-all hover:scale-[1.02] flex items-center gap-2 group`}
                      >
                        <Icon className={`w-4 h-4 ${phrase.type === 'finance' ? 'text-green-500' : phrase.type === 'task' ? 'text-blue-500' : 'text-purple-500'} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                        <span className={`truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{phrase.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className={`flex-1 px-6 py-3.5 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'} border ${isDark ? 'border-gray-600' : 'border-gray-200'} rounded-xl font-semibold transition-all hover:scale-[1.02]`}
                >
                  Bekor Qilish
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !input.trim()}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg hover:shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Tahlil qilinmoqda...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {parsedResult ? (
                        <>
                          {parsedResult.type === 'task' && 'Vazifa Qo\'shish'}
                          {parsedResult.type === 'finance' && 'Moliya Qo\'shish'}
                          {parsedResult.type === 'goal' && 'Maqsad Qo\'shish'}
                          {parsedResult.type === 'unknown' && 'AI orqali Qo\'shish'}
                        </>
                      ) : 'AI orqali Qo\'shish'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartQuickAdd;
