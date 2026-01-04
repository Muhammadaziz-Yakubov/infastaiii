const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get a setting
appSettingsSchema.statics.getSetting = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set a setting
appSettingsSchema.statics.setSetting = async function(key, value, description = '', userId = null) {
  return await this.findOneAndUpdate(
    { key },
    { 
      value, 
      description,
      updatedBy: userId 
    },
    { upsert: true, new: true }
  );
};

// Initialize default settings
appSettingsSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'pro_subscription_enabled',
      value: false,
      description: 'Pro obuna sotib olish imkoniyati'
    },
    {
      key: 'challenges_enabled',
      value: false,
      description: 'Challengelar funksiyasi'
    },
    {
      key: 'pro_monthly_price',
      value: 39000,
      description: 'Pro oylik narxi (so\'m)'
    },
    {
      key: 'pro_yearly_price',
      value: 399000,
      description: 'Pro yillik narxi (so\'m)'
    },
    {
      key: 'payment_card_number',
      value: '9860 0607 0978 0345',
      description: 'To\'lov kartasi raqami'
    },
    {
      key: 'payment_card_holder',
      value: 'Muhammadaziz Yakubov',
      description: 'Karta egasi ismi'
    },
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Texnik ishlar rejimi'
    }
  ];

  for (const setting of defaults) {
    const exists = await this.findOne({ key: setting.key });
    if (!exists) {
      await this.create(setting);
    }
  }
};

module.exports = mongoose.model('AppSettings', appSettingsSchema);
