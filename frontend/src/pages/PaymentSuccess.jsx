import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  
  const [status, setStatus] = useState('checking'); // checking, success, failed, error
  const [message, setMessage] = useState('To\'lov tekshirilmoqda...');
  const [paymentData, setPaymentData] = useState(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus('error');
        setMessage('To\'lov ma\'lumotlari topilmadi');
        return;
      }

      try {
        // Poll for payment status (InPay callback might take a moment)
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = 2000; // 2 seconds

        const checkStatus = async () => {
          try {
            const response = await api.get(`/api/payments/inpay/verify/${orderId}`);
            
            if (response.data.success) {
              if (response.data.status === 'completed' || response.data.status === 'success') {
                setStatus('success');
                setMessage('To\'lov muvaffaqiyatli amalga oshirildi!');
                setPaymentData(response.data.data);
                
                // Refresh user data to get updated subscription
                try {
                  const profileRes = await api.get('/api/user/profile');
                  if (profileRes.data.success && profileRes.data.user) {
                    updateUser(profileRes.data.user);
                  }
                } catch (e) {
                  console.error('Error refreshing user:', e);
                }
                return true;
              } else if (response.data.status === 'rejected' || response.data.status === 'failed') {
                setStatus('failed');
                setMessage('To\'lov amalga oshmadi. Qayta urinib ko\'ring.');
                return true;
              }
            }
            return false;
          } catch (error) {
            console.error('Payment verification error:', error);
            return false;
          }
        };

        // Initial check
        const completed = await checkStatus();
        if (completed) return;

        // Poll for status
        const poll = setInterval(async () => {
          attempts++;
          const completed = await checkStatus();
          
          if (completed || attempts >= maxAttempts) {
            clearInterval(poll);
            
            if (!completed && attempts >= maxAttempts) {
              setStatus('pending');
              setMessage('To\'lov hali tasdiqlanmadi. Biroz kuting yoki keyinroq tekshiring.');
            }
          }
        }, pollInterval);

        return () => clearInterval(poll);
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Xatolik yuz berdi. Keyinroq tekshiring.');
      }
    };

    verifyPayment();
  }, [orderId, updateUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === 'checking' && (
            <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          )}
          {(status === 'failed' || status === 'error') && (
            <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
          {status === 'pending' && (
            <div className="w-20 h-20 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-yellow-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {status === 'checking' && 'To\'lov tekshirilmoqda'}
          {status === 'success' && 'To\'lov muvaffaqiyatli!'}
          {status === 'failed' && 'To\'lov amalga oshmadi'}
          {status === 'error' && 'Xatolik'}
          {status === 'pending' && 'Kutilmoqda'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Payment Details */}
        {status === 'success' && paymentData && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-6 text-left">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Obuna ma'lumotlari:
            </h3>
            <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
              <p><span className="font-medium">Reja:</span> {paymentData.plan}</p>
              <p><span className="font-medium">Davomiyligi:</span> {paymentData.billingCycle === 'yearly' ? '1 yil' : '1 oy'}</p>
              {paymentData.subscriptionEndDate && (
                <p>
                  <span className="font-medium">Tugash sanasi:</span>{' '}
                  {new Date(paymentData.subscriptionEndDate).toLocaleDateString('uz-UZ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Order ID */}
        {orderId && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
            Buyurtma ID: {orderId}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Dashboardga o'tish
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          
          {(status === 'failed' || status === 'error') && (
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Qayta urinish
            </button>
          )}

          {status === 'pending' && (
            <>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
              >
                Qayta tekshirish
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Bosh sahifa
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
