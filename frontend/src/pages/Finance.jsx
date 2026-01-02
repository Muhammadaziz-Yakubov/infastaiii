import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, Plus, Calendar,
    PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Search,
    Edit, Trash2, X, RefreshCw, Wallet, Users,
    Home, Car, ShoppingCart, Coffee, Film, HeartPulse,
    Dumbbell, BookOpen, Briefcase, Gift, Phone,
    ShoppingBag, Eye, EyeOff, CreditCard, Clock,
    AlertCircle, User, ChevronRight, ExternalLink, FileText, WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import CurrencyInput from '../components/CurrencyInput';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../services/financeService';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput, formatCurrencyShort } from '../utils/currency';
import { saveToOffline, getFromOffline, STORES } from '../utils/offlineStorage';
// BudgetPlanner va RecurringTransactions olib tashlandi

const iconMap = {
    Car, ShoppingCart, Home, Coffee, Film, HeartPulse,
    Dumbbell, BookOpen, Briefcase, Gift, Phone,
    ShoppingBag, DollarSign, Wallet, TrendingUp, TrendingDown,
    Users, CreditCard, Clock, User
};

const Finance = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [debts, setDebts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statistics, setStatistics] = useState({
        balance: 0,
        totalIncome: 0,
        totalExpense: 0,
        savingsRate: 0
    });
    const [debtStatistics, setDebtStatistics] = useState({
        totalBorrowed: 0,
        totalLent: 0,
        activeBorrowed: 0,
        activeLent: 0,
        overdueBorrowed: 0,
        overdueLent: 0,
        netDebt: 0
    });

    // Filter state'lar
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' yoki 'debts'

    // Modal state'lar
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [showBalance, setShowBalance] = useState(true);

    // Form data
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Debt form data
    const [debtFormData, setDebtFormData] = useState({
        type: 'borrow',
        personName: '',
        personPhone: '',
        amount: 0,
        description: '',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
    });

    const [paymentAmount, setPaymentAmount] = useState(0);

    // Ma'lumotlarni yuklash
    useEffect(() => {
        loadData();
    }, [selectedPeriod]);

    // URL parametrlarini tekshirish (mobile + tugmasidan kelganda)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('add') === 'true') {
            setShowAddModal(true);
            // URL dan parametrni tozalash
            navigate('/finance', { replace: true });
        } else if (urlParams.get('add') === 'debt') {
            setShowDebtModal(true);
            // URL dan parametrni tozalash
            navigate('/finance', { replace: true });
        }
    }, [navigate]);

   const loadData = async () => {
    setLoading(true);
    try {
        // Online bo'lsa serverdan olish
        if (navigator.onLine) {
            // Tranzaksiyalarni yuklash
            const transData = await financeService.getTransactions();
            if (transData.success) {
                setTransactions(transData.transactions || []);
                await saveToOffline(STORES.TRANSACTIONS, transData.transactions || []);
            }

            // Qarz ma'lumotlarini yuklash
            const debtsData = await financeService.getDebts();
            if (debtsData.success) {
                setDebts(debtsData.debts || []);
                await saveToOffline(STORES.DEBTS, debtsData.debts || []);
                
                // Qarz statistikasini hisoblash
                let activeBorrowed = 0, activeLent = 0, overdueBorrowed = 0, overdueLent = 0, totalBorrowed = 0, totalLent = 0;
                
                debtsData.debts.forEach(debt => {
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
                
                setDebtStatistics({
                    totalBorrowed, totalLent, activeBorrowed, activeLent,
                    overdueBorrowed, overdueLent, netDebt: activeLent - activeBorrowed
                });
            }

            // Statistikani yuklash
            const statsData = await financeService.getStatistics(selectedPeriod);
            if (statsData.success) {
                setStatistics(statsData.stats || { balance: 0, totalIncome: 0, totalExpense: 0, savingsRate: 0 });
            }

            // Kategoriyalarni yuklash
            const catData = await financeService.getCategories();
            if (catData.success && catData.categories) {
                setCategories(catData.categories);
            } else {
                setCategories([
                    { _id: '1', name: 'Oziq-ovqat', type: 'expense', icon: 'Coffee', color: '#FF6B35' },
                    { _id: '2', name: 'Transport', type: 'expense', icon: 'Car', color: '#4ECDC4' },
                    { _id: '3', name: 'Uy', type: 'expense', icon: 'Home', color: '#45B7D1' },
                    { _id: '4', name: 'Kiyim', type: 'expense', icon: 'ShoppingBag', color: '#96CEB4' },
                    { _id: '5', name: 'Sog\'liq', type: 'expense', icon: 'HeartPulse', color: '#FECA57' },
                    { _id: '6', name: 'Ta\'lim', type: 'expense', icon: 'BookOpen', color: '#FF9FF3' },
                    { _id: '7', name: 'Ko\'ngilochar', type: 'expense', icon: 'Film', color: '#54A0FF' },
                    { _id: '8', name: 'Maosh', type: 'income', icon: 'DollarSign', color: '#1DD1A1' },
                    { _id: '9', name: 'Biznes', type: 'income', icon: 'Briefcase', color: '#FF9F43' },
                    { _id: '10', name: 'Investitsiya', type: 'income', icon: 'TrendingUp', color: '#0ABDE3' }
                ]);
            }
        } else {
            // Offline bo'lsa IndexedDB dan olish
            const offlineTransactions = await getFromOffline(STORES.TRANSACTIONS);
            const offlineDebts = await getFromOffline(STORES.DEBTS);
            setTransactions(offlineTransactions || []);
            setDebts(offlineDebts || []);
            toast('Offline rejim - saqlangan ma\'lumotlar', { icon: '📴' });
        }

    } catch (error) {
        console.error('Yuklashda xatolik:', error);
        
        // Xatolik bo'lsa offline ma'lumotlarni ko'rsatish
        try {
            const offlineTransactions = await getFromOffline(STORES.TRANSACTIONS);
            const offlineDebts = await getFromOffline(STORES.DEBTS);
            if (offlineTransactions?.length > 0 || offlineDebts?.length > 0) {
                setTransactions(offlineTransactions || []);
                setDebts(offlineDebts || []);
                toast('Offline ma\'lumotlar ko\'rsatilmoqda', { icon: '📴' });
                return;
            }
        } catch (offlineError) {
            console.error('Offline load error:', offlineError);
        }
        
        if (error.message?.includes('Network Error')) {
            toast.error('Serverga ulanib bo\'lmadi');
        } else {
            toast.error(error.message || 'Yuklashda xatolik');
        }
    } finally {
        setLoading(false);
    }
};

    // Filterlangan tranzaksiyalar
    const getFilteredTransactions = () => {
        let result = [...transactions];

        // Tur bo'yicha filter
        if (selectedType !== 'all') {
            result = result.filter(t => t.type === selectedType);
        }

        // Kategoriya bo'yicha filter
        if (selectedCategory !== 'all') {
            result = result.filter(t => t.category === selectedCategory);
        }

        // Qidiruv
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.description?.toLowerCase().includes(query) ||
                t.category?.toLowerCase().includes(query)
            );
        }

        // Eng yangi birinchi
        result.sort((a, b) => new Date(b.date) - new Date(a.date));

        return result;
    };

    // Filterlangan qarzlar
    const getFilteredDebts = () => {
        let result = [...debts];

        // Tur bo'yicha filter
        if (selectedType !== 'all') {
            result = result.filter(d => d.type === selectedType);
        }

        // Qidiruv
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.personName?.toLowerCase().includes(query) ||
                d.description?.toLowerCase().includes(query) ||
                d.personPhone?.toLowerCase().includes(query)
            );
        }

        // Muddatiga qarab tartiblash
        result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        return result;
    };

    const filteredTransactions = getFilteredTransactions();
    const filteredDebts = getFilteredDebts();

    // Tranzaksiya qo'shish/yangilash
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || formData.amount <= 0 || !formData.category) {
            toast.error('Summa va kategoriyani kiriting');
            return;
        }

        try {
            const transactionData = {
                type: formData.type,
                amount: typeof formData.amount === 'number' ? formData.amount : parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: formData.date
            };

            let data;
            if (editingTransaction) {
                data = await financeService.updateTransaction(editingTransaction._id, transactionData);
            } else {
                data = await financeService.createTransaction(transactionData);
            }

            if (data.success) {
                toast.success(editingTransaction ? 'Yangilandi ✅' : 'Qo\'shildi ✅');
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
                loadData();
            } else {
                toast.error(data.message || 'Xatolik');
            }
        } catch (error) {
            toast.error('Server bilan bog\'lanishda xatolik');
        }
    };

    // Qarz qo'shish/yangilash
    const handleDebtSubmit = async (e) => {
        e.preventDefault();

        if (!debtFormData.personName || !debtFormData.amount || debtFormData.amount <= 0 || !debtFormData.dueDate) {
            toast.error('Ism, summa va muddatni kiriting');
            return;
        }

        try {
            const debtData = {
                ...debtFormData,
                amount: typeof debtFormData.amount === 'number' ? debtFormData.amount : parseFloat(debtFormData.amount)
            };
            
            let data;
            if (editingDebt) {
                data = await financeService.updateDebt(editingDebt._id, debtData);
            } else {
                data = await financeService.createDebt(debtData);
            }

            if (data.success) {
                toast.success(editingDebt ? 'Qarz yangilandi ✅' : 'Qarz qo\'shildi ✅');
                setShowDebtModal(false);
                resetDebtForm();
                loadData();
            } else {
                toast.error(data.message || 'Xatolik');
            }
        } catch (error) {
            toast.error('Server bilan bog\'lanishda xatolik');
        }
    };

    // Tranzaksiya o'chirish
    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('O\'chirmoqchimisiz?')) return;

        try {
            const data = await financeService.deleteTransaction(id);

            if (data.success) {
                toast.success('O\'chirildi 🗑️');
                loadData();
            }
        } catch (error) {
            toast.error('Xatolik');
        }
    };

    // Qarz o'chirish
    const handleDeleteDebt = async (id) => {
        if (!window.confirm('Qarzni o\'chirmoqchimisiz?')) return;

        try {
            const data = await financeService.deleteDebt(id);

            if (data.success) {
                toast.success('Qarz o\'chirildi 🗑️');
                loadData();
            }
        } catch (error) {
            toast.error('Xatolik');
        }
    };

    // To'lov qilish
    const handlePayment = async () => {
        const paymentValue = typeof paymentAmount === 'number' ? paymentAmount : parseFloat(paymentAmount);
        
        if (!paymentValue || paymentValue <= 0) {
            toast.error('To\'lov summasi noto\'g\'ri');
            return;
        }

        if (paymentValue > selectedDebt.remainingAmount) {
            toast.error('To\'lov summasi qolgan miqdordan ko\'p');
            return;
        }

        try {
            const data = await financeService.addDebtPayment(selectedDebt._id, {
                amount: paymentValue,
                description: 'To\'lov'
            });

            if (data.success) {
                toast.success('To\'lov qilindi ✅');
                setShowPaymentModal(false);
                setPaymentAmount(0);
                setSelectedDebt(null);
                loadData();
            } else {
                toast.error(data.message || 'Xatolik');
            }
        } catch (error) {
            toast.error('Server bilan bog\'lanishda xatolik');
        }
    };

    // Tranzaksiya tahrirlash
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            amount: transaction.amount || 0,
            category: transaction.category,
            description: transaction.description || '',
            date: new Date(transaction.date).toISOString().split('T')[0]
        });
        setShowEditModal(true);
    };

    // Qarz tahrirlash
    const handleEditDebt = (debt) => {
        setEditingDebt(debt);
        setDebtFormData({
            type: debt.type,
            personName: debt.personName,
            personPhone: debt.personPhone || '',
            amount: debt.amount || 0,
            description: debt.description || '',
            dueDate: new Date(debt.dueDate).toISOString().split('T')[0]
        });
        setShowDebtModal(true);
    };

    // To'lov modalini ochish
    const handleOpenPaymentModal = (debt) => {
        setSelectedDebt(debt);
        setPaymentAmount(0);
        setShowPaymentModal(true);
    };

    // Formlarni tozalash
    const resetForm = () => {
        setFormData({
            type: 'expense',
            amount: 0,
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingTransaction(null);
    };

    const resetDebtForm = () => {
        setDebtFormData({
            type: 'borrow',
            personName: '',
            personPhone: '',
            amount: 0,
            description: '',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
        });
        setEditingDebt(null);
    };

    // Format funksiyalar
    const formatShortCurrency = formatCurrencyShort; // Alias for compatibility

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Bugun';
        if (diffDays === 1) return 'Kecha';
        if (diffDays < 7) return `${diffDays} kun oldin`;

        return date.toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'short'
        });
    };

    const formatDueDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Bugun';
        if (diffDays === 1) return 'Ertaga';
        if (diffDays > 0) return `${diffDays} kun qoldi`;
        if (diffDays < 0) return `${Math.abs(diffDays)} kun kechikdi`;

        return date.toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getCategoryIcon = (iconName) => {
        return iconMap[iconName] || DollarSign;
    };

    const getDebtStatus = (debt) => {
        if (debt.remainingAmount <= 0) return { text: 'To\'langan', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
        if (new Date(debt.dueDate) < new Date()) return { text: 'Kechikkan', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
        return { text: 'Faol', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    };

    // Loading
    if (loading) {
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
        <div className="w-full space-y-4 lg:space-y-6 pb-24 sm:pb-8">
            {/* Header - Desktop optimized with side-by-side layout */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-md border border-gray-200 dark:border-gray-700">
                {/* Top row - Title and actions */}
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <div className="p-2.5 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl shadow-lg">
                            <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Moliya</h1>
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Daromad va xarajatlarni boshqaring</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <button
                            onClick={loadData}
                            className="p-2 lg:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:rounded-xl transition-all"
                            title="Yangilash"
                        >
                            <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                        </button>
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="p-2 lg:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:rounded-xl transition-colors"
                        >
                            {showBalance ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />}
                        </button>
                    </div>
                </div>

                {/* Desktop: Side by side layout, Mobile: Stacked */}
                <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                    {/* Balans - Left side on desktop */}
                    <div className="lg:col-span-1 mb-4 lg:mb-0">
                        <div className="h-full flex flex-col justify-center py-4 lg:py-6 px-4 lg:px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl lg:rounded-2xl shadow-lg">
                            <p className="text-white/80 text-xs lg:text-sm mb-1 lg:mb-2">Umumiy balans</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                                {showBalance ? formatCurrency(statistics.balance) : '••••••••'}
                            </p>
                            <p className="text-white/60 text-xs lg:text-sm mt-2 hidden lg:block">
                                {new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid - Right side on desktop */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-4 lg:mb-0 lg:h-full">
                            <div className="flex flex-col justify-center text-center p-3 lg:p-5 bg-green-50 dark:bg-green-900/20 rounded-xl lg:rounded-2xl border border-green-100 dark:border-green-800/30">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 bg-green-100 dark:bg-green-800/30 rounded-xl lg:rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-green-500" />
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1">Daromad</p>
                                <p className="text-sm sm:text-base lg:text-xl font-bold text-green-600 dark:text-green-400">
                                    +{formatShortCurrency(statistics.totalIncome)}
                                </p>
                            </div>
                            <div className="flex flex-col justify-center text-center p-3 lg:p-5 bg-red-50 dark:bg-red-900/20 rounded-xl lg:rounded-2xl border border-red-100 dark:border-red-800/30">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 bg-red-100 dark:bg-red-800/30 rounded-xl lg:rounded-2xl flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 lg:w-6 lg:h-6 text-red-500" />
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1">Xarajat</p>
                                <p className="text-sm sm:text-base lg:text-xl font-bold text-red-600 dark:text-red-400">
                                    -{formatShortCurrency(statistics.totalExpense)}
                                </p>
                            </div>
                            <div className="flex flex-col justify-center text-center p-3 lg:p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl lg:rounded-2xl border border-purple-100 dark:border-purple-800/30">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl lg:rounded-2xl flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 lg:w-6 lg:h-6 text-purple-500" />
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1">Qarz</p>
                                <p className="text-sm sm:text-base lg:text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatShortCurrency(Math.abs(debtStatistics.netDebt))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Button - Full width on mobile, inline on desktop */}
                <div className="mt-4 lg:mt-6">
                    <button
                        onClick={() => {
                            if (activeTab === 'transactions') {
                                resetForm();
                                setShowAddModal(true);
                            } else {
                                resetDebtForm();
                                setShowDebtModal(true);
                            }
                        }}
                        className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 lg:px-8 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        {activeTab === 'transactions' ? 'Yangi tranzaksiya' : 'Yangi qarz'}
                    </button>
                </div>
            </div>


            {/* Tablar - Desktop optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-1 lg:p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1 lg:space-x-2">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex-1 py-2.5 sm:py-3 lg:py-3.5 px-2 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl font-medium sm:font-semibold transition-all text-sm sm:text-base lg:text-lg ${activeTab === 'transactions' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Tranzaksiyalar</span>
                            <span className="sm:hidden">Tranz.</span>
                            <span className="text-xs sm:text-sm">({transactions.length})</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('debts')}
                        className={`flex-1 py-2.5 sm:py-3 lg:py-3.5 px-2 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl font-medium sm:font-semibold transition-all text-sm sm:text-base lg:text-lg ${activeTab === 'debts' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                            Qarzlar
                            <span className="text-xs sm:text-sm">({debts.length})</span>
                        </div>
                    </button>
                </div>
            </div>

          

            {/* Kontent */}
            {activeTab === 'transactions' ? (
                /* Tranzaksiyalar ro'yxati */
                filteredTransactions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md">
                        <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Tranzaksiya topilmadi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Birinchi tranzaksiyangizni qo'shing
                        </p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddModal(true);
                            }}
                            className="bg-primary-500 text-white px-6 py-2.5 rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Tranzaksiya qo'shish
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-md lg:shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredTransactions.map((transaction) => {
                                const categoryData = categories.find(c => c.name === transaction.category);
                                const Icon = getCategoryIcon(categoryData?.icon || 'DollarSign');

                                return (
                                    <div
                                        key={transaction._id}
                                        className="p-4 lg:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                                        onClick={() => handleEditTransaction(transaction)}
                                    >
                                        <div className="flex items-center gap-3 lg:gap-4">
                                            {/* Icon */}
                                            <div
                                                className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                                                style={{
                                                    backgroundColor: categoryData?.color + '20',
                                                    color: categoryData?.color
                                                }}
                                            >
                                                <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                                            </div>

                                            {/* Ma'lumotlar */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 lg:gap-3 mb-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg">
                                                        {transaction.category}
                                                    </h3>
                                                    <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm font-medium ${transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {transaction.type === 'income' ? 'Kirim' : 'Chiqim'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                                                    <span className="flex items-center gap-1 lg:gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                                        {formatDate(transaction.date)}
                                                    </span>
                                                    {transaction.description && (
                                                        <span className="truncate hidden sm:block max-w-xs lg:max-w-md">
                                                            {transaction.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Summa */}
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-base sm:text-xl lg:text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatShortCurrency(transaction.amount)}
                                                </p>
                                            </div>

                                            {/* Tugmalar */}
                                            <div className="hidden sm:flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditTransaction(transaction);
                                                    }}
                                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTransaction(transaction._id);
                                                    }}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile uchun izoh */}
                                        {transaction.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 sm:hidden truncate">
                                                {transaction.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            ) : (
                /* Qarzlar ro'yxati */
                filteredDebts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Qarz topilmadi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Birinchi qarzni qo'shing
                        </p>
                        <button
                            onClick={() => {
                                resetDebtForm();
                                setShowDebtModal(true);
                            }}
                            className="bg-purple-500 text-white px-6 py-2.5 rounded-lg hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Qarz qo'shish
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredDebts.map((debt) => {
                                const status = getDebtStatus(debt);
                                const Icon = debt.type === 'borrow' ? ArrowDownRight : ArrowUpRight;

                                return (
                                    <div
                                        key={debt._id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${debt.type === 'borrow' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>

                                            {/* Ma'lumotlar */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                                            {debt.personName}
                                                        </h3>
                                                        {debt.personPhone && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <Phone className="w-3 h-3" />
                                                                {debt.personPhone}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Umumiy summa</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(debt.amount)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Qolgan summa</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(debt.remainingAmount)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Muddati</p>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <p className={`font-semibold ${status.text === 'Kechikkan' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                                {formatDueDate(debt.dueDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {debt.description && (
                                                    <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                                                        {debt.description}
                                                    </p>
                                                )}

                                                {/* Tugmalar */}
                                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    {debt.remainingAmount > 0 && status.text !== 'To\'langan' && (
                                                        <button
                                                            onClick={() => handleOpenPaymentModal(debt)}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                                        >
                                                            To'lov qilish
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditDebt(debt)}
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
                                );
                            })}
                        </div>
                    </div>
                )
            )}

            {/* Tranzaksiya Modal */}
            {(showAddModal || showEditModal) && (
                <TransactionModal
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    editingTransaction={editingTransaction}
                    handleSubmit={handleSubmit}
                    onClose={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                    }}
                    getCategoryIcon={getCategoryIcon}
                />
            )}

            {/* Qarz Modal */}
            {showDebtModal && (
                <DebtModal
                    debtFormData={debtFormData}
                    setDebtFormData={setDebtFormData}
                    editingDebt={editingDebt}
                    handleDebtSubmit={handleDebtSubmit}
                    onClose={() => {
                        setShowDebtModal(false);
                        resetDebtForm();
                    }}
                />
            )}

            {/* To'lov Modal */}
            {showPaymentModal && selectedDebt && (
                <PaymentModal
                    selectedDebt={selectedDebt}
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    handlePayment={handlePayment}
                    formatCurrency={formatCurrency}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedDebt(null);
                        setPaymentAmount('');
                    }}
                />
            )}
        </div>
        
    );
};

// Transaction Modal Komponenti - Mobile optimized
const TransactionModal = ({ formData, setFormData, categories, editingTransaction, handleSubmit, onClose, getCategoryIcon }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        ></div>

        <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-modal-up sm:animate-none">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingTransaction ? 'Tahrirlash' : 'Yangi tranzaksiya'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Turi */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                            className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all ${formData.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                        >
                            <ArrowDownRight className="w-4 h-4 inline mr-1" />
                            Daromad
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                            className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                        >
                            <ArrowUpRight className="w-4 h-4 inline mr-1" />
                            Xarajat
                        </button>
                    </div>

                    <CurrencyInput
                        label="Summa"
                        value={formData.amount}
                        onChange={(value) => setFormData({ ...formData, amount: value })}
                        currency="UZS"
                        placeholder="0"
                        required
                    />

                    {/* Kategoriya - 4 ustunli grid */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Kategoriya <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {categories
                                .filter(cat => cat.type === formData.type)
                                .slice(0, 8)
                                .map((cat) => {
                                    const Icon = getCategoryIcon(cat.icon);
                                    return (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.name })}
                                            className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center ${formData.category === cat.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: cat.color }} />
                                            <span className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 line-clamp-1">{cat.name}</span>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Sana */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Sana
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2 pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                        >
                            Bekor
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium"
                        >
                            {editingTransaction ? 'Saqlash' : 'Qo\'shish'}
                        </button>
                    </div>
                </form>
        </div>
    </div>
);

// Debt Modal Komponenti - Mobile optimized
const DebtModal = ({ debtFormData, setDebtFormData, editingDebt, handleDebtSubmit, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        ></div>

        <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-modal-up sm:animate-none">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingDebt ? 'Qarzni tahrirlash' : 'Yangi qarz'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleDebtSubmit} className="p-4 space-y-4">
                    {/* Qarz turi */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setDebtFormData({ ...debtFormData, type: 'borrow' })}
                            className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all ${debtFormData.type === 'borrow' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                        >
                            Qarz oldim
                        </button>
                        <button
                            type="button"
                            onClick={() => setDebtFormData({ ...debtFormData, type: 'lend' })}
                            className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all ${debtFormData.type === 'lend' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                        >
                            Qarz berdim
                        </button>
                    </div>

                    {/* Ism */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {debtFormData.type === 'borrow' ? 'Kimdan?' : 'Kimga?'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={debtFormData.personName}
                            onChange={(e) => setDebtFormData({ ...debtFormData, personName: e.target.value })}
                            placeholder="Ism familiya"
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            required
                        />
                    </div>

                    <CurrencyInput
                        label="Summa"
                        value={debtFormData.amount}
                        onChange={(value) => setDebtFormData({ ...debtFormData, amount: value })}
                        currency="UZS"
                        placeholder="0"
                        required
                    />

                    {/* Muddat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Qaytarish muddati <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={debtFormData.dueDate}
                            onChange={(e) => setDebtFormData({ ...debtFormData, dueDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2 pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                        >
                            Bekor
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-3 text-white rounded-xl font-medium ${debtFormData.type === 'borrow' ? 'bg-blue-500' : 'bg-purple-500'}`}
                        >
                            {editingDebt ? 'Saqlash' : 'Qo\'shish'}
                        </button>
                    </div>
                </form>
        </div>
    </div>
);

// Payment Modal Komponenti
const PaymentModal = ({ selectedDebt, paymentAmount, setPaymentAmount, handlePayment, formatCurrency, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="h-2 bg-green-500 rounded-t-2xl"></div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            To'lov qilish
                        </h3>
                        <button
                            onClick={onClose}
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {selectedDebt.type === 'borrow' ? 'Sizdan qarz olgan' : 'Sizga qarz bergan'}
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

                        <CurrencyInput
                            label="To'lov summasi"
                            value={paymentAmount}
                            onChange={(value) => setPaymentAmount(value)}
                            currency="UZS"
                            placeholder="0"
                            required
                            error={paymentAmount > selectedDebt.remainingAmount ? `Maksimal: ${formatCurrency(selectedDebt.remainingAmount)}` : ''}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                            Maksimal: {formatCurrency(selectedDebt.remainingAmount)}
                        </p>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handlePayment}
                                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                                disabled={!paymentAmount || paymentAmount <= 0 || paymentAmount > selectedDebt.remainingAmount}
                            >
                                To'lov qilish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Finance;