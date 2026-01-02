// Email Service using Gmail SMTP
const nodemailer = require('nodemailer');

// Create Gmail transporter
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('❌ EMAIL CONFIGURATION MISSING!');
    console.error('📧 Email service unavailable. Please configure EMAIL_USER and EMAIL_PASS in .env file');
    return null;
  }

  console.log('📧 Using Gmail SMTP for email service');
  console.log(`📧 From: ${emailUser}`);

  // Simple Gmail configuration
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass // App Password
    },
    // Debug in all environments to troubleshoot
    debug: true,
    logger: true
  });
};

class EmailService {
  // Generate verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification code via email
  async sendVerificationCode(email, firstName, code) {
    const transporter = createTransporter();

    // Email configuration required - no fallbacks
    if (!transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }

    try {
      console.log(`📤 Sending verification email to: ${email}`);
      console.log(`🔢 Code: ${code}`);

      // Verify connection before sending
      console.log('🔍 Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified');

      const mailOptions = {
        from: `"InFast AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email tasdiqlash kodi - InFast AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">InFast AI</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Salom, ${firstName}!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ro'yxatdan o'tish uchun email manzilingizni tasdiqlash kerak. Quyidagi kodni kiriting:
              </p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</div>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Bu kod 10 daqiqa davomida amal qiladi. Agar siz bu so'rovni yubormagan bo'lsangiz, e'tiborsiz qoldiring.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                © 2026 InFast AI Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        `
      };

      console.log('📧 Mail options prepared, sending...');
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Gmail: Verification email sent to ${email}`);
      console.log('📧 Send result:', result.messageId);

      return {
        success: true,
        message: 'Verification code sent to email'
      };
    } catch (error) {
      console.error('❌ Email sending error:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error command:', error.command);

      // Log full error for debugging
      console.error('Full error details:', error);

      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

module.exports = new EmailService();

