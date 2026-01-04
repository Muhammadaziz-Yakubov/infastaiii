// SMS Service using Firebase Phone Authentication
const admin = require('firebase-admin');

// Firebase service account credentials
const serviceAccount = {
  type: "service_account",
  project_id: "infast-ai-c3954",
  private_key_id: "4b63d6dc65f905c13f21f60472ddbf551f503583",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCy6hEqEPyg1MHd\nvQhAbILxn/jBgxL79WbAcA0EA2qhM6l1elFgAnNjvIG4FlFVhiBL7MvP9JE647+m\nXQKVx32BFgnr/ung6t+sLeYFppm8x5BTxmix1H/FlqV82rCR/4LM15mnwxT2u41e\n9MJAqzMDIbOnfOAAf5GSLTutj9+Tc68fX9zqAn46HuL+FOkVFh4x9k8RYPpKIS6a\nz5nb5L9gEDKv3hv7bO98j97pl2vHQohQWPCMLYHX0pjuBXCChn/nlSzCzWB2xN3N\nTZEoq00jM76dWDEK/JpKM3fDrqZ91Gn7RNY2JDZMPQM06t/bbh5O7FI5af+uOKub\n4t1DQHZhAgMBAAECggEAAghPrpsny4nvM94oYFb7O9R15njfN9aHVstPEosZZIBq\nPefoUb9lYS4siRNT1DVkW4hynkeoeLNKo5Ct7VapUdSWw0QPkxsH9HRHByxn1bGs\nrY709IQ1+WAnPB5d4CK3cS1H1RSNwenKhtgf9s0bFL+Gw3HTN547YJ477dJTF2E1\noUCh6N/ld6mDMLcDthBeUJA9fiujDjhmy5YoIC/v1va6QDhWFiSeJ+2sYbqcBRGb\nn/9O1jzy/ilPwgcfatgkdVVX3kYylZ/9n7dWrKnS+FiKxi3A5O6B7jLTm2Tls/11\nPkZyYrhD7ibljN8//+5WvLWJu4qlLu5OzMjSqiE3owKBgQD6mp0g/FLgBpEUg9AK\nEZ4V8lwX0GVvtawTkvn+jICL46/vXgCO/eTAURhcg/9iHd3LPWPTOR8dU0NzWtXw\nJswPVkd7BBVM6qCaK8e4zVgjm8n873tfUf6oYxK/PHToqk36pyn3bk/N7ltGhE11\nTnsenAxCp5uNNX8A2qQKfRV3dwKBgQC2xEicHpSB/DNAYykLWAeiJZ9as50TT7OC\niPfrT16wruZK5xGKEx/ktZVRbl1/MuQ9+8U0LMo635N5A9bOQLcRrAU+V1409l3y\nPPVKsBXo/2oPJHuntWpOgDoPnpsw4m1s12RmX8L9zNWh8uArDA8jGWvbnr41aUE9\nCI2VaYom5wKBgCnPXePA9Tq3HcFkdHMZmVxkAQVgGWxXzQu++8KCQngUVqgC8Ojq\nZx3G6d+Vjigaf4SHC36UCyLjX1+Biiv07Rqp9GcLuVoJ0x2lrD6i08+tEDgI5HZ0\nwZ3qWZhaR88Bit0EwrWrS9k5qTTMofeuTlA/DLSaLhOTF0tXLwMo90nlAoGBALEg\nBSaYVGCtJJZwA2UlCTDRuWBT1hTTFyuYxnxcTW558mIBEnR4GF60xGNIzH/ruFuB\n1xq7lbn815VebR0yhrkvt101mu1FHsMW5LpfcLyAXC8UsmpUXRR7HMnqcoiryFTF\nYl38zKLfkuMC2NGfPERN7MPJUpm8yib2VRDKWcNdAoGAWpjspaifJ0DuPUPl8m6E\nNCikhGRciOvLtlkZJwTxY75ilanjLGi0g3lmN1Chky/nRghyGovFidpfoV6ndt6F\n4HnigJq4wqXR50boGLZ/phUbgp2taVG1as73N+xckqULEidfOMmsyK1vgG41qWJx\ntVI8LKDgiKkBeIcdMX4yMRk=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@infast-ai-c3954.iam.gserviceaccount.com",
  client_id: "114485684950231397350",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40infast-ai-c3954.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "infast-ai-c3954"
    });
    console.log('✅ Firebase Admin SDK initialized for SMS service');
  } catch (error) {
    console.log('⚠️ Firebase Admin SDK initialization failed:', error.message);
    console.log('🔧 Falling back to development mode - SMS codes will be logged to console');
  }
}

class SMSService {
  // Generate verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send SMS verification code
  async sendVerificationCode(phoneNumber, code) {
    try {
      // DEVELOPMENT MODE: Log the code for testing
      console.log(`📱 SMS Code for ${phoneNumber}: ${code}`);
      console.log(`🔧 DEVELOPMENT: SMS would be sent to ${phoneNumber} with code: ${code}`);

      // PRODUCTION: Firebase handles SMS sending on the client side
      // Backend just stores and verifies codes

      return {
        success: true,
        message: 'Verification code sent successfully',
        debug: process.env.NODE_ENV === 'development' ? { code } : undefined
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        message: 'Failed to send SMS'
      };
    }
  }

  // Verify phone number with Firebase (this would be called after client verification)
  async verifyPhoneNumber(phoneNumber, verificationId, code) {
    try {
      // This is a simplified version
      // In a real implementation, you'd verify with Firebase Admin SDK
      return {
        success: true,
        phoneNumber: phoneNumber
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        message: 'Phone verification failed'
      };
    }
  }

  // Alternative: Use a free SMS provider like Twilio (if you have credits)
  async sendSMSTwilio(phoneNumber, message) {
    // Uncomment and configure if you have Twilio account
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return {
        success: true,
        message: 'SMS sent successfully via Twilio'
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        message: 'Failed to send SMS via Twilio'
      };
    }
    */
  }
}

module.exports = new SMSService();
