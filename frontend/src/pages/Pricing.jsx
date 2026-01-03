import React, { useState, useCallback, useEffect } from 'react';
import {
  Check, X, Star, Zap, Crown, Users,
  Calendar, Shield, Cloud, Headphones,
  TrendingUp, Sparkles, ArrowRight,
  CreditCard, Lock, Infinity, Upload, FileText, Loader2, CheckCircle, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user has active Pro subscription
  const hasProSubscription = user?.subscriptionType === 'premium' || user?.subscriptionType === 'enterprise';
  const subscriptionEndDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const isSubscriptionActive = subscriptionEndDate && subscriptionEndDate > new Date();

  // Fetch app settings and refresh user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch app settings
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/app-settings/public`);
        const data = await response.json();
        if (data.success) {
          setAppSettings(data.settings);
          // If Pro is disabled, redirect to home
          if (!data.settings.pro_subscription_enabled) {
            navigate('/');
            return;
          }
        }
        
        // Refresh user profile to get latest subscription status
        try {
          const profileRes = await api.get('/api/user/profile');
          if (profileRes.data.success && profileRes.data.user) {
            // Update user in auth context
            updateUser(profileRes.data.user);
            console.log('User subscription updated:', profileRes.data.user.subscriptionType);
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Payment submit handler
  const handlePaymentSubmit = useCallback(async () => {
    if (!receiptFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('plan', selectedPlan.name);
      formData.append('billingCycle', billingCycle);
      formData.append('amount', selectedPlan.price[billingCycle].toString().replace(/\D/g, ''));
      formData.append('receipt', receiptFile);

      const response = await api.post('/api/payments/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setShowPaymentModal(false);
        setReceiptFile(null);
        toast.success('To\'lov yuborildi! Admin tekshirib, tasdiqlaydi.');
      } else {
        toast.error(response.data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setUploading(false);
    }
  }, [receiptFile, selectedPlan, billingCycle]);

  // Get dynamic prices from settings
  const proMonthlyPrice = appSettings?.pro_monthly_price || 39000;
  const proYearlyPrice = appSettings?.pro_yearly_price || 399000;
  const cardNumber = appSettings?.payment_card_number || '9860 0607 0978 0345';
  const cardHolder = appSettings?.payment_card_holder || 'Muhammadaziz Yakubov';

  const plans = [
    {
      name: 'Bepul',
      price: { monthly: 0, yearly: 0 },
      description: 'Boshlash uchun mukammal',
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      features: [
        { name: 'Kunda Cheksiz vazifalar', included: true },
        { name: 'Asosiy maqsad kuzatuvi', included: true },
        { name: 'Moliya tracking', included: true },
        { name: '1 qurilma sinxronizatsiyasi', included: true },
        { name: '24/7 yordami', included: true },
        { name: 'AI orqali vazifa qo`shish', included: true },
        { name: 'Oila xususiyatlari', included: false },
        { name: 'Challenge Tizimi', included: false },
        { name: 'Kengaytirilgan tahlil', included: false },
        { name: 'Oila challenges', included: false },
        { name: 'Malumotlarni eksport qilish', included: false }
      ],
      buttonText: 'Bepul boshlash',
      buttonVariant: 'outline',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: proMonthlyPrice, yearly: proYearlyPrice },
      originalPrice: { monthly: Math.round(proMonthlyPrice * 1.25), yearly: Math.round(proYearlyPrice * 1.23) },
      description: 'Oila va jismoniy shaxslar uchun mukammal',
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      features: [
        { name: 'Cheksiz vazifalar', included: true },
        { name: 'Kengaytirilgan maqsad kuzatuvi', included: true },
        { name: 'To\'liq moliya boshqaruvi', included: true },
        { name: 'Kengaytirilgan tahlil', included: true },
        { name: 'Oila xususiyatlari', included: true },
        { name: 'Challenge Tizimi', included: true },
        { name: '6 tagacha oila a\'zosi', included: true },
        { name: 'Bolalar rejimi va monitoring', included: true },
        { name: 'Oila taqvimi', included: true },
        { name: 'Ma\'lumotlarni eksport qilish', included: true }
      ],
      buttonText: 'Pro sinovni boshlash',
      buttonVariant: 'primary',
      popular: true,
      badge: 'Eng mashhur'
    },    
    {
      name: 'Korporativ',
      price: { monthly: 'Shaxsiy', yearly: 'Shaxsiy' },
      description: 'Katta tashkilotlar uchun',
      icon: <Crown className="w-8 h-8 text-gold-500" />,
      features: [
        { name: 'Oila dagi hamma narsa', included: true },
        { name: 'Cheksiz jamoa a\'zolari', included: true },
        { name: 'Kengaytirilgan jamoa tahlili', included: true },
        { name: 'Shaxsiy integratsiyalar', included: true },
        { name: 'Shaxsiy account menejer', included: true },
        { name: 'Shaxsiy trening', included: true },
        { name: 'Kengaytirilgan xavfsizlik', included: true },
        { name: '24/7 telefon yordami', included: true },
        { name: 'Shaxsiy branding', included: true },
        { name: 'API kirish', included: true }
      ],
      buttonText: 'Sotish bilan bog\'lanish',
      buttonVariant: 'outline',
      popular: false,
      badge: 'Korporativ'
    }
  ];

  const formatPrice = (price) => {
    if (price === 'Shaxsiy') return price;
    if (price === 0) return 'Bepul';

    return new Intl.NumberFormat('uz-UZ').format(price) + (billingCycle === 'yearly' ? ' so\'m' : ' so\'m');
  };

  const testimonials = [
    {
      name: 'Malika Karimova',
      role: 'Dasturiy ta\'minot ishlab chiqaruvchi',
      content: 'InFast AI menga har kuni 2 soat vaqtimni tejaydi. Pro plan - eng yaxshi sarmoya!',
      rating: 5
    },
    {
      name: 'Aziz Ahmedov',
      role: 'Biznes egasi',
      content: 'Oila plani bilan butun oilam tashkil topdi. Bolalar ham o\'z vazifalarini bajarishadi.',
      rating: 5
    },
    {
      name: 'Nodira Tosheva',
      role: 'O\'qituvchi',
      content: 'AI hayot murabbiyi - mening eng sevimli xususiyatim. Har kuni motivatsiya beradi.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'Pro plan da qanday imkoniyatlar bor?',
      answer: 'Pro plan da cheksiz vazifalar, AI life coach, advanced analytics, premium themes va boshqa ko\'plab features mavjud.'
    },
    {
      question: 'Pro plan da oila xususiyatlari bormi?',
      answer: 'Ha, Pro plan da 6 tagacha oila a\'zosi foydalanishi mumkin. Oila taqvimi, bolalar monitoring va barcha oila xususiyatlari mavjud.'
    },
    {
      question: 'To\'lovni qanday amalga oshiraman?',
      answer: 'Click, PayMe, Uzum va boshqa O\'zbekiston bank kartalari orqali to\'lash mumkin. Yillik to\'lashda 20% chegirma.'
    },
    {
      question: 'Free plan dan Pro ga o\'tish osonmi?',
      answer: 'Ha, birmartalik klik bilan Free dan Pro ga upgrade qilishingiz mumkin. Ma\'lumotlaringiz saqlanib qolinadi.'
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // If Pro is disabled, don't render (redirect happens in useEffect)
  if (!appSettings?.pro_subscription_enabled) {
    return null;
  }

  // ============================================
  // PRO USER - Profile sahifasiga yo'naltirish
  // ============================================
  if (hasProSubscription && isSubscriptionActive) {
    navigate('/profile');
    return null;
  }

  // ============================================
  // FREE USER - Standart pricing sahifasi
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Rejangizni tanlang
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              InFast AI bilan to'liq potensialingizni oching. Bepul boshlang va istalgan vaqtda yangilang.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Oylik
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Yillik
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    20% tejam
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.popular
                  ? 'border-blue-500 shadow-blue-500/25'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    plan.name === 'Pro'
                      ? 'bg-blue-500 text-white'
                      : plan.name === 'Family'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.price[billingCycle])}
                    </span>
                    {plan.price.monthly !== 0 && plan.price.monthly !== 'Custom' && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        /{billingCycle === 'yearly' ? 'yil' : 'oy'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price.monthly !== 0 && plan.price.monthly !== 'Custom' && plan.originalPrice && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save {new Intl.NumberFormat('uz-UZ').format(plan.originalPrice.yearly - plan.price.yearly)} so'm yearly
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : plan.buttonVariant === 'secondary'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={plan.name === 'Bepul'}
                  onClick={() => {
                    if (plan.name === 'Korporativ') {
                      window.open('https://t.me/mister_yakubov', '_blank');
                    } else if (plan.name === 'Pro') {
                      setSelectedPlan(plan);
                      setShowPaymentModal(true);
                    }
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Xususiyatlarni taqqoslash
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-8 py-4 text-left font-semibold text-gray-900 dark:text-white">
                    Xususiyatlar
                  </th>
                  <th className="px-8 py-4 text-center font-semibold text-gray-900 dark:text-white">
                    Bepul
                  </th>
                  <th className="px-8 py-4 text-center font-semibold text-blue-600">
                    Pro
                  </th>
                  <th className="px-8 py-4 text-center font-semibold text-gold-600">
                    Korporativ
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Kundalik vazifalar', 'Maqsad kuzatuvi', 'Moliya boshqaruvi',
                  'AI hayot murabbiyi', 'Oila xususiyatlari', 'Challenge Tizimi',
                  'Qurilma sinxronizatsiyasi', 'Bulutli backup', 'Shaxsiy integratsiyalar'
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-8 py-4 font-medium text-gray-900 dark:text-white">
                      {feature}
                    </td>
                    <td className="px-8 py-4 text-center">
                      {index < 3 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                    </td>
                    <td className="px-8 py-4 text-center">
                      {index < 6 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Foydalanuvchilarimiz nima deydi
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              InFast AI bilan hayotini o'zgartirgan minglab qoniqgan foydalanuvchilarga qo'shiling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tez-tez beriladigan savollar
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              InFast AI narxlari haqida bilishingiz kerak bo'lgan hamma narsa
            </p>
          </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

    

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedPlan.name} plan sotib olish
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Card Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">To'lov kartasi</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100 mb-1">
                    {cardNumber}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {cardHolder}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">To'lov miqdori:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(selectedPlan.price[billingCycle])}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                      Eslatma:
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Yuqoridagi kartaga pul tashlab, chekni bu yerga yuklang. Admin tekshirib, tasdiqlaydi.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chek yuklash
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                  {receiptFile ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {receiptFile.name}
                      </p>
                      <button
                        onClick={() => setReceiptFile(null)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        O'chirish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Chek rasmini tanlang
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReceiptFile(e.target.files[0])}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Fayl tanlash
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
                <button
                  onClick={() => handlePaymentSubmit()}
                  disabled={!receiptFile || uploading}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Yuborilmoqda...' : 'To\'lovni yuborish'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
