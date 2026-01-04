import React, { useState } from 'react';
import { 
  Smartphone, 
  Shield, 
  Zap, 
  Star, 
  CheckCircle,
  ArrowRight,
  Smartphone as Android,
  Globe,
  Users,
  Clock
} from 'lucide-react';

const Download = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // APK faylini yuklash
    const link = document.createElement('a');
    link.href = '/infastai.apk'; // APK fayl public folderida bo'lishi kerak
    link.download = 'infastai.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 3 soniyadan keyin holatni tiklash
    setTimeout(() => setIsDownloading(false), 3000);
  };

  const features = [
    {
      icon: Zap,
      title: 'Tez va Samarali',
      description: 'Kunlik vazifalaringizni tez boshqaring'
    },
    {
      icon: Shield,
      title: 'Xavfsiz',
      description: 'Ma\'lumotlaringiz to\'liq himoyalangan'
    },
    {
      icon: Users,
      title: 'Ijtimoiy',
      description: 'Do\'stlaringiz bilan birga rivojlaning'
    },
    {
      icon: Star,
      title: 'Mukofotlar',
      description: 'Yutuqlaringiz bilan ball to\'plang'
    }
  ];

  const stats = [
    { label: 'Foydalanuvchilar', value: '10K+' },
    { label: 'Vazifalar bajarildi', value: '50K+' },
    { label: 'Reyting', value: '4.8' },
    { label: 'Mamlakatlar', value: '15+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              Mobil ilova endi mavjud
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              InFast AI
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-blue-600 dark:text-blue-400 mt-2">
                Hayotingizni boshqaring
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Kunlik vazifalaringizni kuzating, moliyangizni boshqaring, maqsadlaringizga erishing. 
              Hammasi bir ilovada - tez, qulay va samarali.
            </p>

            {/* Download Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
                  isDownloading
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isDownloading ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-6 h-6" />
                    Android APK Yuklash
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Android className="w-5 h-5" />
                <span className="text-sm">Android 7.0+</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nima uchun InFast AI?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Zamonaviy texnologiya va foydalanuvchi tajribasi uchun yaratilgan ilova
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Install */}
      <div className="bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Qanday o'rnatish kerak
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ilovani o'rnatish juda oson - faqat 3 qadam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Yuklab oling
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yuqoridagi tugmani bosib APK faylini yuklab oling
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Ruxsat bering
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                "Noma'lum manbadan o'rnatish"ga ruxsat bering
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Foydalaning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ilovani oching va ro'yxatdan o'ting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Hayotingizni boshqarishni boshlang
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Bugun o'zingiz va do'stlaringiz uchun yaxshiroq kun yarating
            </p>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
                isDownloading ? 'cursor-not-allowed opacity-75' : 'hover:shadow-xl'
              }`}
            >
              {isDownloading ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <ArrowRight className="w-6 h-6" />
                  Ilovani Yuklash
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                www.infastproject.uz
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 InFast AI. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
