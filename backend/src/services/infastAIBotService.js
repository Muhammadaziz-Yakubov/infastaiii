const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Debt = require('../models/Debt');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Finance = require('../models/Finance');
const Challenge = require('../models/Challenge');
const ChallengeParticipant = require('../models/ChallengeParticipant');

class InFastAIBotService {
  constructor() {
    this.bot = null;
    this.botToken = process.env.INFAST_AI_BOT_TOKEN;
    this.isInitialized = false;
    this.reminderInterval = null;
    this.webAppUrl = 'https://infastproject.uz';
  }

  getMainKeyboard(isLinked) {
    return {
      keyboard: [
        [{ text: '⚙️ Sozlamalar' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  getStatsKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: 'Qarzlar', callback_data: 'stats_debts' },
          { text: 'Tasklar', callback_data: 'stats_tasks' }
        ],
        [
          { text: 'Maqsadlar', callback_data: 'stats_goals' },
          { text: 'Moliya', callback_data: 'stats_finance' }
        ],
        [
          { text: 'Challengelar', callback_data: 'stats_challenges' }
        ],
        [
          { text: 'Umumiy', callback_data: 'stats_overview' }
        ]
      ]
    };
  }

  async init() {
    if (this.isInitialized) return;
    try {
      await this.initializeBot();
      this.isInitialized = true;
      this.startReminderScheduler();
      console.log('InFast AI Bot initialized');
    } catch (error) {
      console.error('Failed to initialize InFast AI bot:', error);
    }
  }

  async initializeBot() {
    console.log('Initializing InFast AI bot...');
    const options = process.env.NODE_ENV === 'production' ? { webHook: false } : { polling: true };
    this.bot = new TelegramBot(this.botToken, options);
    
    const botInfo = await this.bot.getMe();
    console.log('InFast AI bot connected:', botInfo.username);
    console.log('Bot mode:', process.env.NODE_ENV === 'production' ? 'webhook' : 'polling');

    // Faqat production da webhook o'rnatish
    if (process.env.NODE_ENV === 'production') {
      const baseUrl = process.env.RENDER_EXTERNAL_URL || 'https://infastaiii.onrender.com';
      await this.bot.deleteWebHook();
      await this.bot.setWebHook(baseUrl + '/api/infast-ai/webhook');
      console.log('Webhook set to:', baseUrl + '/api/infast-ai/webhook');
    } else {
      console.log('Using polling mode for development');
    }

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.bot) return;

    this.bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const firstName = msg.from.first_name || 'Foydalanuvchi';
      const startParam = match[1];

      const user = await User.findOne({ telegramChatId: chatId.toString() });

      if (user) {
        var welcomeBack = '👋 Salom, ' + firstName + '!\n\n';
        welcomeBack += '✅ Siz tizimga kirgansiz!\n';
        welcomeBack += '📱 Kontaktni ulashish orqali kirishingiz mumkin.';
        await this.bot.sendMessage(chatId, welcomeBack, { reply_markup: this.getMainKeyboard(true) });
      } else {
        var welcomeNew = '🚀 Xush kelibsiz, ' + firstName + '!\n\n';
        welcomeNew += '🤖 Men InFast AI botiman\n\n';
        welcomeNew += '📱 Tizimga kirish uchun kontaktni ulashing:';
        await this.bot.sendMessage(chatId, welcomeNew, { 
          reply_markup: {
            keyboard: [
              [{ text: '📱 Kontaktni ulashish', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });
      }
    });

    // Handle contact sharing for authentication
    this.bot.on('contact', async (msg) => {
      try {
        console.log('📱 Contact event received for authentication');

        const chatId = msg.chat.id;
        const contact = msg.contact;
        const userId = msg.from.id;

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

        // Check if user exists with this phone number
        let user = await User.findOne({ phone: phoneNumber });

        if (user) {
          // Existing user - link Telegram account
          user.telegramChatId = chatId.toString();
          user.telegramUsername = msg.from.username;
          user.telegramFirstName = msg.from.first_name;
          user.telegramLinkedAt = new Date();
          user.lastLogin = new Date();
          await user.save();

          console.log(`✅ Existing user linked: ${user.email || user.phone}`);
          
          const successMessage = `✅ **Tizimga kirishingiz muvaffaqiyatli amalga oshdi!**\n\n` +
            `👋 Salom, ${msg.from.first_name}!\n` +
            `📱 Telefon: ${phoneNumber}\n\n` +
            `🎉 Endi botdan to\'liq foydalanishingiz mumkin!`;
          
          await this.bot.sendMessage(chatId, successMessage, {
            parse_mode: 'Markdown',
            reply_markup: this.getMainKeyboard(true)
          });
        } else {
          // New user - start registration flow
          await this.startRegistrationFlow(chatId, phoneNumber, msg.from);
        }

      } catch (error) {
        console.error('❌ Contact handler error:', error.message);
        await this.bot.sendMessage(msg.chat.id, 
          '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.\n' +
          'Xatolik: ' + error.message
        );
      }
    });

    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      
      const chatId = msg.chat.id;
      const text = msg.text;
      const user = await User.findOne({ telegramChatId: chatId.toString() });

      if (text === '⚙️ Sozlamalar') {
        await this.showSettings(chatId);
      }
    });

    // Ovozli xabarlar handler
    this.bot.on('voice', async (msg) => {
      try {
        console.log('🎤 Voice message received:', {
          chatId: msg.chat.id,
          voiceId: msg.voice.file_id,
          duration: msg.voice.duration,
          mimeType: msg.voice.mime_type
        });
        
        const chatId = msg.chat.id;
        const user = await User.findOne({ telegramChatId: chatId.toString() });
        
        if (!user) {
          console.log('❌ User not found for chatId:', chatId);
          await this.bot.sendMessage(chatId, 
            '❌ Avval hisobni ulang!\n\n' +
            '📋 Hisobni ulash uchun "Hisobni ulash" tugmasini bosing.',
            { reply_markup: this.getMainKeyboard(false) }
          );
          return;
        }

        await this.bot.sendMessage(chatId, '🎤 Ovozli xabar qabul qilindi, tahlil qilinmoqda...');
        
        // Ovozli faylni yuklab olish
        const voiceFile = await this.bot.getFile(msg.voice.file_id);
        const voiceUrl = `https://api.telegram.org/file/bot${this.botToken}/${voiceFile.file_path}`;
        
        console.log('📁 Voice file URL:', voiceUrl);
        
        // Ovozni matnga aylantirish va tahlil qilish
        const analysisResult = await this.processVoiceCommand(voiceUrl, user._id);
        
        await this.bot.sendMessage(chatId, analysisResult.message, { 
          reply_markup: this.getMainKeyboard(true) 
        });
        
      } catch (error) {
        console.error('❌ Voice command error:', error);
        await this.bot.sendMessage(msg.chat.id, 
          '❌ Ovozli xabarni tahlil qilishda xatolik yuz berdi.\n\n' +
          'Iltimos, qayta urinib ko\'ring.\n' +
          'Xatolik: ' + error.message
        );
      }
    });

    // Foydalanuvchiga ovoz yuborishni eslatish (har 2 soatda bir marta)
    this.sendVoiceReminder();

    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data;
      await this.bot.answerCallbackQuery(query.id);

      const user = await User.findOne({ telegramChatId: chatId.toString() });
      if (!user) {
        await this.bot.sendMessage(chatId, 'Avval hisobni ulang!');
        return;
      }

