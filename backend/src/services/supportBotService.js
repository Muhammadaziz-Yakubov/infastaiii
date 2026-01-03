// Support Bot Service - Foydalanuvchi savollari uchun
const TelegramBot = require('node-telegram-bot-api');

class SupportBotService {
  constructor() {
    this.bot = null;
    this.botToken = '8043397643:AAGtOqNfX_AAcJsKLsWdfjE6X25n4mEH5MM';
    this.adminChatId = process.env.SUPPORT_ADMIN_CHAT_ID || null;
    this.isInitialized = false;
    this.activeChats = new Map(); // Faol suhbatlar (userId -> {username, service, messages[], chatId})
    this.adminStates = new Map(); // Admin holatlari (adminId -> {replyingTo: userId})
  }

  async init() {
    if (this.isInitialized) {
      console.log('⚠️  Support bot already initialized, skipping...');
      return;
    }

    if (this.botToken) {
      try {
        await this.initializeBot();
        this.isInitialized = true;
      } catch (error) {
        console.error('❌ Failed to initialize Support bot:', error);
      }
    } else {
      console.warn('⚠️  Support bot token not configured.');
    }
  }

  async initializeBot() {
    try {
      console.log('🤖 Initializing Support bot...');

      const options = process.env.NODE_ENV === 'production'
        ? { webHook: false }
        : { polling: true };

      this.bot = new TelegramBot(this.botToken, options);

      console.log('🤖 Support bot initialized successfully');

      // Test bot connection
      const botInfo = await this.bot.getMe();
      console.log('🤖 Support bot connected:', botInfo.username);
      console.log('📋 Admin Chat ID:', this.adminChatId || 'NOT SET');

      // Production da webhook o'rnatish
      if (process.env.NODE_ENV === 'production') {
        const baseUrl = process.env.RENDER_EXTERNAL_URL ||
                       `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` ||
                       'https://infastaiii.onrender.com';
        const webhookUrl = `${baseUrl}/api/support/webhook`;

        console.log('🔗 Setting Support bot webhook to:', webhookUrl);
        
        await this.bot.deleteWebHook();
        await this.bot.setWebHook(webhookUrl);
        console.log('✅ Support bot webhook set successfully');
      }

      this.setupEventHandlers();
      console.log('✅ Support bot event handlers set up');

    } catch (error) {
      console.error('❌ Failed to initialize Support bot:', error);
    }
  }

  setupEventHandlers() {
    if (!this.bot) return;

    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const firstName = msg.from.first_name || 'Foydalanuvchi';

        // Admin /start qilganda
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
          this.adminChatId = chatId.toString();
          await this.bot.sendMessage(chatId, 
            `✅ Admin guruh sifatida ro'yxatdan o'tdi!\n\nGuruh ID: ${chatId}\n\nEndi foydalanuvchi savollari shu yerga keladi.`
          );
          console.log('✅ Admin group registered:', chatId);
          return;
        }

        // Agar faol suhbat bo'lsa, davom ettirish
        if (this.activeChats.has(userId.toString())) {
          await this.bot.sendMessage(chatId, 
            `📞 Sizda faol suhbat mavjud.\n\n` +
            `💬 Savolingizni yozishda davom eting yoki admin javobini kuting.`
          );
          return;
        }

