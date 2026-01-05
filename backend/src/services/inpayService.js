/**
 * InPay.uz Payment Service
 * 
 * Handles all InPay payment gateway operations:
 * - Bearer token authentication
 * - Payment creation
 * - Transaction status checking
 */

const axios = require('axios');

// InPay API Configuration
const INPAY_BASE_URL = 'https://inpay.uz/api/v1';
const INPAY_CREATE_URL = 'https://inpay.uz/create/';

// Token cache (valid for 24 hours)
let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get Bearer Token from InPay
 * Token is cached for 23 hours (1 hour buffer before 24h expiry)
 */
const getBearerToken = async () => {
  try {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }

    const merchantId = process.env.INPAY_MERCHANT_ID;
    const merchantToken = process.env.INPAY_MERCHANT_TOKEN;

    if (!merchantId || !merchantToken) {
      throw new Error('InPay credentials not configured. Set INPAY_MERCHANT_ID and INPAY_MERCHANT_TOKEN in environment variables.');
    }

    const response = await axios.get(`${INPAY_BASE_URL}/authorization/`, {
      params: {
        merchant_id: merchantId,
        merchant_token: merchantToken
      },
      timeout: 10000
    });

    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      // Cache for 23 hours (1 hour buffer)
      tokenExpiresAt = Date.now() + (23 * 60 * 60 * 1000);
      
      console.log('✅ InPay Bearer token obtained successfully');
      return cachedToken;
    }

    throw new Error('Invalid response from InPay authorization endpoint');
  } catch (error) {
    console.error('❌ InPay getBearerToken error:', error.message);
    
    // Clear cached token on error
    cachedToken = null;
    tokenExpiresAt = null;

    if (error.response) {
      throw new Error(`InPay auth failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
};

/**
 * Create a new payment
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.order_id - Unique order ID
 * @param {number} paymentData.amount - Amount in UZS (minimum 1000)
 * @param {string} paymentData.phone - Customer phone (998xxxxxxxxx or 9xxxxxxxx)
 * @param {string} paymentData.description - Payment description
 * @param {string} paymentData.callback_url - Webhook URL for payment notifications
 * @param {string} paymentData.return_url - URL to redirect after payment
 * @returns {Object} Payment creation response with payment URL
 */
const createPayment = async (paymentData) => {
  try {
    const token = await getBearerToken();

    const { order_id, amount, phone, description, callback_url, return_url } = paymentData;

    // Validate required fields
    if (!order_id) throw new Error('order_id is required');
    if (!amount || amount < 1000) throw new Error('amount must be at least 1000 UZS');
    if (!phone) throw new Error('phone is required');

    // Validate phone format
    const phoneRegex = /^(998\d{9}|9\d{8})$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      throw new Error('Invalid phone format. Use 998xxxxxxxxx or 9xxxxxxxx');
    }

    const payload = {
      order_id,
      amount: parseInt(amount),
      phone: phone.replace(/\D/g, ''), // Remove non-digits
      description: description || `Payment for order ${order_id}`,
      callback_url: callback_url || process.env.INPAY_CALLBACK_URL,
      return_url: return_url || process.env.INPAY_RETURN_URL
    };

    const response = await axios.post(INPAY_CREATE_URL, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ InPay payment created:', order_id);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ InPay createPayment error:', error.message);

    if (error.response) {
      return {
        success: false,
        error: `InPay payment creation failed: ${error.response.status}`,
        details: error.response.data
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check transaction status
 * @param {string} orderId - Order ID to check
 * @returns {Object} Transaction status
 */
const checkTransactionStatus = async (orderId) => {
  try {
    const token = await getBearerToken();

    if (!orderId) {
      throw new Error('order_id is required');
    }

    const response = await axios.get(`${INPAY_BASE_URL}/transactions/`, {
      params: {
        order_id: orderId
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    console.log('✅ InPay transaction status checked:', orderId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ InPay checkTransactionStatus error:', error.message);

    if (error.response) {
      return {
        success: false,
        error: `InPay status check failed: ${error.response.status}`,
        details: error.response.data
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate payment input
 * @param {number} amount - Payment amount
 * @param {string} phone - Customer phone
 * @returns {Object} Validation result
 */
const validatePaymentInput = (amount, phone) => {
  const errors = [];

  // Validate amount
  if (!amount || isNaN(amount)) {
    errors.push('Amount is required and must be a number');
  } else if (amount < 1000) {
    errors.push('Amount must be at least 1000 UZS');
  }

  // Validate phone
  if (!phone) {
    errors.push('Phone number is required');
  } else {
    const cleanPhone = phone.toString().replace(/\D/g, '');
    const phoneRegex = /^(998\d{9}|9\d{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Invalid phone format. Use 998xxxxxxxxx or 9xxxxxxxx');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Clear cached token (useful for testing or forced refresh)
 */
const clearTokenCache = () => {
  cachedToken = null;
  tokenExpiresAt = null;
  console.log('🔄 InPay token cache cleared');
};

module.exports = {
  getBearerToken,
  createPayment,
  checkTransactionStatus,
  validatePaymentInput,
  clearTokenCache
};
