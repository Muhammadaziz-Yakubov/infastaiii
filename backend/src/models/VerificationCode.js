const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const verificationCodeSchema = new mongoose.Schema({
  // Target identifier (email or phone)
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    sparse: true,
    trim: true
  },

  // Hashed OTP code for security
  codeHash: {
    type: String,
    required: true
  },

  // OTP type
  type: {
    type: String,
    enum: ['email_verification', 'phone_verification', 'password_reset'],
    required: true
  },

  // Usage tracking
  used: {
    type: Boolean,
    default: false
  },

  attempts: {
    type: Number,
    default: 0,
    max: 3 // Max 3 attempts
  },

  // Expiration (5 minutes for OTP)
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
verificationCodeSchema.index({ email: 1, type: 1 });
verificationCodeSchema.index({ phone: 1, type: 1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired codes

// Instance methods
verificationCodeSchema.methods.verifyCode = async function(code) {
  // Normalize input code - ensure it's a string
  const normalizedCode = String(code).trim();
  
  if (this.used) {
    throw new Error('Code already used');
  }

  if (this.expiresAt < new Date()) {
    throw new Error('Code expired');
  }

  if (this.attempts >= 3) {
    throw new Error('Too many attempts');
  }

  // Verify code - ensure both are strings
  if (!this.codeHash) {
    throw new Error('Code hash not found');
  }

  const isValid = await bcrypt.compare(normalizedCode, this.codeHash);
  
  if (!isValid) {
    this.attempts += 1;
    await this.save();
    
    // Debug in development
    if (process.env.NODE_ENV === 'development') {
      console.error('OTP verification failed:', {
        inputCode: normalizedCode,
        inputLength: normalizedCode.length,
        attempts: this.attempts,
        expiresAt: this.expiresAt,
        now: new Date()
      });
    }
    
    throw new Error('Invalid code');
  }

  // Mark as used
  this.used = true;
  await this.save();

  return true;
};

// Static method to create OTP
verificationCodeSchema.statics.createOTP = async function(identifier, type) {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Ensure code is exactly 6 digits
  if (code.length !== 6) {
    throw new Error('Failed to generate valid OTP code');
  }
  
  // Hash the code
  const codeHash = await bcrypt.hash(code, 10);

  const otpData = {
    codeHash,
    type,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  };

  if (type === 'email_verification') {
    otpData.email = identifier.toLowerCase().trim();
  } else {
    otpData.phone = identifier.trim();
  }

  const otp = new this(otpData);
  await otp.save();

  return { otp, code };
};

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);