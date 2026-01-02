import React, { useState } from 'react';
import { Clock, ArrowLeft, Home, X, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SoonSimple = ({ 
  show = true, 
  title = "Tez kunda", 
  message = "Ushbu sahifa hozirda ishlab chiqilmoqda.",
  estimatedTime = "1-2 hafta"
}) => {
  const [visible, setVisible] = useState(show);
  const navigate = useNavigate();

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
  };

  const handleGoBack = () => {
    navigate(-1);
    handleClose();
  };

  const handleGoHome = () => {
    navigate('/');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Blur background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
        
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">Taxminiy vaqt: <strong>{estimatedTime}</strong></span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-10 h-10 text-gray-500" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-3">Ustida ishlayabmiz</h3>
            <p className="text-gray-600 mb-4">
              {message}<br />
              Tez orada sizning xizmatingizda bo'ladi!
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Ishlanmoqda
            </div>
          </div>

       

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Oldingi sahifaga qaytish
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Bosh sahifaga o'tish
            </button>
            
    
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500">
            Yangiliklarni kuzatib boring
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoonSimple;