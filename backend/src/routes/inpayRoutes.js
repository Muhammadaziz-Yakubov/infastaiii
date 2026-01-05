/**
 * InPay.uz Payment Routes
 * 
 * Endpoints:
 * - POST /api/payments/inpay/create - Create a new payment
 * - GET /api/payments/inpay/status/:order_id - Check payment status
 * - POST /api/payments/inpay/callback - Webhook callback from InPay
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const inpayService = require('../services/inpayService');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Payment = require('../models/Payment');

// ============================================
// POST /api/payments/inpay/create
// Create a new InPay payment
// Protected route - requires authentication
// ============================================
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { amount, phone, plan, billingCycle } = req.body;

    // Validate input
    const validation = inpayService.validatePaymentInput(amount, phone);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Validate plan
    const validPlans = ['Pro', 'Family', 'Enterprise'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be one of: Pro, Family, Enterprise'
      });
    }

    // Validate billing cycle
    const validCycles = ['monthly', 'yearly'];
    if (!billingCycle || !validCycles.includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Must be monthly or yearly'
      });
    }

    // Generate unique order ID
    const orderId = `INF-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Get callback URL from environment or construct it
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const callbackUrl = process.env.INPAY_CALLBACK_URL || `${baseUrl}/api/payments/inpay/callback`;
    const returnUrl = process.env.INPAY_RETURN_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create payment record in database first
    const payment = new Payment({
      userId: req.userId,
      plan,
      billingCycle,
      amount: parseInt(amount),
      receiptUrl: '', // No receipt for InPay
      status: 'pending',
      inpayOrderId: orderId
    });
    await payment.save();

    // Create InPay payment
    const paymentResult = await inpayService.createPayment({
      order_id: orderId,
      amount: parseInt(amount),
      phone: phone.toString().replace(/\D/g, ''),
      description: `InFast AI ${plan} - ${billingCycle === 'yearly' ? 'Yillik' : 'Oylik'} obuna`,
      callback_url: callbackUrl,
      return_url: `${returnUrl}/payment/success?order_id=${orderId}`
    });

    if (!paymentResult.success) {
      // Update payment status to failed
      payment.status = 'rejected';
      payment.rejectedReason = paymentResult.error;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment creation failed',
        error: paymentResult.error,
        details: paymentResult.details
      });
    }

    // Update payment with InPay response data
    if (paymentResult.data) {
      payment.inpayTransactionId = paymentResult.data.transaction_id;
      await payment.save();
    }

    console.log('✅ InPay payment initiated:', orderId);
    console.log('🔍 InPay response data:', JSON.stringify(paymentResult.data, null, 2));

    res.json({
      success: true,
      message: 'Payment created successfully',
      data: {
        orderId,
        paymentId: payment._id,
        paymentUrl: paymentResult.data?.payment_url || paymentResult.data?.url || paymentResult.data?.pay_url,
        ...paymentResult.data
      }
    });

  } catch (error) {
    console.error('❌ InPay create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/payments/inpay/status/:order_id
// Check payment status
// Protected route - requires authentication
// ============================================
router.get('/status/:order_id', authMiddleware, async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'order_id is required'
      });
    }

    // Check local database first
    const payment = await Payment.findOne({ inpayOrderId: order_id });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user owns this payment
    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get status from InPay
    const statusResult = await inpayService.checkTransactionStatus(order_id);

    res.json({
      success: true,
      data: {
        orderId: order_id,
        localStatus: payment.status,
        plan: payment.plan,
        billingCycle: payment.billingCycle,
        amount: payment.amount,
        createdAt: payment.createdAt,
        inpayStatus: statusResult.success ? statusResult.data : null
      }
    });

  } catch (error) {
    console.error('❌ InPay status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// POST /api/payments/inpay/callback
// Webhook callback from InPay
// Public route - no authentication (called by InPay)
// ============================================
router.post('/callback', async (req, res) => {
  try {
    const { order_id, status, amount, transaction_id, created_at } = req.body;

    console.log('📥 InPay callback received:', {
      order_id,
      status,
      amount,
      transaction_id,
      created_at,
      body: req.body
    });

    // Validate required fields
    if (!order_id) {
      console.error('❌ InPay callback: Missing order_id');
      return res.status(200).json({ success: true, message: 'Received' });
    }

    // Find payment in database
    const payment = await Payment.findOne({ inpayOrderId: order_id });

    if (!payment) {
      console.error('❌ InPay callback: Payment not found for order_id:', order_id);
      // Still return 200 to acknowledge receipt
      return res.status(200).json({ success: true, message: 'Received' });
    }

    // Process based on status
    if (status === 'success' || status === 'completed' || status === 'paid') {
      // Payment successful - update payment status
      payment.status = 'approved';
      payment.approvedAt = new Date();
      payment.inpayTransactionId = transaction_id;

      // Calculate subscription end date
      const now = new Date();
      if (payment.billingCycle === 'yearly') {
        payment.subscriptionEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        payment.subscriptionEndDate = new Date(now.setMonth(now.getMonth() + 1));
      }

      await payment.save();

      // Update user subscription
      await User.findByIdAndUpdate(payment.userId, {
        subscriptionType: payment.plan === 'Pro' ? 'premium' : 
                         payment.plan === 'Enterprise' ? 'enterprise' : 'premium',
        subscriptionPlan: payment.plan,
        subscriptionStatus: 'active',
        subscriptionEndDate: payment.subscriptionEndDate
      });

      console.log('✅ InPay payment completed:', order_id);
      console.log('✅ User subscription activated:', payment.userId);

    } else if (status === 'failed' || status === 'cancelled') {
      // Payment failed
      payment.status = 'rejected';
      payment.rejectedReason = `InPay status: ${status}`;
      await payment.save();

      console.log('❌ InPay payment failed:', order_id, status);

    } else {
      // Unknown status - log but don't change
      console.log('⚠️ InPay callback unknown status:', status, 'for order:', order_id);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Callback processed'
    });

  } catch (error) {
    console.error('❌ InPay callback processing error:', error);
    // Still return 200 to prevent InPay from retrying
    res.status(200).json({
      success: true,
      message: 'Received with error'
    });
  }
});

// ============================================
// GET /api/payments/inpay/verify/:order_id
// Manual verification endpoint (for frontend polling)
// Protected route - requires authentication
// ============================================
router.get('/verify/:order_id', authMiddleware, async (req, res) => {
  try {
    const { order_id } = req.params;

    // Find payment
    const payment = await Payment.findOne({ inpayOrderId: order_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify ownership
    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If already approved, return success
    if (payment.status === 'approved') {
      return res.json({
        success: true,
        status: 'completed',
        message: 'Payment completed successfully',
        data: {
          plan: payment.plan,
          billingCycle: payment.billingCycle,
          subscriptionEndDate: payment.subscriptionEndDate
        }
      });
    }

    // If pending, check with InPay
    if (payment.status === 'pending') {
      const statusResult = await inpayService.checkTransactionStatus(order_id);

      if (statusResult.success && statusResult.data) {
        const inpayStatus = statusResult.data.status;

        if (inpayStatus === 'completed' || inpayStatus === 'success' || inpayStatus === 'paid') {
          // Update payment
          payment.status = 'approved';
          payment.approvedAt = new Date();

          const now = new Date();
          if (payment.billingCycle === 'yearly') {
            payment.subscriptionEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
          } else {
            payment.subscriptionEndDate = new Date(now.setMonth(now.getMonth() + 1));
          }

          await payment.save();

          // Update user
          await User.findByIdAndUpdate(payment.userId, {
            subscriptionType: payment.plan === 'Pro' ? 'premium' : 'enterprise',
            subscriptionPlan: payment.plan,
            subscriptionStatus: 'active',
            subscriptionEndDate: payment.subscriptionEndDate
          });

          return res.json({
            success: true,
            status: 'completed',
            message: 'Payment completed successfully',
            data: {
              plan: payment.plan,
              billingCycle: payment.billingCycle,
              subscriptionEndDate: payment.subscriptionEndDate
            }
          });
        }
      }
    }

    // Return current status
    res.json({
      success: true,
      status: payment.status,
      message: payment.status === 'rejected' ? 'Payment failed' : 'Payment pending'
    });

  } catch (error) {
    console.error('❌ InPay verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
