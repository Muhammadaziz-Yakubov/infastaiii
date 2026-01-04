// Comprehensive debug script for login issues
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugLogin() {
  try {
    console.log('🔍 Starting login debug...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/infast-ai');
    console.log('✅ Connected to MongoDB');

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

      if (emailUser.password) {
        // Test with wrong password
        const wrongPasswordValid = await emailUser.comparePassword('wrongpassword123');
        console.log(`   Wrong password test: ${wrongPasswordValid ? '❌ FAILED' : '✅ PASSED'}`);

        // Test with empty password
        const emptyPasswordValid = await emailUser.comparePassword('');
        console.log(`   Empty password test: ${emptyPasswordValid ? '❌ FAILED' : '✅ PASSED'}`);

        // Show password hash info
        console.log(`   Password hash length: ${emailUser.password.length}`);
        console.log(`   Password starts with $2: ${emailUser.password.startsWith('$2')}`);
      } else {
        console.log('   ❌ User has no password set - this will cause login failure');
      }
    } else {
      console.log('1️⃣ No email users found to test');
    }

    // Test 2: Phone login
    const phoneUser = users.find(u => u.phone && u.authProvider === 'phone');
    if (phoneUser) {
      console.log(`\n2️⃣ Testing phone login for: ${phoneUser.phone}`);
      console.log(`   User has password: ${!!phoneUser.password}`);
    } else {
      console.log('2️⃣ No phone users found to test');
    }

    // Test 3: Google users
    const googleUsers = users.filter(u => u.authProvider === 'google');
    if (googleUsers.length > 0) {
      console.log(`\n3️⃣ Found ${googleUsers.length} Google users (should not use password login)`);
      googleUsers.forEach(user => {
        console.log(`   - ${user.email} (has password: ${!!user.password})`);
      });
    }

    // Test 4: Database constraints
    console.log('\n4️⃣ Testing database constraints...');
    try {
      const duplicateEmail = await User.find({ email: { $exists: true, $ne: null } }).sort({ email: 1 });
      const emails = duplicateEmail.map(u => u.email);
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      if (duplicates.length > 0) {
        console.log(`   ⚠️  Duplicate emails found: ${duplicates.join(', ')}`);
      } else {
        console.log('   ✅ No duplicate emails found');
      }
    } catch (error) {
      console.log(`   ❌ Error checking duplicates: ${error.message}`);
    }

    console.log('\n🎯 Summary:');
    console.log('- If password login fails, check:');
    console.log('  1. User exists and has email auth provider');
    console.log('  2. User has a password set');
    console.log('  3. Password comparison is working');
    console.log('  4. Account is active (isActive: true)');

    process.exit(0);

  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
}

debugLogin();