        // Foydalanuvchi uchun xizmat tanlash
        const welcomeMessage = `🎉 Salom, ${firstName}!

📞 InFast AI Support xizmatiga xush kelibsiz!

Quyidagi xizmatlardan birini tanlang:`;

        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🤖 InFast AI', callback_data: 'service_infastai' }]
            ]
          }
        };

        await this.bot.sendMessage(chatId, welcomeMessage, options);
        console.log('✅ Welcome message sent to:', chatId);

      } catch (error) {
        console.error('❌ Error handling /start:', error.message);
      }
    });

    // Callback query handler (tugma bosilganda)
    this.bot.on('callback_query', async (query) => {
      try {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const data = query.data;

        // Xizmat tanlash - yangi suhbat boshlash
        if (data === 'service_infastai') {
          await this.bot.answerCallbackQuery(query.id);
          
          const username = query.from.username || 'username_yoq';
          
          // Yangi faol suhbat yaratish
          this.activeChats.set(userId.toString(), {
            username: username,
            service: 'InFast AI',
            messages: [],
            startTime: new Date(),
            chatId: chatId
          });

          await this.bot.sendMessage(chatId, 
            `✅ Siz InFast AI xizmatini tanladingiz.\n\n` +
            `📝 Savolingizni yozing. Suhbat davomida bir nechta savol yuborishingiz mumkin.\n\n` +
            `Admin javob berganda sizga xabar keladi.`
          );
        }

        // Admin javob berish tugmasi
        if (data.startsWith('reply_')) {
          const targetUserId = data.replace('reply_', '');
          
          // Admin holatini saqlash
          this.adminStates.set(userId.toString(), {
            replyingTo: targetUserId
          });

          await this.bot.answerCallbackQuery(query.id);
          
          const chat = this.activeChats.get(targetUserId);
          const username = chat ? chat.username : 'noma\'lum';
          
          await this.bot.sendMessage(chatId, 
            `📝 @${username} ga javob yozing:`
          );
        }

        // Admin suhbatni yakunlash tugmasi
        if (data.startsWith('close_')) {
          const targetUserId = data.replace('close_', '');
          
          await this.bot.answerCallbackQuery(query.id);
          
          const chat = this.activeChats.get(targetUserId);
          if (chat) {
            // Foydalanuvchiga suhbat yakunlandi xabari
            const ratingKeyboard = {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '⭐ 1', callback_data: `rate_1_${targetUserId}` },
                    { text: '⭐ 2', callback_data: `rate_2_${targetUserId}` },
                    { text: '⭐ 3', callback_data: `rate_3_${targetUserId}` },
                    { text: '⭐ 4', callback_data: `rate_4_${targetUserId}` },
                    { text: '⭐ 5', callback_data: `rate_5_${targetUserId}` }
                  ]
                ]
              }
            };

            await this.bot.sendMessage(chat.chatId, 
              `✅ Suhbat yakunlandi!\n\n` +
              `Iltimos, xizmat sifatini 1 dan 5 gacha baholang:`,
              ratingKeyboard
            );

            await this.bot.sendMessage(chatId, 
              `✅ Suhbat yakunlandi! Foydalanuvchiga baho so'rovi yuborildi.`
            );
          }
        }

        // Foydalanuvchi baho qo'yishi
        if (data.startsWith('rate_')) {
          const parts = data.split('_');
          const rating = parts[1];
          const targetUserId = parts[2];

          await this.bot.answerCallbackQuery(query.id, {
            text: `Rahmat! Siz ${rating} ⭐ baho qo'ydingiz.`,
            show_alert: false
          });

          // Adminga baho haqida xabar
          if (this.adminChatId) {
            const chat = this.activeChats.get(targetUserId);
            const username = chat ? chat.username : 'noma\'lum';
            
            await this.bot.sendMessage(this.adminChatId, 
              `⭐ Baho qo'yildi!\n\n` +
              `👤 Foydalanuvchi: @${username}\n` +
              `🆔 User ID: ${targetUserId}\n` +
              `⭐ Baho: ${rating}/5`
            );
          }

          // Foydalanuvchiga rahmat
          await this.bot.sendMessage(chatId, 
            `🙏 Rahmat! Sizning bahoyingiz: ${rating} ⭐\n\n` +
            `Yangi savol uchun /start bosing.`
          );

          // Suhbatni o'chirish
          this.activeChats.delete(targetUserId);
        }

      } catch (error) {
        console.error('❌ Error handling callback:', error.message);
      }
    });

    // Xabar handler
    this.bot.on('message', async (msg) => {
      try {
        // /start va boshqa commandlarni o'tkazib yuborish
        if (msg.text && msg.text.startsWith('/')) return;
        if (!msg.text) return;

        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // Admin guruhidan kelgan xabar
        if (chatId.toString() === this.adminChatId) {
          const adminState = this.adminStates.get(userId.toString());
          
          if (adminState && adminState.replyingTo) {
            const targetUserId = adminState.replyingTo;
            const chat = this.activeChats.get(targetUserId);

            if (chat) {
              try {
                // Foydalanuvchiga javob yuborish
                await this.bot.sendMessage(chat.chatId, 
                  `📬 Admin javobi:\n\n${msg.text}\n\n` +
                  `� Yana savol bo'lsa yozing.`
                );

                // Admin tugmalari bilan tasdiqlash
                await this.bot.sendMessage(chatId, 
                  `✅ Javob yuborildi @${chat.username} ga!`,
                  {
                    reply_markup: {
                      inline_keyboard: [
                        [
                          { text: '✍️ Yana javob', callback_data: `reply_${targetUserId}` },
                          { text: '🔚 Suhbatni yakunlash', callback_data: `close_${targetUserId}` }
                        ]
                      ]
                    }
                  }
                );

                // Suhbatga javobni qo'shish
                chat.messages.push({
                  from: 'admin',
                  text: msg.text,
                  time: new Date()
                });

              } catch (error) {
                await this.bot.sendMessage(chatId, 
                  `❌ Xatolik: Foydalanuvchiga xabar yuborib bo'lmadi.`
                );
              }
            }

            // Admin holatini tozalash
            this.adminStates.delete(userId.toString());
          }
          return;
        }

        // Foydalanuvchi xabari - faol suhbat bormi?
        const chat = this.activeChats.get(userId.toString());
        
        if (chat) {
          // Suhbatga xabarni qo'shish
          chat.messages.push({
            from: 'user',
            text: msg.text,
            time: new Date()
          });

          // Adminga xabar yuborish
          if (this.adminChatId) {
            const messageCount = chat.messages.filter(m => m.from === 'user').length;
            
            const adminMessage = `📩 Xabar #${messageCount}

👤 Foydalanuvchi: @${chat.username}
🆔 User ID: ${userId}
📱 Xizmat: ${chat.service}

💬 Xabar:
${msg.text}`;

            const adminOptions = {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '✍️ Javob berish', callback_data: `reply_${userId}` },
                    { text: '🔚 Suhbatni yakunlash', callback_data: `close_${userId}` }
                  ]
                ]
              }
            };

            console.log('📤 Sending to admin:', this.adminChatId);
            await this.bot.sendMessage(this.adminChatId, adminMessage, adminOptions);
            console.log('✅ Message sent to admin');
          } else {
            console.log('❌ Admin chat ID not set!');
          }

          // Foydalanuvchiga tasdiqlash
          await this.bot.sendMessage(chatId, 
            `✅ Xabaringiz qabul qilindi! Admin tez orada javob beradi.`
          );

        } else {
          // Faol suhbat yo'q
          await this.bot.sendMessage(chatId, 
            `📱 Suhbat boshlash uchun /start bosing.`
          );
        }

      } catch (error) {
        console.error('❌ Error handling message:', error.message);
      }
    });

    // Polling error handler
    if (process.env.NODE_ENV !== 'production') {
      this.bot.on('polling_error', (error) => {
        console.error('❌ Support bot polling error:', error.message);
      });
    }
  }

  // Webhook uchun update processor
  async processUpdate(update) {
    if (!this.bot) {
      console.error('❌ Support bot not initialized');
      return;
    }

    try {
      await this.bot.processUpdate(update);
    } catch (error) {
      console.error('❌ Error processing support update:', error);
    }
  }

  stop() {
    if (this.bot) {
      console.log('🤖 Stopping Support bot...');
      if (process.env.NODE_ENV === 'production') {
        this.bot.deleteWebHook().catch(console.error);
      } else {
        this.bot.stopPolling();
      }
      this.isInitialized = false;
    }
  }

  async healthCheck() {
    return {
      configured: !!this.botToken,
      initialized: this.isInitialized,
      adminChatId: this.adminChatId,
      activeChats: this.activeChats.size
    };
  }
}

module.exports = new SupportBotService();