      // Bildirishnomalar callback handlerlari
      if (data === 'schedule_daily') {
        const result = await this.saveNotificationSettings(user._id, 'daily', 'daily');
        await this.bot.sendMessage(chatId, result.message, { 
          reply_markup: this.getMainKeyboard(true) 
        });
      } else if (data === 'schedule_weekly') {
        const result = await this.saveNotificationSettings(user._id, 'weekly', 'weekly');
        await this.bot.sendMessage(chatId, result.message, { 
          reply_markup: this.getMainKeyboard(true) 
        });
      } else if (data === 'schedule_monthly') {
        const result = await this.saveNotificationSettings(user._id, 'monthly', 'monthly');
        await this.bot.sendMessage(chatId, result.message, { 
          reply_markup: this.getMainKeyboard(true) 
        });
      } else if (data === 'schedule_off') {
        const result = await this.saveNotificationSettings(user._id, 'off', 'off');
        await this.bot.sendMessage(chatId, '❌ Bildirishnomalar o\'chirildi', { 
          reply_markup: this.getMainKeyboard(true) 
        });
      } else if (data === 'notif_cancel') {
        await this.bot.sendMessage(chatId, '🔙 Asosiy menyu:', { 
          reply_markup: this.getMainKeyboard(true) 
        });
      }
      // Eski statistika callbacklari
      else if (data === 'stats_debts') await this.sendDebtStats(chatId, user, query.message.message_id);
      else if (data === 'stats_tasks') await this.sendTaskStats(chatId, user, query.message.message_id);
      else if (data === 'stats_goals') await this.sendGoalStats(chatId, user, query.message.message_id);
      else if (data === 'stats_finance') await this.sendFinanceStats(chatId, user, query.message.message_id);
      else if (data === 'stats_challenges') await this.sendChallengeStats(chatId, user, query.message.message_id);
      else if (data === 'stats_overview') await this.sendOverviewStats(chatId, user, query.message_id);
      else if (data === 'back_stats') {
        await this.bot.editMessageText('Qaysi statistikani kormoqchisiz?', {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: this.getStatsKeyboard()
        });
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      this.bot.on('polling_error', function(e) { console.error('Polling error:', e.message); });
    }
  }

  // Rasm bilan tahlil yuborish (matn diagrammasi)
  async sendFinanceAnalysisWithChart(chatId, analysis) {
    try {
      if (analysis.chart) {
        // Avval diagrammani yuborish
        await this.bot.sendMessage(chatId, analysis.chart, {
          parse_mode: 'Markdown'
        });
        
        // Keyin qisqa tahlilni yuborish
        await this.bot.sendMessage(chatId, analysis.analysis, {
          parse_mode: 'Markdown',
          reply_markup: this.getMainKeyboard(true)
        });
      } else {
        // Agar diagramma bo'lmasa, faqat matn yuborish
        await this.bot.sendMessage(chatId, analysis.analysis, {
          parse_mode: 'Markdown',
          reply_markup: this.getMainKeyboard(true)
        });
      }
    } catch (error) {
      console.error('Error sending finance analysis with chart:', error);
      await this.bot.sendMessage(chatId, '❌ Tahlilni yuborishda xatolik yuz berdi.', {
        reply_markup: this.getMainKeyboard(true)
      });
    }
  }

  // Foydalanuvchilarga ovoz yuborishni eslatish
  async sendVoiceReminder() {
    const reminderInterval = 2 * 60 * 60 * 1000; // 2 soat
    
    setInterval(async () => {
      try {
        const users = await User.find({
          telegramChatId: { $exists: true, $ne: null },
          'telegramNotifications.enabled': true
        });

        for (const user of users) {
          const randomMessages = [
            '🎤 Unutmang! Ovozli komanda bilan moliyangizni tez qo\'shing!\n\n' +
            'Misol: "Bugun taksiga 25 ming sarfladim"',
            
            '📊 Ovoz bilan statistikangizni tekshiring!\n\n' +
            'Aytishingiz mumkin: "Moliyaviy holatimni ko\'r"',
            
            '💰 Ovozli xarajatlarni yozing!\n\n' +
            'Masalan: "Restoranda 50 ming, marketda 30 ming"',
            
            '🎯 Ovoz bilan maqsadlarangizni kuzating!\n\n' +
            'Aytishingiz mumkin: "Yil oxiriga 1 million yig\'ishim kerak"'
          ];
          
          const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
          
          await this.bot.sendMessage(user.telegramChatId, randomMessage, {
            reply_markup: this.getMainKeyboard(true)
          });
        }
      } catch (error) {
        console.error('Voice reminder error:', error);
      }
    }, reminderInterval);
  }

  // Bildirishnomalar sozlamalari
  async showNotificationSettings(chatId, user) {
    await this.bot.sendMessage(chatId, 
      '⚙️ *Bildirishnomalar sozlamalari*\n\n' +
      'Qachay eslatishni tanlang:\n\n' +
      '🌅 *Har kuni* - Har kuni soat 9:00 da moliya tahlili\n' +
      '📅 *Har haftada* - Har hafta dushanba kuni 9:00 da\n' +
      '📅 *Har oyda* - Har oyning 1-kuni 9:00 da\n' +
      '❌ *O\'chirish* - Bildirishnomalarni o\'chirish\n\n' +
      'Tanlang:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌅 Har kuni', callback_data: 'schedule_daily' },
              { text: '📅 Har haftada', callback_data: 'schedule_weekly' }
            ],
            [
              { text: '📅 Har oyda', callback_data: 'schedule_monthly' },
              { text: '❌ O\'chirish', callback_data: 'schedule_off' }
            ],
            [
              { text: '🔙 Orqaga', callback_data: 'notif_cancel' }
            ]
          ]
        }
      }
    );
  }

  // Vaqtni saqlash
  async saveNotificationSettings(userId, type, schedule) {
    try {
      await User.updateOne(
        { _id: userId },
        { 
          $set: { 
            'notificationSettings': {
              type: type,
              schedule: schedule,
              updatedAt: new Date()
            }
          }
        }
      );
      
      let scheduleText = '';
      if (schedule === 'daily') scheduleText = 'Har kuni soat 9:00';
      else if (schedule === 'weekly') scheduleText = 'Har hafta dushanba kuni';
      else if (schedule === 'monthly') scheduleText = 'Har oyning 1-kuni';
      else if (schedule === 'off') scheduleText = 'O\'chirilgan';
      
      return {
        success: true,
        message: `✅ Bildirishnomalar sozlandi!\n\n⏰ Vaqt: ${scheduleText}`
      };
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return {
        success: false,
        message: '❌ Sozlamalarni saqlashda xatolik yuz berdi.'
      };
    }
  }

  // Moliya tahlili bildirishnomasi
  async generateFinanceAnalysis(userId) {
    const Finance = require('../models/Finance');
    
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      // Joriy oy moliyalari
      const currentMonthFinances = await Finance.find({ 
        userId, 
        date: { $gte: startOfMonth } 
      });
      
      // O'tgan oy moliyalari
      const lastMonthFinances = await Finance.find({ 
        userId, 
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      });
      
      // Hisoblashlar
      const currentIncome = currentMonthFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
      const currentExpense = currentMonthFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
      const currentBalance = currentIncome - currentExpense;
      
      const lastIncome = lastMonthFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
      const lastExpense = lastMonthFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
      const lastBalance = lastIncome - lastExpense;
      
      // Kategoriyalar bo'yicha xarajatlar
      const expensesByCategory = {};
      currentMonthFinances.filter(f => f.type === 'expense').forEach(f => {
        expensesByCategory[f.category] = (expensesByCategory[f.category] || 0) + f.amount;
      });
      
      // O'sish/kamayish foizi
      const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100) : 0;
      const expenseChange = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense * 100) : 0;
      
      // Eng katta xarajatlar
      const topExpenses = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }));
      
      // Tavsiyalar
      const recommendations = [];
      
      if (currentBalance < 0) {
        recommendations.push('⚠️ Diqqat! Bu oy xarajatlaringiz daromadingizdan ortiq.');
      }
      
      if (currentExpense > currentIncome * 0.9) {
        recommendations.push('💡 Xarajatlarni kamaytirish tavsiya etiladi.');
      }
      
      if (topExpenses.length > 0) {
        recommendations.push(`📊 Eng ko'p xarajat: ${topExpenses[0].category} - ${this.formatCurrency(topExpenses[0].amount)}`);
      }
      
      if (recommendations.length === 0) {
        recommendations.push('✅ Moliyaviy holatingiz yaxshi!');
      }
      
      // Diagramma yaratish
      const chartText = await this.createFinanceChart(currentIncome, currentExpense, expensesByCategory);
      
      // Qisqa tahlil matni
      let shortAnalysis = `📊 *MOLIYA TAHILI*\n\n`;
      shortAnalysis += `💰 *Bu oy balansi*\n`;
      shortAnalysis += `Daromad: ${this.formatCurrency(currentIncome)}\n`;
      shortAnalysis += `Xarajat: ${this.formatCurrency(currentExpense)}\n`;
      shortAnalysis += `Balans: ${this.formatCurrency(currentBalance)}\n\n`;
      
      if (incomeChange !== 0 || expenseChange !== 0) {
        shortAnalysis += `📈 *O'tgan oy bilan*\n`;
        if (incomeChange !== 0) {
          shortAnalysis += `Daromad: ${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(1)}%\n`;
        }
        if (expenseChange !== 0) {
          shortAnalysis += `Xarajat: ${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%\n`;
        }
        shortAnalysis += '\n';
      }
      
      shortAnalysis += `🤖 *AI tavsiyasi*\n`;
      shortAnalysis += recommendations[0];
      
      return {
        chart: chartText,
        analysis: shortAnalysis
      };
    } catch (error) {
      console.error('Error generating finance analysis:', error);
      return {
        chart: null,
        analysis: '❌ Tahlilni olishda xatolik yuz berdi.'
      };
    }
  }

  // Moliya diagrammasini yaratish (matn formatida)
  async createFinanceChart(income, expense, expensesByCategory) {
    let chart = '';
    
    // Pie chart matn formatida
    const total = income + expense;
    const incomePercent = total > 0 ? Math.round((income / total) * 100) : 0;
    const expensePercent = total > 0 ? Math.round((expense / total) * 100) : 0;
    
    chart += '📊 *MOLIYA DIAGRAMMASI*\n\n';
    
    // Pie chart vizualizatsiyasi
    chart += '💰 *Daromad vs Xarajat*\n';
    chart += '┌─────────────────────────┐\n';
    chart += '│ 🟢 Daromad: ' + '█'.repeat(Math.floor(incomePercent / 5)) + ' ' + incomePercent + '%\n';
    chart += '│ 🔴 Xarajat: ' + '█'.repeat(Math.floor(expensePercent / 5)) + ' ' + expensePercent + '%\n';
    chart += '└─────────────────────────┘\n\n';
    
    // Bar chart for expenses
    if (Object.keys(expensesByCategory).length > 0) {
      const categories = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      const maxAmount = Math.max(...categories.map(([,amount]) => amount));
      
      chart += '🏷️ *Xarajatlar (Top 5)*\n';
      chart += '┌─────────────────────────┐\n';
      
      categories.forEach(([category, amount], index) => {
        const barLength = Math.floor((amount / maxAmount) * 20);
        const bar = '█'.repeat(barLength);
        const categoryName = category.substring(0, 12).padEnd(12);
        const amountStr = this.formatCurrency(amount).padStart(12);
        chart += `│ ${categoryName} │ ${bar} │ ${amountStr}\n`;
      });
      
      chart += '└─────────────────────────┘\n\n';
    }
    
    // Statistika
    const balance = income - expense;
    chart += '📈 *Statistika*\n';
    chart += `• Jami daromad: ${this.formatCurrency(income)}\n`;
    chart += `• Jami xarajat: ${this.formatCurrency(expense)}\n`;
    chart += `• Balans: ${balance >= 0 ? '✅' : '⚠️'} ${this.formatCurrency(balance)}\n`;
    chart += `• Tejamkorlik: ${income > 0 ? Math.round(((income - expense) / income) * 100) : 0}%\n\n`;
    
    // Vaqt
    chart += `📅 ${new Date().toLocaleDateString('uz-UZ')}\n`;
    
    return chart;
  }

  async sendLinkInstructions(chatId) {
    var msg = 'Hisobni ulash:\n\n';
    msg += '1. infastproject.uz saytiga kiring\n';
    msg += '2. Sozlamalar > Telegram\n';
    msg += '3. Ulash tugmasini bosing';
    await this.bot.sendMessage(chatId, msg, { reply_markup: this.getMainKeyboard(false) });
  }

  async sendDebtStats(chatId, user, msgId) {
    const debts = await Debt.find({ userId: user._id });
    
    const active = debts.filter(function(d) { return d.status !== 'paid'; });
    const given = active.filter(function(d) { return d.type === 'given'; });
    const taken = active.filter(function(d) { return d.type === 'taken'; });
    var givenSum = 0;
    given.forEach(function(d) { givenSum += d.amount; });
    var takenSum = 0;
    taken.forEach(function(d) { takenSum += d.amount; });
    const paid = debts.filter(function(d) { return d.status === 'paid'; });

    var msg = 'QARZLAR\n\n';
    msg += 'Bergan: ' + this.formatCurrency(givenSum) + ' (' + given.length + ' ta)\n';
    msg += 'Olgan: ' + this.formatCurrency(takenSum) + ' (' + taken.length + ' ta)\n';
    msg += 'Balans: ' + this.formatCurrency(givenSum - takenSum) + '\n';
    msg += 'Yopilgan: ' + paid.length + ' ta';

    await this.bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Orqaga', callback_data: 'back_stats' }]] }
    });
  }

  async sendTaskStats(chatId, user, msgId) {
    const tasks = await Task.find({ userId: user._id });
    
    const pending = tasks.filter(function(t) { return t.status === 'pending'; });
    const completed = tasks.filter(function(t) { return t.status === 'completed'; });
    const high = pending.filter(function(t) { return t.priority === 'high'; });
    const now = new Date();
    const overdue = pending.filter(function(t) { return t.deadline && new Date(t.deadline) < now; });

    var msg = 'TASKLAR\n\n';
    msg += 'Kutilmoqda: ' + pending.length + ' ta\n';
    msg += 'Muhim: ' + high.length + ' ta\n';
    msg += 'Muddati otgan: ' + overdue.length + ' ta\n';
    msg += 'Bajarilgan: ' + completed.length + ' ta';

    await this.bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Orqaga', callback_data: 'back_stats' }]] }
    });
  }

  async sendGoalStats(chatId, user, msgId) {
    const goals = await Goal.find({ userId: user._id });
    
    const active = goals.filter(function(g) { return g.status === 'active'; });
    const completed = goals.filter(function(g) { return g.status === 'completed'; });
    const financial = active.filter(function(g) { return g.goalType === 'financial'; });
    
    var totalProgress = 0;
    active.forEach(function(g) {
      if (g.targetAmount > 0) {
        totalProgress += (g.currentAmount / g.targetAmount * 100);
      } else {
        totalProgress += (g.progress || 0);
      }
    });
    var avgProgress = active.length > 0 ? Math.round(totalProgress / active.length) : 0;

    var msg = 'MAQSADLAR\n\n';
    msg += 'Faol: ' + active.length + ' ta\n';
    msg += 'Moliyaviy: ' + financial.length + ' ta\n';
    msg += 'Ortacha progress: ' + avgProgress + '%\n';
    msg += 'Erishilgan: ' + completed.length + ' ta';

    await this.bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Orqaga', callback_data: 'back_stats' }]] }
    });
  }

  async sendFinanceStats(chatId, user, msgId) {
    const finances = await Finance.find({ userId: user._id });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = finances.filter(function(f) { return new Date(f.date) >= startOfMonth; });
    
    var monthIncome = 0;
    var monthExpense = 0;
    monthly.forEach(function(f) {
      if (f.type === 'income') monthIncome += f.amount;
      else monthExpense += f.amount;
    });
    
    var totalIncome = 0;
    var totalExpense = 0;
    finances.forEach(function(f) {
      if (f.type === 'income') totalIncome += f.amount;
      else totalExpense += f.amount;
    });

    var msg = 'MOLIYA\n\n';
    msg += 'Bu oy:\n';
    msg += 'Kirim: ' + this.formatCurrency(monthIncome) + '\n';
    msg += 'Chiqim: ' + this.formatCurrency(monthExpense) + '\n';
    msg += 'Balans: ' + this.formatCurrency(monthIncome - monthExpense) + '\n\n';
    msg += 'Jami:\n';
    msg += 'Kirim: ' + this.formatCurrency(totalIncome) + '\n';
    msg += 'Chiqim: ' + this.formatCurrency(totalExpense) + '\n';
    msg += 'Balans: ' + this.formatCurrency(totalIncome - totalExpense);

    await this.bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Orqaga', callback_data: 'back_stats' }]] }
    });
  }

  async sendChallengeStats(chatId, user, msgId) {
    const participations = await ChallengeParticipant.find({ userId: user._id }).populate('challengeId');
    
    const active = participations.filter(function(p) { return p.challengeId && p.challengeId.status === 'active' && p.status === 'active'; });
    const completed = participations.filter(function(p) { return p.status === 'completed'; });
    
    var totalDays = 0;
    var maxStreak = 0;
    var totalPoints = 0;
    var badges = 0;
    participations.forEach(function(p) {
      totalDays += (p.completedDays || 0);
      if ((p.maxStreak || 0) > maxStreak) maxStreak = p.maxStreak;
      totalPoints += (p.totalPoints || 0);
      badges += (p.badges ? p.badges.length : 0);
    });

    var msg = 'CHALLENGELAR\n\n';
    msg += 'Faol: ' + active.length + ' ta\n';
    msg += 'Tugatilgan: ' + completed.length + ' ta\n';
    msg += 'Bajarilgan kunlar: ' + totalDays + ' kun\n';
    msg += 'Eng uzun streak: ' + maxStreak + ' kun\n';
    msg += 'Badgelar: ' + badges + ' ta\n';
    msg += 'Jami ball: ' + totalPoints;

    await this.bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Orqaga', callback_data: 'back_stats' }]] }
    });
  }

  async sendOverviewStats(chatId, user, msgId) {
    const debts = await Debt.find({ userId: user._id, status: { $ne: 'paid' } });
    const tasks = await Task.find({ userId: user._id });
    const goals = await Goal.find({ userId: user._id });
    const finances = await Finance.find({ userId: user._id });
    const participations = await ChallengeParticipant.find({ userId: user._id }).populate('challengeId');

    var givenSum = 0;
    var takenSum = 0;
    debts.forEach(function(d) {
      if (d.type === 'given') givenSum += d.amount;
      else takenSum += d.amount;
    });
    
    const pendingTasks = tasks.filter(function(t) { return t.status === 'pending'; }).length;
    const completedTasks = tasks.filter(function(t) { return t.status === 'completed'; }).length;
    const activeGoals = goals.filter(function(g) { return g.status === 'active'; }).length;
    const completedGoals = goals.filter(function(g) { return g.status === 'completed'; }).length;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = finances.filter(function(f) { return new Date(f.date) >= startOfMonth; });
    var monthBalance = 0;
    monthly.forEach(function(f) {
      if (f.type === 'income') monthBalance += f.amount;
      else monthBalance -= f.amount;
    });
    
    const activeChallenges = participations.filter(function(p) { return p.challengeId && p.challengeId.status === 'active'; }).length;
    var totalPoints = 0;
    participations.forEach(function(p) { totalPoints += (p.totalPoints || 0); });

    var msg = 'UMUMIY\n\n';
    msg += 'Qarz balans: ' + this.formatCurrency(givenSum - takenSum) + '\n';
    msg += 'Tasklar: ' + completedTasks + '/' + (pendingTasks + completedTasks) + ' bajarilgan\n';
    msg += 'Maqsadlar: ' + completedGoals + '/' + (activeGoals + completedGoals) + ' erishilgan\n';
    msg += 'Bu oy: ' + this.formatCurrency(monthBalance) + '\n';
    msg += 'Challengelar: ' + activeChallenges + ' faol, ' + totalPoints + ' ball';

    await this.bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Orqaga', callback_data: 'back_stats' }]] }
    });
  }

  async linkAccount(chatId, linkCode, telegramUser) {
    try {
      const user = await User.findOne({
        telegramLinkCode: linkCode,
        telegramLinkExpiry: { $gt: new Date() }
      });

      if (!user) return false;

      user.telegramChatId = chatId.toString();
      user.telegramUsername = telegramUser.username;
      user.telegramFirstName = telegramUser.first_name;
      user.telegramLinkCode = undefined;
      user.telegramLinkExpiry = undefined;
      user.telegramNotifications = {
        enabled: true,
        debts: true,
        tasks: true,
        goals: true,
        dailyReport: true
      };
      await user.save();

      console.log('Telegram linked for user: ' + user.email);
      return true;
    } catch (error) {
      console.error('Link account error:', error);
      return false;
    }
  }

  startReminderScheduler() {
    var self = this;
    
    // Har 1 soatda tekshirish
    this.reminderInterval = setInterval(function() {
      self.checkAndSendNotifications();
    }, 60 * 60 * 1000);

    // Dastlab 1 daqiqadan keyin
    setTimeout(function() { self.checkAndSendNotifications(); }, 60000);
    console.log('Notification scheduler started');
  }

  // Bildirishnomalarni tekshirish va yuborish
  async checkAndSendNotifications() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Yakshanba
      
      const users = await User.find({
        telegramChatId: { $exists: true, $ne: null },
        'notificationSettings': { $exists: true }
      });

      for (const user of users) {
        const settings = user.notificationSettings;
        
        // Agar bildirishnomalar o'chirilgan bo'lsa, o'tkazib yuborish
        if (settings.schedule === 'off') {
          continue;
        }
        
        let shouldSend = false;
        let notificationType = '';
        
        // Vaqtni tekshirish
        if (settings.schedule === 'daily' && currentHour === 9) {
          shouldSend = true;
          notificationType = 'daily';
        } else if (settings.schedule === 'weekly' && currentDay === 1 && currentHour === 9) {
          shouldSend = true;
          notificationType = 'weekly';
        } else if (settings.schedule === 'monthly') {
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const isFirstDay = now.getDate() === 1 && currentHour === 9;
          shouldSend = isFirstDay;
          notificationType = 'monthly';
        }
        
        if (shouldSend) {
          await this.sendScheduledNotification(user, notificationType);
        }
      }
    } catch (error) {
      console.error('Notification scheduler error:', error);
    }
  }

  // Rejalashtirilgan bildirishnomani yuborish
  async sendScheduledNotification(user, type) {
    try {
      let message = '';
      
      if (type === 'daily') {
        const analysis = await this.generateFinanceAnalysis(user._id);
        await this.sendFinanceAnalysisWithChart(user.telegramChatId, analysis);
      } else if (type === 'weekly') {
        const analysis = await this.generateFinanceAnalysis(user._id);
        await this.sendFinanceAnalysisWithChart(user.telegramChatId, analysis);
      } else if (type === 'monthly') {
        const analysis = await this.generateFinanceAnalysis(user._id);
        await this.sendFinanceAnalysisWithChart(user.telegramChatId, analysis);
      }
      
      console.log(`✅ ${type} notification sent to user ${user.telegramChatId}`);
    } catch (error) {
      console.error('Error sending scheduled notification:', error);
    }
  }

  async sendDailyReminder() {
    var now = new Date();
    var currentHour = now.getHours();
    
    // Faqat ertalab 9:00 da yuborish
    if (currentHour !== 9) return;

    var today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const users = await User.find({
      telegramChatId: { $exists: true, $ne: null },
      'telegramNotifications.enabled': true
    });

    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      
      // Bugun allaqachon yuborilganmi tekshirish
      var lastSent = user.lastReminderDate ? user.lastReminderDate.toISOString().split('T')[0] : null;
      if (lastSent === today) continue;

      // Ma'lumotlarni olish
      var self = this;
      const debts = await Debt.find({ userId: user._id, status: { $ne: 'paid' }, dueDate: { $exists: true } });
      const tasks = await Task.find({ userId: user._id, status: 'pending', deadline: { $exists: true } });
      const goals = await Goal.find({ userId: user._id, status: 'active', deadline: { $exists: true } });
      const participations = await ChallengeParticipant.find({ userId: user._id, status: 'active' }).populate('challengeId');

      // Yaqinlashgan narsalarni topish (7 kun ichida)
      var urgentDebts = debts.filter(function(d) { return self.getDaysRemaining(d.dueDate) <= 7 && self.getDaysRemaining(d.dueDate) > 0; });
      var urgentTasks = tasks.filter(function(t) { return self.getDaysRemaining(t.deadline) <= 3 && self.getDaysRemaining(t.deadline) >= 0; });
      var urgentGoals = goals.filter(function(g) { return self.getDaysRemaining(g.deadline) <= 7 && self.getDaysRemaining(g.deadline) > 0; });
      var activeChallenges = participations.filter(function(p) { return p.challengeId && p.challengeId.status === 'active'; });

      // Agar hech narsa yaqinlashmagan bo'lsa, yubormaslik
      if (urgentDebts.length === 0 && urgentTasks.length === 0 && urgentGoals.length === 0 && activeChallenges.length === 0) {
        continue;
      }

      // Xabarni tuzish
      var msg = '📋 Kunlik eslatma\n\n';
      var hasContent = false;

      // Qarzlar
      if (urgentDebts.length > 0 && user.telegramNotifications.debts) {
        var mostUrgentDebt = urgentDebts.sort(function(a, b) { return self.getDaysRemaining(a.dueDate) - self.getDaysRemaining(b.dueDate); })[0];
        var debtDays = self.getDaysRemaining(mostUrgentDebt.dueDate);
        var debtType = mostUrgentDebt.type === 'given' ? 'olasiz' : 'berasiz';
        msg += '💰 Qarz: ' + mostUrgentDebt.personName + ' - ' + self.formatCurrency(mostUrgentDebt.amount) + ' ' + debtType;
        msg += ' (' + debtDays + ' kun)\n';
        if (urgentDebts.length > 1) msg += '   +' + (urgentDebts.length - 1) + ' ta boshqa qarz\n';
        hasContent = true;
      }

      // Tasklar
      if (urgentTasks.length > 0 && user.telegramNotifications.tasks) {
        var mostUrgentTask = urgentTasks.sort(function(a, b) { return self.getDaysRemaining(a.deadline) - self.getDaysRemaining(b.deadline); })[0];
        var taskDays = self.getDaysRemaining(mostUrgentTask.deadline);
        var taskTime = taskDays === 0 ? 'bugun' : taskDays + ' kun';
        msg += '✅ Task: ' + mostUrgentTask.title + ' (' + taskTime + ')\n';
        if (urgentTasks.length > 1) msg += '   +' + (urgentTasks.length - 1) + ' ta boshqa task\n';
        hasContent = true;
      }

      // Maqsadlar
      if (urgentGoals.length > 0 && user.telegramNotifications.goals) {
        var mostUrgentGoal = urgentGoals.sort(function(a, b) { return self.getDaysRemaining(a.deadline) - self.getDaysRemaining(b.deadline); })[0];
        var goalDays = self.getDaysRemaining(mostUrgentGoal.deadline);
        var goalProgress = mostUrgentGoal.targetAmount > 0 ? Math.round(mostUrgentGoal.currentAmount / mostUrgentGoal.targetAmount * 100) : (mostUrgentGoal.progress || 0);
        msg += '🎯 Maqsad: ' + mostUrgentGoal.name + ' (' + goalProgress + '%, ' + goalDays + ' kun)\n';
        if (urgentGoals.length > 1) msg += '   +' + (urgentGoals.length - 1) + ' ta boshqa maqsad\n';
        hasContent = true;
      }

      // Challengelar
      if (activeChallenges.length > 0) {
        var challenge = activeChallenges[0];
        msg += '🏆 Challenge: ' + (challenge.challengeId ? challenge.challengeId.title : 'Faol') + ' (' + challenge.currentStreak + ' kun streak)\n';
        if (activeChallenges.length > 1) msg += '   +' + (activeChallenges.length - 1) + ' ta boshqa challenge\n';
        hasContent = true;
      }

      if (!hasContent) continue;

      msg += '\n🌐 Batafsil: Ilovaga o\'ting';

      await this.sendMessage(user.telegramChatId, msg);

      // Yuborilgan sanani saqlash
      await User.updateOne({ _id: user._id }, { lastReminderDate: now });
    }
  }

  formatCurrency(amount, currency = 'so\'m') {
    if (currency === 'dollar') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    } else if (currency === 'yevro') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
    } else {
      return new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' som';
    }
  }

  getDaysRemaining(date) {
    if (!date) return Infinity;
    return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  }

  async processVoiceCommand(voiceUrl, userId) {
    try {
      // 1. Ovozni matnga aylantirish
      const transcription = await this.transcribeAudio(voiceUrl);
      
      // 2. Matnni tahlil qilish
      const analysis = await this.analyzeText(transcription);
      
      // 3. Statistika so'rovini tekshirish
      const isStatsRequest = this.isStatsRequest(transcription);
      
      if (isStatsRequest) {
        const stats = await this.generateFinanceStats(userId);
        return {
          success: true,
          message: `📊 Moliyaviy holatingiz:\n\n${stats}`
        };
      }
      
      // 4. Moliyaga saqlash (agar moliya bo'lsa)
      let result = null;
      if (analysis.type === 'finance' || (analysis.multiple && analysis.operations.length > 0)) {
        result = await this.saveFinance(analysis, userId);
      } else {
        result = { type: 'General', details: 'Moliya emas' };
      }
      
      return {
        success: true,
        message: `✅ Qabul qilindi!\n\n📝 Matn: "${transcription}"\n🎯 Turi: ${result.type}\n${result.details}`
      };
    } catch (error) {
      console.error('Voice command processing error:', error);
      return {
        success: false,
        message: '❌ Ovozli komandani qayta ishlashda xatolik yuz berdi.'
      };
    }
  }

  // Statistika so'rovini aniqlash
  isStatsRequest(text) {
    const statsKeywords = [
      'moliyaviy holatim',
      'moliya holatim',
      'moliyamni ko\'r',
      'moliyamni ko\'rsat',
      'statistikamni',
      'hisobotimni',
      'tahlil qil',
      'tahlili',
      'holatimni',
      'xarajatlarim',
      'daromadlarim',
      'balance',
      'balans',
      'qancha sarfladim',
      'qancha oldim',
      'oylik hisobot',
      'kunlik hisobot'
    ];
    
    const lowerText = text.toLowerCase();
    return statsKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Moliya statistikasini generatsiya qilish
  async generateFinanceStats(userId) {
    const Finance = require('../models/Finance');
    const User = require('../models/User');
    
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      
      // Barcha moliya operatsiyalari
      const allFinances = await Finance.find({ userId }).sort({ date: -1 });
      
      // Oylik moliya
      const monthlyFinances = await Finance.find({ 
        userId, 
        date: { $gte: startOfMonth } 
      });
      
      // Haftalik moliya
      const weeklyFinances = await Finance.find({ 
        userId, 
        date: { $gte: startOfWeek } 
      });
      
      // Hisoblashlar
      const totalIncome = allFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
      const totalExpense = allFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
      const balance = totalIncome - totalExpense;
      
      const monthlyIncome = monthlyFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
      const monthlyExpense = monthlyFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
      const monthlyBalance = monthlyIncome - monthlyExpense;
      
      const weeklyIncome = weeklyFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
      const weeklyExpense = weeklyFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
      const weeklyBalance = weeklyIncome - weeklyExpense;
      
      // Kategoriyalar bo'yicha xarajatlar
      const expensesByCategory = {};
      monthlyFinances.filter(f => f.type === 'expense').forEach(f => {
        expensesByCategory[f.category] = (expensesByCategory[f.category] || 0) + f.amount;
      });
      
      // Eng ko'p xarajat qilingan kategoriyalar
      const topCategories = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => `${category}: ${this.formatCurrency(amount)}`);
      
      // Oxirgi operatsiyalar
      const recentTransactions = allFinances.slice(0, 5).map(f => 
        `${f.type === 'income' ? '➕' : '➖'} ${this.formatCurrency(f.amount)} - ${f.category}`
      );
      
      // AI tavsiyalari
      const recommendations = this.generateRecommendations(balance, monthlyExpense, monthlyIncome, expensesByCategory);
      
      let stats = `💰 *UMUMIY BALANS*\n`;
      stats += `Jami daromad: ${this.formatCurrency(totalIncome)}\n`;
      stats += `Jami xarajat: ${this.formatCurrency(totalExpense)}\n`;
      stats += `Jami balans: ${this.formatCurrency(balance)}\n\n`;
      
      stats += `📅 *BU OY*\n`;
      stats += `Daromad: ${this.formatCurrency(monthlyIncome)}\n`;
      stats += `Xarajat: ${this.formatCurrency(monthlyExpense)}\n`;
      stats += `Balans: ${this.formatCurrency(monthlyBalance)}\n\n`;
      
      stats += `📆 *BU HAFTA*\n`;
      stats += `Daromad: ${this.formatCurrency(weeklyIncome)}\n`;
      stats += `Xarajat: ${this.formatCurrency(weeklyExpense)}\n`;
      stats += `Balans: ${this.formatCurrency(weeklyBalance)}\n\n`;
      
      if (topCategories.length > 0) {
        stats += `🏷️ *ENG KO'P XARAJATLAR*\n`;
        topCategories.forEach((cat, i) => {
          stats += `${i + 1}. ${cat}\n`;
        });
        stats += '\n';
      }
      
      if (recentTransactions.length > 0) {
        stats += `📋 *OXIRGI OPERATSIYALAR*\n`;
        recentTransactions.forEach(trx => {
          stats += `${trx}\n`;
        });
        stats += '\n';
      }
      
      if (recommendations.length > 0) {
        stats += `🤖 *AI TAVSIYALARI*\n`;
        recommendations.forEach(rec => {
          stats += `• ${rec}\n`;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error generating finance stats:', error);
      return '❌ Statistikani olishda xatolik yuz berdi.';
    }
  }

  // AI tavsiyalari
  generateRecommendations(balance, monthlyExpense, monthlyIncome, expensesByCategory) {
    const recommendations = [];
    
    if (balance < 0) {
      recommendations.push('⚠️ Xarajatlaringiz daromadingizdan ko\'p. Bajajni kamaytirishni ko\'rib chiqing.');
    }
    
    if (monthlyExpense > monthlyIncome * 0.8) {
      recommendations.push('💡 Xarajatlaringiz daromadingizning 80% dan oshmoqda. Tejamkorlikka e\'tibor bering.');
    }
    
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome * 100) : 0;
    if (savingsRate < 20) {
      recommendations.push('🎯 Daromadingizning kamida 20% ni tejashga harakat qiling.');
    }
    
    // Eng katta xarajat kategoriyasi
    const topCategory = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0];
    if (topCategory) {
      recommendations.push(`📊 Eng ko'p xarajat qilingan yo'nalish: ${topCategory[0]}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Ajoyib! Moliyaviy holatingiz yaxshi holatda.');
    }
    
    return recommendations;
  }

  // Matn tahlili - faqat moliya uchun, bir nechta operatsiyalarni ajratish
  async analyzeText(text) {
    console.log('🧠 Analyzing text for finance...');
    console.log('📝 Input text:', text);
    
    const lowerText = text.toLowerCase();
    
    // Moliya kalit so'zlari
    const financeKeywords = ['so\'m', 'ming', 'pul', 'sarfladim', 'xarajat', 'taksi', 'market', 'olish', 'berdim', 'oldim', 'daromad', 'yigirma', 'besh', 'ellik', 'o\'ttiz', 'dollar', 'yuz'];
      
    // Daromad kalit so'zlari
    const incomeKeywords = ['oldim', 'topdim', 'daromad', 'haqiqiladim', 'qildim', 'oylik', 'yutqizib qo\'ydim'];
    
    // Matnni operatsiyalarga bo'lish
    const operations = this.splitIntoOperations(text);
    console.log('🔄 Found operations:', operations.length);
    
    const results = [];
    
    for (let operation of operations) {
      console.log('🔍 Analyzing operation:', operation);
      
      let type = 'general';
      let category = 'other';
      let categoryIcon = 'MoreHorizontal';
      let categoryColor = '#64748b';
      let amount = 0;
      let financeType = 'expense'; // default
      let currency = 'so\'m'; // default
      
      const operationLower = operation.toLowerCase();
      
      // Moliya kalit so'zlarni tekshirish
      const financeMatches = financeKeywords.filter(keyword => operationLower.includes(keyword));
      const incomeMatches = incomeKeywords.filter(keyword => operationLower.includes(keyword));
      
      console.log(`💰 Finance matches: ${financeMatches.length}`);
      console.log(`💵 Income matches: ${incomeMatches.length}`);
      
      if (financeMatches.length > 0 || incomeMatches.length > 0) {
        type = 'finance';
        
        // Daromad yoki xarajat
        if (incomeMatches.length > 0) {
          financeType = 'income';
        }
        
        // Valyutani aniqlash
        if (operationLower.includes('dollar')) {
          currency = 'dollar';
        } else if (operationLower.includes('yevro') || operationLower.includes('euro')) {
          currency = 'yevro';
        }
        
        // Kategoriyani aniqlash - Transport birinchi
        if (operationLower.includes('taksi')) {
          category = 'transport';
          categoryIcon = 'Car';
          categoryColor = '#4ECDC4';
        } else if (operationLower.includes('oylik')) {
          category = 'salary';
          categoryIcon = 'DollarSign';
          categoryColor = '#1DD1A1';
        }
        // ... qolgan kategoriyalar shu yerda
        
        // Raqamlarni ajratib olish
        amount = this.extractAmount(operation);
        
        console.log(`💰 Finance detected: ${financeType}, category: ${category}, amount: ${amount}`);
        
        // Faqat moliya bo'lsa va amount > 0 bo'lsa qo'shish
        if (type === 'finance' && amount > 0) {
          results.push({
            type: type,
            financeType: financeType,
            category: category,
            categoryIcon: categoryIcon,
            categoryColor: categoryColor,
            amount: amount,
            currency: currency,
            text: operation.trim()
          });
        }
      }
    }
    
    // Agar bir nechta operatsiya bo'lsa, ularni qaytarish
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} finance operations`);
      return {
        multiple: true,
        operations: results
      };
    }
    
    // Agar moliya topilmasa
    return {
      type: 'general',
      multiple: false,
      operations: []
    };
  }

  // Moliyani saqlash - bir nechta operatsiyani qo'llab-quvvatlaydi
  async saveFinance(analysis, userId) {
    const Finance = require('../models/Finance');
    
    try {
      // Agar bir nechta operatsiya bo'lsa
      if (analysis.multiple && analysis.operations.length > 0) {
        const savedOperations = [];
        
        for (let operation of analysis.operations) {
          const finance = new Finance({
            userId: userId,
            type: operation.financeType,
            amount: Math.abs(operation.amount),
            category: operation.category,
            categoryIcon: operation.categoryIcon,
            categoryColor: operation.categoryColor,
            description: operation.text,
            date: new Date()
          });
          
          await finance.save();
          savedOperations.push(finance);
        }
        
        return {
          type: 'Moliya (ko\'p operatsiya)',
          details: analysis.operations.map(op => 
            `💰 ${this.formatCurrency(op.amount, op.currency)} - ${op.category}\n📝 ${op.text}`
          ).join('\n\n'),
          count: savedOperations.length
        };
      } 
      // Agar bitta operatsiya bo'lsa
      else if (analysis.type === 'finance') {
        const finance = new Finance({
          userId: userId,
          type: analysis.financeType,
          amount: Math.abs(analysis.amount),
          category: analysis.category,
          categoryIcon: analysis.categoryIcon,
          categoryColor: analysis.categoryColor,
          description: analysis.text,
          date: new Date()
        });
        
        await finance.save();
        
        return {
          type: 'Moliya',
          details: `💰 ${this.formatCurrency(analysis.amount, analysis.currency)} - ${analysis.category}\n📝 ${analysis.text}`
        };
      }
    } catch (error) {
      console.error('Error saving finance:', error);
      throw error;
    }
  }

  // Matnni operatsiyalarga bo'lish
  splitIntoOperations(text) {
    // Operatsiyalarni ajratish uchun bo'luvchilar
    const separators = [
      /\bva\b/i,           // "va"
      /\bham\b/i,          // "ham" 
      /\bshuningdek\b/i,    // "shuningdek"
      /\bbundan tashqari\b/i, // "bundan tashqari"
      /\bkeyin\b/i,        // "keyin"
      /\bundan so'ng\b/i,   // "undan so'ng"
      /,/,                 // vergul
      /;/,                 // nuqta vergul
      /\.\s+/             // nuqta va space
    ];
    
    let operations = [text];
    
    for (let separator of separators) {
      const newOperations = [];
      for (let op of operations) {
        const parts = op.split(separator).map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length > 1) {
          newOperations.push(...parts);
        } else {
          newOperations.push(op);
        }
      }
      operations = newOperations;
    }
    
    console.log('🔄 Split operations:', operations);
    return operations;
  }

  // Raqamlarni ajratib olish - alohida metod
  extractAmount(text) {
    const numberWords = {
      'bir': 1, 'ikki': 2, 'uch': 3, 'to\'rt': 4, 'besh': 5, 'olti': 6, 'yetti': 7, 'sakkiz': 8, 'to\'qqiz': 9, 'o\'n': 10,
      'yigirma': 20, 'o\'ttiz': 30, 'qirq': 40, 'ellik': 50, 'oltmish': 60, 'yetmish': 70, 'sakson': 80, 'to\'qson': 90, 'yuz': 100,
      'ming': 1000, 'milion': 1000000, 'million': 1000000
    };
    
    console.log('🔍 Starting number extraction for:', text);
    
    // O'zbek sonlarini raqamlarga aylantirish
    let processedText = text.toLowerCase();
    for (let [word, num] of Object.entries(numberWords)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processedText = processedText.replace(regex, ` ${num} `);
    }
    
    console.log('🔢 Processed text:', processedText);
    
    // Raqamlarni topish va hisoblash
    const words = processedText.split(/\s+/).filter(w => w.trim());
    console.log('📝 Words array:', words);
    
    let totalAmount = 0;
    let currentNumber = 0;
    let multiplier = 1;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const num = parseInt(word);
      
      if (!isNaN(num)) {
        if (num === 1000 || num === 1000000) {
          // Bu multiplier (ming, million)
          if (currentNumber === 0) {
            currentNumber = 1; // "ming" yoki "million" yolg'iz kelganda
          }
          multiplier = num;
          currentNumber *= multiplier;
          totalAmount += currentNumber;
          console.log(`💰 Multiplier: ${num}, Current: ${currentNumber}, Total: ${totalAmount}`);
          
          // Reset
          currentNumber = 0;
          multiplier = 1;
        } else if (num === 100) {
          // Yuz - keyingi raqamga ko'paytirish uchun
          currentNumber = (currentNumber || 0) + num;
          console.log(`💰 Added 100: ${currentNumber}`);
        } else if (num >= 10 && num <= 90) {
          // O'nliklar (yigirma, o'ttiz, etc.)
          currentNumber = (currentNumber || 0) + num;
          console.log(`💰 Added tens: ${num}, Current: ${currentNumber}`);
        } else if (num >= 1 && num <= 9) {
          // Birliklar (bir, ikki, etc.)
          currentNumber = (currentNumber || 0) + num;
          console.log(`💰 Added units: ${num}, Current: ${currentNumber}`);
        }
      }
    }
    
    // Agar qolgan son bo'lsa qo'shish
    if (currentNumber > 0) {
      totalAmount += currentNumber;
      console.log(`💰 Added remaining: ${currentNumber}, Final total: ${totalAmount}`);
    }
    
    // Shuningdek, to'g'ridan-to'g'ri raqamlarni ham topish
    const directNumbers = text.match(/\d+/g);
    if (directNumbers) {
      for (let numStr of directNumbers) {
        const num = parseInt(numStr);
        if (num > 0) {
          totalAmount += num;
          console.log(`💰 Added direct number: ${num}, Total: ${totalAmount}`);
        }
      }
    }
    
    console.log(`💰 FINAL AMOUNT: ${totalAmount}`);
    return totalAmount;
  }

  async transcribeWithMohirAI(audioPath) {
    const FormData = require('form-data');
    const fs = require('fs');
    const axios = require('axios');
    
    try {
      // FormData yaratish
      const form = new FormData();
      form.append('file', fs.createReadStream(audioPath));
      form.append('language', 'uz');
      form.append('blocking', 'true');
      form.append('return_offsets', 'false');
      form.append('run_diarization', 'false');
      
      console.log('🤖 Sending to Mohir AI STT API...');
      
      // Mohir AI API ga so'rov yuborish
      const response = await axios.post(
        'https://uzbekvoice.ai/api/v1/stt',
        form,
        {
          headers: {
            'Authorization': process.env.MOHIR_AI_API_KEY || '02ecec9f-8d33-4479-873b-68ac37897d64:2759153e-b632-42a5-af45-51ffa7fcfbed',
            ...form.getHeaders()
          },
          timeout: 60000 // 60 sekund
        }
      );
      
      console.log('✅ Mohir AI response:', response.data);
      
      // Natijani olish
      if (response.data && response.data.result && response.data.result.text) {
        const transcription = response.data.result.text.trim();
        console.log('🎯 Mohir AI transcription:', transcription);
        return transcription;
      } else {
        throw new Error('Invalid response format from Mohir AI');
      }
      
    } catch (error) {
      console.error('Mohir AI API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async transcribeAudio(audioUrl) {
    console.log('🎵 Starting Mohir AI STT transcription...');
    
    // Audio faylni yuklab olish
    const https = require('https');
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');
    const axios = require('axios');
    
    const audioPath = path.join(__dirname, '../../temp', `voice_${Date.now()}.ogg`);
    
    console.log('💾 Downloading audio to:', audioPath);
    
    // OGG faylni yuklab olish
    const file = fs.createWriteStream(audioPath);
    
    await new Promise((resolve, reject) => {
      https.get(audioUrl, (response) => {
        console.log('📥 HTTP Status:', response.statusCode);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    });
    
    try {
      console.log('🔍 File exists after download:', fs.existsSync(audioPath));
      console.log('📊 File size:', fs.statSync(audioPath).size, 'bytes');
      
      // Mohir AI STT API ga yuborish
      const transcription = await this.transcribeWithMohirAI(audioPath);
      
      // Vaqtinchalik faylni o'chirish
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      
      return transcription;
    } catch (error) {
      console.error('❌ Mohir AI STT error:', error);
      // Vaqtinchalik faylni o'chirish (xatolik bo'lsa ham)
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      
      throw error;
    }
  }

  // Registration flow for new users
  async startRegistrationFlow(chatId, phoneNumber, telegramUser) {
    try {
      // Store temporary registration data
      this.registrationData = this.registrationData || {};
      this.registrationData[chatId] = {
        phone: phoneNumber,
        telegramUser: telegramUser,
        step: 'name'
      };

      const welcomeMessage = `🆕 **Ro'yxatdan o'tish**\n\n` +
        `📱 Telefon: ${phoneNumber}\n\n` +
        `Iltimos, ismingizni kiriting:`;

      await this.bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          remove_keyboard: true
        }
      });

      // Set up message listener for registration steps
      this.setupRegistrationListener(chatId);

    } catch (error) {
      console.error('Registration flow error:', error);
      await this.bot.sendMessage(chatId, '❌ Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    }
  }

  setupRegistrationListener(chatId) {
    const messageHandler = async (msg) => {
      if (msg.chat.id !== chatId) return;

      const registration = this.registrationData[chatId];
      if (!registration) return;

      try {
        switch (registration.step) {
          case 'name':
            registration.firstName = msg.text.trim();
            registration.step = 'surname';
            
            await this.bot.sendMessage(chatId, 
              `✅ Ism: ${registration.firstName}\n\n` +
              `Endi familyangizni kiriting:`,
              { parse_mode: 'Markdown' }
            );
            break;

          case 'surname':
            registration.lastName = msg.text.trim();
            registration.step = 'password';
            
            await this.bot.sendMessage(chatId,
              `✅ Ism: ${registration.firstName}\n` +
              `✅ Familya: ${registration.lastName}\n\n` +
              `Endi parol o'ylab toping (kamida 6 ta belgi):`,
              { parse_mode: 'Markdown' }
            );
            break;

          case 'password':
            const password = msg.text.trim();
            
            if (password.length < 6) {
              await this.bot.sendMessage(chatId,
                '❌ Parol kamida 6 ta belgidan iborat bo\'lishi kerak!\n\n' +
                'Qayta kiriting:',
                { parse_mode: 'Markdown' }
              );
              return;
            }

            // Create new user
            const newUser = new User({
              firstName: registration.firstName,
              lastName: registration.lastName,
              phone: registration.phone,
              password: password,
              authProvider: 'phone',
              telegramChatId: chatId.toString(),
              telegramUsername: registration.telegramUser.username,
              telegramFirstName: registration.telegramUser.first_name,
              telegramLinkedAt: new Date(),
              lastLogin: new Date(),
              emailVerified: true // Phone auth users are considered verified
            });

            await newUser.save();

            // Clean up registration data
            delete this.registrationData[chatId];

            const successMessage = `🎉 **Ro'yxatdan o'tdingiz!**\n\n` +
              `👋 Salom, ${registration.firstName} ${registration.lastName}!\n` +
              `📱 Telefon: ${registration.phone}\n\n` +
              `✅ Tizimga muvaffaqiyatli kirdingiz!\n` +
              `🎉 Endi botdan to'liq foydalanishingiz mumkin!`;

            await this.bot.sendMessage(chatId, successMessage, {
              parse_mode: 'Markdown',
              reply_markup: this.getMainKeyboard(true)
            });

            // Remove this listener
            this.bot.removeListener('message', messageHandler);
            break;

          default:
            break;
        }
      } catch (error) {
        console.error('Registration handler error:', error);
        await this.bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    };

    this.bot.on('message', messageHandler);
  }

  async showSettings(chatId) {
    const user = await User.findOne({ telegramChatId: chatId.toString() });
    
    if (!user) {
      await this.bot.sendMessage(chatId, 
        '❌ Avval kontaktni ulashing!',
        { 
          reply_markup: {
            keyboard: [
              [{ text: '📱 Kontaktni ulashish', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        }
      );
      return;
    }

    const settingsMessage = `⚙️ **Sozlamalar**\n\n` +
      `👋 Salom, ${user.firstName}!\n` +
      `📱 Telefon: ${user.phone}\n` +
      `🔐 Auth provider: ${user.authProvider}\n` +
      `📅 Ro'yxatdan o'tgan: ${new Date(user.createdAt).toLocaleDateString('uz-UZ')}\n\n` +
      `🎉 Hisobingiz faol va tayyor!`;

    await this.bot.sendMessage(chatId, settingsMessage, {
      parse_mode: 'Markdown',
      reply_markup: this.getMainKeyboard(true)
    });
  }

  async sendMessage(chatId, message, options) {
    try {
      if (this.bot) await this.bot.sendMessage(chatId, message, options || {});
    } catch (error) {
      console.error('Send message error:', error.message);
    }
  }

  async processUpdate(update) {
    if (this.bot) this.bot.processUpdate(update);
  }

  stop() {
    if (this.reminderInterval) clearInterval(this.reminderInterval);
    if (this.bot && this.bot.stopPolling) this.bot.stopPolling();
    console.log('InFast AI Bot stopped');
  }

  async healthCheck() {
    try {
      if (!this.bot) return { status: 'error', message: 'Bot not initialized' };
      var me = await this.bot.getMe();
      return { status: 'ok', bot: me.username };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = new InFastAIBotService();
