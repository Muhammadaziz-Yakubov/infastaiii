// src/pages/NotFoundPage.jsx - Professional 404 Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Zap } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-2xl text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full mb-8 border border-blue-500/20">
          <Search className="w-12 h-12 text-blue-400" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Sahifa topilmadi
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
          Sahifa manzilini tekshiring yoki bosh sahifaga qayting.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Bosh sahifa
          </button>

          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga qaytish
          </button>
        </div>

      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default NotFoundPage;
