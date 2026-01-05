import React, { useState, useCallback, useEffect } from 'react';
import {
  Check, X, Star, Zap, Crown, Users,
  Calendar, Shield, Cloud, Headphones,
  TrendingUp, Sparkles, ArrowRight,
  CreditCard, Lock, Infinity, Loader2, CheckCircle, Clock, Phone, ExternalLink
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user has active Pro subscription
  const hasProSubscription = user?.subscriptionType === 'premium' || user?.subscriptionType === 'enterprise';
  const subscriptionEndDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const isSubscriptionActive = subscriptionEndDate && subscriptionEndDate > new Date();

  // Show Pro subscription notification if user doesn't have it
  useEffect(() => {
    if (user && !hasProSubscription && !isSubscriptionActive && appSettings?.pro_subscription_enabled) {
      // Create a notification for Pro subscription
      const showProSubscriptionNotification = () => {
        // This would typically be handled by the backend, but for now we'll show a toast
        toast('🚀 Pro obuna oling!', {
          duration: 5000,
          icon: '💎',
          style: {
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            color: 'white',
            fontWeight: 'bold',
          },
        });
      };

      // Show notification once per session
      const notificationShown = sessionStorage.getItem('proNotificationShown');
      if (!notificationShown) {
        showProSubscriptionNotification();
        sessionStorage.setItem('proNotificationShown', 'true');
      }
    }
  }, [user, hasProSubscription, isSubscriptionActive, appSettings]);

  // Fetch app settings and refresh user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch app settings
        const response = await api.get('/api/app-settings/public');
        if (response.data.success) {
          setAppSettings(response.data.settings);
          // If Pro is disabled, redirect to home
          if (!response.data.settings.pro_subscription_enabled) {
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

  // Validate phone number
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Accept 998xxxxxxxxx or 9xxxxxxxx format
    return /^(998\d{9}|9\d{8})$/.test(cleanPhone);
  };

  // Format phone for display
  const formatPhoneInput = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      return digits.slice(0, 12);
    }
    return digits.slice(0, 9);
  };

  // Payment submit handler - InPay integration
  const handlePaymentSubmit = useCallback(async () => {
    if (!phoneNumber || !validatePhone(phoneNumber)) {
      setPaymentError('Telefon raqamini to\'g\'ri kiriting (998xxxxxxxxx)');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    // Try to open a popup immediately to avoid browser popup blocking (user gesture)
    // If blocked, we will fall back to redirecting in the same tab.
    let paymentPopup = null;
    try {
      paymentPopup = window.open('', '_blank', 'noopener,noreferrer');
    } catch (e) {
      paymentPopup = null;
    }

    try {
      const rawAmount = selectedPlan.price[billingCycle];
      const parsedAmount = parseInt(rawAmount);

      // Some plans (e.g., Korporativ) don't have fixed pricing
      if (!Number.isFinite(parsedAmount) || parsedAmount < 1000) {
        const msg = 'Ushbu tarif uchun narx individual. Iltimos admin/qo\'llab-quvvatlash bilan bog\'laning.';
        setPaymentError(msg);
        toast.error(msg);
        try {
          if (paymentPopup && !paymentPopup.closed) paymentPopup.close();
        } catch (_) {
          // ignore
        }
        return;
      }
      
      const response = await api.post('/api/payments/inpay/create', {
        amount: parsedAmount,
        phone: phoneNumber.replace(/\D/g, ''),
        plan: selectedPlan.name,
        billingCycle: billingCycle
      });

      if (response.data.success) {
        // Get payment URL from response (InPay returns pay_url)
        const paymentUrl = response.data.data?.pay_url;
        
        if (paymentUrl) {
          // Redirect to InPay payment page
          toast.success('To\'lov sahifasiga yo\'naltirilmoqda...');
          setShowPaymentModal(false);

          try {
            if (paymentPopup && !paymentPopup.closed) {
              paymentPopup.location.href = paymentUrl;
              paymentPopup.focus();
            } else {
              window.location.assign(paymentUrl);
            }
          } catch (e) {
            // Last resort: same tab
            try {
              if (paymentPopup && !paymentPopup.closed) paymentPopup.close();
            } catch (_) {
              // ignore
            }
            window.location.assign(paymentUrl);
          }
        } else {
          // If no URL, show error
          const msg = 'To\'lov havolasi topilmadi. Iltimos qayta urinib ko\'ring.';
          setPaymentError(msg);
          toast.error(msg);
          try {
            if (paymentPopup && !paymentPopup.closed) paymentPopup.close();
          } catch (_) {
            // ignore
          }
        }
      } else {
        setPaymentError(response.data.message || 'To\'lov yaratishda xatolik');
        toast.error(response.data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      const errorMsg = error.response?.data?.message || 'Server xatosi. Qayta urinib ko\'ring.';
      setPaymentError(errorMsg);
      toast.error(errorMsg);

      // Close blank popup if payment creation failed
      try {
        if (paymentPopup && !paymentPopup.closed) paymentPopup.close();
      } catch (e) {
        // ignore
      }
    } finally {
      setProcessing(false);
    }
  }, [phoneNumber, selectedPlan, billingCycle, updateUser]);

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
        { name: 'Challenge Tizimi', included: true },
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
                      {(index < 3 || index === 5) ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
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

    

      {/* Payment Modal - InPay Integration */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedPlan.name} plan sotib olish
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPhoneNumber('');
                  setPaymentError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* InPay Logo/Info */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">InPay.uz</p>
                    <p className="text-sm text-blue-100">Xavfsiz onlayn to'lov</p>
                  </div>
                  <CreditCard className="w-10 h-10 text-white/80" />
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
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Davomiyligi:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {billingCycle === 'yearly' ? '1 yil' : '1 oy'}
                  </span>
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefon raqamingiz
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(formatPhoneInput(e.target.value));
                    setPaymentError('');
                  }}
                  placeholder="998901234567"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Format: 998XXXXXXXXX (12 raqam)
                </p>
              </div>

              {/* Error Message */}
              {paymentError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {paymentError}
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Xavfsiz to'lov
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      InPay.uz orqali xavfsiz to'lov. Click, PayMe, Uzum va boshqa kartalar qabul qilinadi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => handlePaymentSubmit()}
                disabled={!phoneNumber || processing}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    To'lovga o'tish
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                "To'lovga o'tish" tugmasini bosish orqali siz InPay.uz to'lov sahifasiga yo'naltirilasiz
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
