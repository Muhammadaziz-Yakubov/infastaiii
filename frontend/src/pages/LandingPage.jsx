import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  Target, 
  CheckSquare, 
  Wallet, 
  TrendingUp,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Star,
  Award,
  Clock,
  BarChart3,
  Smartphone,
  Globe,
  ChevronRight,
  Play,
  Check,
  MessageSquare,
  Brain,
  Rocket,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedTasks: 0,
    completedGoals: 0,
    averageRating: 4.9
  });
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in - redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const features = [
    {
      icon: CheckSquare,
      title: 'Vazifalar Boshqaruvi',
      description: 'Kundalik vazifalaringizni oson boshqaring. Pomodoro timer bilan samaradorlikni oshiring.',
      color: 'from-blue-500 to-cyan-500',
      stats: '250+ vazifa bajarildi'
    },
    {
      icon: Target,
      title: 'Maqsadlar Tracking',
      description: 'Moliyaviy va shaxsiy maqsadlaringizga erishing. Real-time progress monitoring.',
      color: 'from-purple-500 to-pink-500',
      stats: '25+ maqsad erishildi'
    },
    {
      icon: Wallet,
      title: 'Moliya Menejment',
      description: 'Daromad va xarajatlaringizni kuzating. Byudjet rejalashtiring va tahlil qiling.',
      color: 'from-green-500 to-emerald-500',
      stats: '$1M+ boshqarildi'
    },
    {
      icon: Brain,
      title: 'AI Yordamchi',
      description: 'Sun\'iy intellekt sizga maslahatlar beradi va samaradorlikni oshiradi.',
      color: 'from-orange-500 to-red-500',
      stats: '1,000+ maslahat'
    }
  ];

  // Load real statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/public/stats`);
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num + '+';
  };

  const statsDisplay = [
    { icon: Users, value: '500+', label: 'Foydalanuvchilar' },
    { icon: CheckSquare, value: '250+', label: 'Bajarilgan Vazifalar' },
    { icon: Target, value: '25+', label: 'Erishilgan Maqsadlar' },
    { icon: Star, value: stats.averageRating.toFixed(1) + '/5', label: 'Reyting' }
  ];

  const testimonials = [
    {
      name: 'Aziz Karimov',
      role: 'Tadbirkor',
      image: '👨‍💼',
      text: 'InFast AI mening biznesimni boshqarishda juda katta yordam berdi. Barcha vazifalar bir joyda!',
      rating: 5
    },
    {
      name: 'Malika Toshmatova',
      role: 'Talaba',
      image: '👩‍🎓',
      text: 'Maqsadlarimga erishishda eng yaxshi yordamchi. Pomodoro timer ajoyib!',
      rating: 5
    },
    {
      name: 'Sardor Aliyev',
      role: 'Dasturchi',
      image: '👨‍💻',
      text: 'Moliyaviy maqsadlarimni kuzatish uchun eng yaxshi platforma. Tavsiya qilaman!',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Bepul',
      price: '0',
      period: 'oyiga',
      features: [
        '10 ta vazifa',
        '3 ta maqsad',
        'Asosiy statistika',
        'Email qo\'llab-quvvatlash'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '49,000',
      period: 'oyiga',
      features: [
        'Cheksiz vazifalar',
        'Cheksiz maqsadlar',
        'AI maslahatlar',
        'Kengaytirilgan statistika',
        'Prioritet qo\'llab-quvvatlash',
        'Telegram integratsiya'
      ],
      popular: true
    },
    {
      name: 'Biznes',
      price: '99,000',
      period: 'oyiga',
      features: [
        'Barcha Pro xususiyatlar',
        'Jamoa boshqaruvi',
        'API kirish',
        'Maxsus integratsiyalar',
        '24/7 qo\'llab-quvvatlash',
        'Shaxsiy menejer'
      ],
      popular: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-8 sm:mb-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InFast AI
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="hidden sm:block px-4 sm:px-6 py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm sm:text-base"
              >
                Kirish
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
              >
                Boshlash
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 sm:mb-6">
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                  O'zbekistondagi #1 Platform
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                Hayotingizni
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI </span>
                bilan boshqaring
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Vazifalar, maqsadlar va moliyangizni bir joyda boshqaring. 
                Sun'iy intellekt yordamida samaradorligingizni 10x oshiring.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all flex items-center justify-center gap-2 group text-sm sm:text-base"
                >
                  Bepul Boshlash
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Video Ko'rish
                </button>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {['👨‍💼', '👩‍💻', '👨‍🎓', '👩‍🏫'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm sm:text-lg border-2 border-white dark:border-gray-900">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 sm:gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">500+</span> foydalanuvchi
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700">
                {/* Feature Cards Animation */}
                <div className="space-y-3 sm:space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ 
                        opacity: activeFeature === index ? 1 : 0.3,
                        x: activeFeature === index ? 0 : 20,
                        scale: activeFeature === index ? 1 : 0.95
                      }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} text-white`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                          <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg">{feature.title}</h3>
                          <p className="text-xs sm:text-sm text-white/80">{feature.stats}</p>
                        </div>
                      </div>
                      <p className="text-white/90 text-xs sm:text-sm">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                <Award className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <Check className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {statsDisplay.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Barcha Imkoniyatlar Bir Joyda
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Hayotingizni boshqarish uchun kerak bo'lgan barcha vositalar
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all text-sm sm:text-base">
                  Batafsil
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Foydalanuvchilar Fikri
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
              Minglab foydalanuvchilar bizga ishonadi
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-3xl sm:text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              O'zingizga Mos Rejani Tanlang
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Har qanday ehtiyoj uchun moslashtirilgan rejalar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-2xl scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                    Eng Mashhur
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      so'm / {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/auth/register')}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Boshlash
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Bugun Boshqacha Hayot Boshlang
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 px-4">
              {formatNumber(stats.totalUsers)} foydalanuvchi allaqachon o'z hayotlarini o'zgartirdi. Navbat sizda!
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-white text-blue-600 rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2 sm:gap-3 group"
            >
              Bepul Boshlash
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-lg sm:text-xl font-bold">InFast AI</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                O'zbekistondagi eng yaxshi productivity platform
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Mahsulot</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#features" className="hover:text-white transition-colors">Xususiyatlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Narxlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yangiliklar</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Kompaniya</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Biz haqimizda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aloqa</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Ijtimoiy tarmoqlar</h4>
              <div className="flex gap-2 sm:gap-3">
                <a href="https://t.me/infastai" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2026 InFast AI. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
