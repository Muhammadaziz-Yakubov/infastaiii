// Test script for login functionality
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/infast-ai');
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database:`);

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 Try registering a user first through the frontend');
      process.exit(0);
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Auth Provider: ${user.authProvider}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Is Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('---');
    });

    // Test login scenarios
    console.log('\n🧪 Testing login scenarios...');

    // Test 1: Email login
    const emailUser = users.find(u => u.email && u.authProvider === 'email');
    if (emailUser) {
      console.log(`\n1️⃣ Testing email login for: ${emailUser.email}`);
      console.log(`   User has password: ${!!emailUser.password}`);
      console.log(`   User is active: ${emailUser.isActive}`);

      if (emailUser.password) {
        // Test with common passwords
        const testPasswords = ['123456', 'password', 'test123'];
        for (const testPass of testPasswords) {
          const isValid = await emailUser.comparePassword(testPass);
          console.log(`   Password '${testPass}' valid: ${isValid ? '✅' : '❌'}`);
        }
      } else {
        console.log('   ❌ User has no password set - this will cause login failure');
      }
    } else {
      console.log('1️⃣ No email users found to test');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
