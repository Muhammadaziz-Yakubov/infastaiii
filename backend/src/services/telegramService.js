// Telegram Bot Service for OTP verification
const TelegramBot = require('node-telegram-bot-api');
const VerificationCode = require('../models/VerificationCode');

class TelegramService {
  constructor() {
    this.bot = null;
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.adminGroupId = process.env.TELEGRAM_ADMIN_GROUP_ID;
    this.requiredChannelId = '-1003532739929'; // Majburiy obuna kanali
    this.channelUrl = 'https://t.me/infastai'; // Kanal URL
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) {
      console.log('⚠️  Telegram bot already initialized, skipping...');
      return;
    }

    if (this.botToken) {
      try {
        await this.initializeBot();
        this.isInitialized = true;
      } catch (error) {
        console.error('❌ Failed to initialize Telegram bot:', error);
      }
    } else {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN not configured. Telegram bot features will be disabled.');
    }
  }

  async initializeBot() {
    try {
      console.log('🤖 Initializing Telegram bot...');
      console.log('🤖 Bot token:', this.botToken ? '***' + this.botToken.slice(-10) : 'NOT SET');

      if (!this.botToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN is not set!');
        return;
      }

      // MUHIM: Production da FAQAT webhook, polling yo'q!
      const options = process.env.NODE_ENV === 'production'
        ? {
            webHook: false // Express o'zi webhook routeni boshqaradi
          }
        : { polling: true };

      console.log('🤖 Bot mode:', process.env.NODE_ENV === 'production' ? 'webhook (manual)' : 'polling');

      // Create bot instance
      this.bot = new TelegramBot(this.botToken, options);

      console.log('🤖 Telegram bot initialized successfully');

      // Test bot connection
      try {
        const botInfo = await this.bot.getMe();
        console.log('🤖 Bot connected successfully:', botInfo.username);

        // Production da webhook ni ALOHIDA o'rnatamiz
        if (process.env.NODE_ENV === 'production') {
          const baseUrl = process.env.RENDER_EXTERNAL_URL ||
                         `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` ||
                         'https://infastaiii.onrender.com';
          const webhookUrl = `${baseUrl}/api/auth/telegram/webhook`;

          console.log('🔗 Setting webhook to:', webhookUrl);
          
          // Avval eski webhookni o'chirish
          await this.bot.deleteWebHook();
          console.log('🗑️  Old webhook deleted');
          
          // Yangi webhookni o'rnatish
          await this.bot.setWebHook(webhookUrl);
          console.log('✅ Webhook set successfully');
        }
      } catch (error) {
        console.error('❌ Bot connection failed:', error.message);
        throw error;
      }

      // Event handlerlarni o'rnatish
      this.setupEventHandlers();
      console.log('✅ Telegram bot event handlers set up');

    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
      console.error('❌ Bot token might be invalid or polling failed');
    }
  }

  // Kanal obunasini tekshirish
  async checkChannelSubscription(userId) {
    try {
      const member = await this.bot.getChatMember(this.requiredChannelId, userId);
      const isSubscribed = ['member', 'administrator', 'creator'].includes(member.status);
      console.log(`👤 User ${userId} subscription status:`, member.status, '- Subscribed:', isSubscribed);
      return isSubscribed;
    } catch (error) {
      console.error('❌ Error checking channel subscription:', error.message);
      return false;
    }
  }

  setupEventHandlers() {
    if (!this.bot) return;

    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      try {
        console.log('📩 /start command received from:', msg.from.username || msg.from.id);

        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const firstName = msg.from.first_name || 'Foydalanuvchi';

        // Kanal obunasini tekshirish
        const isSubscribed = await this.checkChannelSubscription(userId);

        if (!isSubscribed) {
          // Obuna bo'lmagan foydalanuvchiga xabar
          const subscriptionMessage = `
🔒 Salom, ${firstName}!

❗ InFast AI botidan foydalanish uchun avval bizning rasmiy kanalimizga obuna bo'lishingiz kerak.

📢 Kanal: ${this.channelUrl}

✅ Obuna bo'lgandan so'ng /start ni qayta bosing.
          `;

          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📢 Kanalga obuna bo\'lish', url: this.channelUrl }
                ],
                [
                  { text: '✅ Obuna bo\'ldim, tekshirish', callback_data: 'check_subscription' }
                ]
              ]
            }
          };

          await this.bot.sendMessage(chatId, subscriptionMessage, options);
          console.log('⚠️  User not subscribed, subscription message sent');
          return;
        }

        // Obuna bo'lgan foydalanuvchiga welcome message
        const welcomeMessage = `
🎉 Salom, ${firstName}!

📱 InFast AI ga xush kelibsiz!

📋 Ro'yxatdan o'tish uchun:
1️⃣ Saytda telefon raqamingizni kiriting
2️⃣ Bu yerga qaytib, kontaktni ulashing

📞 Kontaktni ulashish uchun quyidagi tugmani bosing:
        `;

        const options = {
          reply_markup: {
            keyboard: [
              [{ text: '📱 Kontaktni ulashish', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        };

        await this.bot.sendMessage(chatId, welcomeMessage, options);
        console.log('✅ Welcome message sent to:', chatId);
      } catch (error) {
        console.error('❌ Error handling /start command:', error.message);
      }
    });

    // Handle callback queries (inline button clicks)
    this.bot.on('callback_query', async (query) => {
      try {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const data = query.data;

        if (data === 'check_subscription') {
          const isSubscribed = await this.checkChannelSubscription(userId);

          if (isSubscribed) {
            await this.bot.answerCallbackQuery(query.id, {
              text: '✅ Obuna tasdiqlandi!',
              show_alert: false
            });

            // Welcome message yuborish
            const firstName = query.from.first_name || 'Foydalanuvchi';
            const welcomeMessage = `
🎉 Ajoyib, ${firstName}!

📱 Endi InFast AI dan foydalanishingiz mumkin!

📋 Ro'yxatdan o'tish uchun:
1️⃣ Saytda telefon raqamingizni kiriting
2️⃣ Bu yerga qaytib, kontaktni ulashing

📞 Kontaktni ulashish uchun quyidagi tugmani bosing:
            `;

            const options = {
              reply_markup: {
                keyboard: [
                  [{ text: '📱 Kontaktni ulashish', request_contact: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
              }
            };

            await this.bot.sendMessage(chatId, welcomeMessage, options);
          } else {
            await this.bot.answerCallbackQuery(query.id, {
              text: '❌ Siz hali kanalga obuna bo\'lmadingiz!',
              show_alert: true
            });
          }
        }
      } catch (error) {
        console.error('❌ Error handling callback query:', error.message);
      }
    });

    // Handle contact sharing
    this.bot.on('contact', async (msg) => {
      try {
        console.log('📱 Contact event received');

        const chatId = msg.chat.id;
        const contact = msg.contact;
        const userId = msg.from.id;

        // Kontakt yuborishdan oldin obunani tekshirish
        const isSubscribed = await this.checkChannelSubscription(userId);
        if (!isSubscribed) {
          await this.bot.sendMessage(chatId,
            '❌ Avval kanalga obuna bo\'lishingiz kerak!\n\n' +
            '📢 Kanal: ' + this.channelUrl + '\n\n' +
            'Obuna bo\'lgandan so\'ng /start ni qayta bosing.'
          );
          return;
        }

        if (!contact || !contact.phone_number) {
          console.log('❌ Invalid contact data');
          await this.bot.sendMessage(chatId, '❌ Kontakt ma\'lumotlari topilmadi. Qayta urinib ko\'ring.');
          return;
        }

        let phoneNumber = contact.phone_number;
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = `+${phoneNumber}`;
        }

        console.log(`📱 Contact received from user ${userId}: ${phoneNumber}`);

        try {
          // Avval mavjud so'rovni tekshirish
          const pendingVerification = await VerificationCode.findOne({
            phone: phoneNumber,
            type: 'phone_verification',
            used: false,
            expiresAt: { $gt: new Date() }
          }).sort({ createdAt: -1 });

          if (!pendingVerification) {
            await this.bot.sendMessage(chatId,
              '❌ Sizning telefon raqamingiz uchun faol so\'rov topilmadi.\n\n' +
              '📱 Avval saytda telefon raqamingizni kiriting va keyin bu yerga qayting.'
            );
            return;
          }

          // Eski OTP ni o'chirib, yangi yaratish (chunki eski kod hash qilingan)
          await VerificationCode.deleteMany({
            phone: phoneNumber,
            type: 'phone_verification'
          });
          
          const { code } = await VerificationCode.createOTP(phoneNumber, 'phone_verification');

          const otpMessage = `
✅ **Telefon raqam tasdiqlandi!**

🔢 **Sizning tasdiqlash kodingiz:**
\`\`\`
${code}
\`\`\`

⏰ **Kod 3 daqiqa amal qiladi**

📱 Saytga qaytib, ushbu kodni kiriting va ro'yxatdan o'ting.

❗ **Diqqat:** Bu kodni hech kimga bermang!
          `;

          await this.bot.sendMessage(chatId, otpMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
              remove_keyboard: true
            }
          });

          console.log(`✅ OTP sent to Telegram user ${userId} for phone ${phoneNumber}: ${code}`);

        } catch (error) {
          console.error('❌ Error processing contact:', error.message);
          try {
            await this.bot.sendMessage(msg.chat.id, '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
          } catch (sendError) {
            console.error('❌ Could not send error message:', sendError.message);
          }
        }
      } catch (error) {
        console.error('❌ Contact handler error:', error.message);
      }
    });

    // Handle unknown messages
    this.bot.on('message', async (msg) => {
      if (msg.text && !msg.text.startsWith('/') && !msg.contact) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId,
          '📱 Ro\'yxatdan o\'tish uchun /start bosing va kontaktni ulashing.'
        );
      }
    });

    // Handle polling errors (faqat development uchun)
    if (process.env.NODE_ENV !== 'production') {
      this.bot.on('polling_error', (error) => {
        console.error('❌ Telegram polling error:', error.message);
      });
    }

    this.bot.on('webhook_error', (error) => {
      console.error('❌ Telegram webhook error:', error.message);
    });
  }

  // Webhook uchun manual update processor
  async processUpdate(update) {
    if (!this.bot) {
      console.error('❌ Bot not initialized');
      return;
    }

    try {
      await this.bot.processUpdate(update);
    } catch (error) {
      console.error('❌ Error processing update:', error);
    }
  }

  async sendToAdminGroup(message, options = {}) {
    if (!this.bot || !this.adminGroupId) {
      console.warn('⚠️  Telegram bot or admin group not configured');
      return;
    }

    try {
      await this.bot.sendMessage(this.adminGroupId, message, options);
      console.log('✅ Message sent to admin group');
    } catch (error) {
      console.error('❌ Failed to send message to admin group:', error);
    }
  }

  async getBotInfo() {
    if (!this.bot) return null;

    try {
      return await this.bot.getMe();
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }

  stop() {
    if (this.bot) {
      console.log('🤖 Stopping Telegram bot...');
      if (process.env.NODE_ENV === 'production') {
        this.bot.deleteWebHook().then(() => {
          console.log('✅ Webhook deleted');
        }).catch((error) => {
          console.error('❌ Failed to delete webhook:', error.message);
        });
      } else {
        this.bot.stopPolling();
        console.log('✅ Polling stopped');
      }
      this.isInitialized = false;
    }
  }

  async healthCheck() {
    const status = {
      configured: !!this.botToken,
      initialized: !!this.bot && this.isInitialized,
      token: this.botToken ? '***' + this.botToken.slice(-10) : null,
      mode: process.env.NODE_ENV === 'production' ? 'webhook' : 'polling'
    };

    if (this.bot) {
      try {
        const botInfo = await this.bot.getMe();
        status.botInfo = {
          username: botInfo.username,
          first_name: botInfo.first_name,
          id: botInfo.id
        };
        status.status = 'online';
      } catch (error) {
        status.status = 'error';
        status.error = error.message;
      }
    } else {
      status.status = 'offline';
    }

    return status;
  }
}

module.exports = new TelegramService();