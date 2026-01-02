import React from 'react';
import { Ban, MessageCircle, AlertTriangle } from 'lucide-react';

const BannedPage = () => {
  const handleContactAdmin = () => {
    window.open('https://t.me/mister_yakubov', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-900 to-black px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-red-500/30">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600/20 rounded-full mb-6 animate-pulse">
              <Ban className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hisobingiz bloklandi
            </h1>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <p className="text-red-200 text-lg mb-2">
                    Sizning hisobingiz administrator tomonidan bloklangan.
                  </p>
                  <p className="text-red-300/70 text-sm">
                    Bu qoidalarni buzganlik yoki boshqa sabablar bilan bog'liq bo'lishi mumkin.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-lg">
                Agar bu xato deb hisoblasangiz yoki qo'shimcha ma'lumot olmoqchi bo'lsangiz, 
                iltimos administrator bilan bog'laning.
              </p>

              <button
                onClick={handleContactAdmin}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
              >
                <MessageCircle className="w-5 h-5" />
                Admin bilan bog'lanish
              </button>

              <p className="text-gray-500 text-sm mt-4">
                Telegram: @mister_yakubov
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Agar sizda savollar bo'lsa, administrator sizga yordam beradi
          </p>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;
