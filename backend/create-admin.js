// create-admin.js - Script to create admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB ga ulandi');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      phone: '+998937435225',
      isAdmin: true
    });

    if (existingAdmin) {
      console.log('❌ Admin allaqachon mavjud:', existingAdmin.phone);
      return;
    }

    // Create admin user
    const adminUser = new User({
      phone: '+998937435225',
      password: 'Azizbek0717',
      firstName: 'Muhammadaziz',
      lastName: 'Admin',
      authProvider: 'phone',
      isAdmin: true,
      isActive: true,
      isBanned: false,
      emailVerified: true,
      subscriptionType: 'enterprise'
    });

    await adminUser.save();

    console.log('✅ Admin foydalanuvchi yaratildi:');
    console.log('   Telefon:', adminUser.phone);
    console.log('   Ism:', adminUser.firstName, adminUser.lastName);
    console.log('   Admin status:', adminUser.isAdmin);

  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB ulanishi yopildi');
  }
}

// Run the script
createAdminUser();
