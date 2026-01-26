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
    if (!isLinked) {
      return {
        keyboard: [
          [{ text: 'Hisobni ulash' }],
          [{ text: 'Ilovaga otish', web_app: { url: this.webAppUrl } }]
        ],
        resize_keyboard: true
      };
    }
    return {
      keyboard: [
        [{ text: 'Statistika' }],
        [{ text: '🎤 Ovozli komanda' }],
        [{ text: 'Ilovaga otish', web_app: { url: this.webAppUrl } }]
      ],
      resize_keyboard: true
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

      if (startParam && startParam.startsWith('link_')) {
        const linkCode = startParam.replace('link_', '');
        const linked = await this.linkAccount(chatId, linkCode, msg.from);
        if (linked) {
          var successMsg = '🎉 Ajoyib, ' + firstName + '!\n\n';
          successMsg += '✅ Hisobingiz muvaffaqiyatli ulandi!\n\n';
          successMsg += '📊 Endi statistikalaringizni ko\'ring\n';
          successMsg += '🔔 Eslatmalar avtomatik keladi';
          await this.bot.sendMessage(chatId, successMsg, { reply_markup: this.getMainKeyboard(true) });
          return;
        }
      }

      const user = await User.findOne({ telegramChatId: chatId.toString() });

      if (user) {
        var welcomeBack = '👋 Salom, ' + firstName + '!\n\n';
        welcomeBack += '📊 Statistika - ma\'lumotlaringizni ko\'ring\n';
        welcomeBack += '🌐 Ilova - to\'liq boshqaruv';
        await this.bot.sendMessage(chatId, welcomeBack, { reply_markup: this.getMainKeyboard(true) });
      } else {
        var welcomeNew = '🚀 Xush kelibsiz, ' + firstName + '!\n\n';
        welcomeNew += '🤖 Men InFast AI botiman\n\n';
        welcomeNew += '📱 Hisobingizni ulang va:\n';
        welcomeNew += '• Statistikalarni ko\'ring\n';
        welcomeNew += '• Eslatmalar oling\n';
        welcomeNew += '• Ilovani boshqaring';
        await this.bot.sendMessage(chatId, welcomeNew, { reply_markup: this.getMainKeyboard(false) });
      }
    });

    this.bot.onText(/\/link\s+(.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const linkCode = match[1];
      const linked = await this.linkAccount(chatId, linkCode, msg.from);
      
      if (linked) {
        await this.bot.sendMessage(chatId, '🎉 Ajoyib! Hisobingiz ulandi!', { reply_markup: this.getMainKeyboard(true) });
      } else {
        await this.bot.sendMessage(chatId, '❌ Kod noto\'g\'ri yoki muddati o\'tgan', { reply_markup: this.getMainKeyboard(false) });
      }
    });

    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      
      const chatId = msg.chat.id;
      const text = msg.text;
      const user = await User.findOne({ telegramChatId: chatId.toString() });

      if (text === 'Hisobni ulash') {
        await this.sendLinkInstructions(chatId);
      } else if (text === 'Statistika') {
        if (!user) {
          await this.bot.sendMessage(chatId, 'Avval hisobni ulang!', { reply_markup: this.getMainKeyboard(false) });
          return;
        }
        await this.bot.sendMessage(chatId, 'Qaysi statistikani kormoqchisiz?', { reply_markup: this.getStatsKeyboard() });
      } else if (text === '🎤 Ovozli komanda') {
        if (!user) {
          await this.bot.sendMessage(chatId, 'Avval hisobni ulang!', { reply_markup: this.getMainKeyboard(false) });
          return;
        }
        await this.bot.sendMessage(chatId, 
          '🎤 Iltimos, ovozli xabaringizni yuboring:\n\n' +
          'Misol uchun:\n' +
          '• "Bugun taksiga 25 ming so\'m sarfladim"\n' +
          '• "Ertadan kotta vazifa qilishim kerak"\n' +
          '• "Yil oxiriga qadar 1 million yig\'ishim kerak"\n\n' +
          '📞 Mikrofon tugmasini bosib, gapiring!',
          { reply_markup: { remove_keyboard: true } }
        );
        
        // 5 soniyadan keyin asosiy keyboardni qaytarish
        setTimeout(async () => {
          await this.bot.sendMessage(chatId, 'Asosiy menyu:', { 
            reply_markup: this.getMainKeyboard(true) 
          });
        }, 5000);
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
          await this.bot.sendMessage(chatId, 'Avval hisobni ulang!', { reply_markup: this.getMainKeyboard(false) });
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
        await this.bot.sendMessage(msg.chat.id, '❌ Ovozli xabarni tahlil qilishda xatolik yuz berdi.\n\nXatolik: ' + error.message);
      }
    });

    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data;
      await this.bot.answerCallbackQuery(query.id);

      const user = await User.findOne({ telegramChatId: chatId.toString() });
      if (!user) {
        await this.bot.sendMessage(chatId, 'Avval hisobni ulang!');
        return;
      }

      var msgId = query.message.message_id;
      if (data === 'stats_debts') await this.sendDebtStats(chatId, user, msgId);
      else if (data === 'stats_tasks') await this.sendTaskStats(chatId, user, msgId);
      else if (data === 'stats_goals') await this.sendGoalStats(chatId, user, msgId);
      else if (data === 'stats_finance') await this.sendFinanceStats(chatId, user, msgId);
      else if (data === 'stats_challenges') await this.sendChallengeStats(chatId, user, msgId);
      else if (data === 'stats_overview') await this.sendOverviewStats(chatId, user, msgId);
      else if (data === 'back_stats') {
        await this.bot.editMessageText('Qaysi statistikani kormoqchisiz?', {
          chat_id: chatId,
          message_id: msgId,
          reply_markup: this.getStatsKeyboard()
        });
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      this.bot.on('polling_error', function(e) { console.error('Polling error:', e.message); });
    }
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
      self.sendDailyReminder();
    }, 60 * 60 * 1000);

    // Dastlab 1 daqiqadan keyin
    setTimeout(function() { self.sendDailyReminder(); }, 60000);
    console.log('Reminder scheduler started');
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
      
      // 3. Moliyaga saqlash (agar moliya bo'lsa)
      let result = null;
      if (analysis.type === 'finance') {
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

  // Matn tahlili - faqat moliya uchun
  async analyzeText(text) {
    console.log('🧠 Analyzing text for finance...');
    console.log('📝 Input text:', text);
    
    const lowerText = text.toLowerCase();
    
    // Moliya kalit so'zlari
    const financeKeywords = ['so\'m', 'ming', 'pul', 'sarfladim', 'xarajat', 'taksi', 'market', 'olish', 'berdim', 'oldim', 'daromad', 'yigirma', 'besh', 'ellik', 'o\'ttiz', 'dollar', 'yuz'];
      
    // Daromad kalit so'zlari
    const incomeKeywords = ['oldim', 'topdim', 'daromad', 'haqiqiladim', 'qildim', 'oylik', 'yutqizib qo\'ydim'];
    
    let type = 'general';
    let category = 'other';
    let categoryIcon = 'MoreHorizontal';
    let categoryColor = '#64748b';
    let amount = 0;
    let financeType = 'expense'; // default
    let currency = 'so\'m'; // default
    
    // Moliya kalit so'zlarni tekshirish
    const financeMatches = financeKeywords.filter(keyword => lowerText.includes(keyword));
    const incomeMatches = incomeKeywords.filter(keyword => lowerText.includes(keyword));
    
    console.log(`💰 Finance matches: ${financeMatches.length}`);
    console.log(`💵 Income matches: ${incomeMatches.length}`);
    
    if (financeMatches.length > 0 || incomeMatches.length > 0) {
      type = 'finance';
      
      // Daromad yoki xarajat
      if (incomeMatches.length > 0) {
        financeType = 'income';
      }
      
      // Valyutani aniqlash
      if (lowerText.includes('dollar')) {
        currency = 'dollar';
      } else if (lowerText.includes('yevro') || lowerText.includes('euro')) {
        currency = 'yevro';
      }
      
      // Kategoriyani aniqlash - avtomatik tanlash (eng muhim keywordlar birinchi)
      // Transport - eng aniq keywordlar birinchi
      if (lowerText.includes('taksi')) {
        category = 'transport';
        categoryIcon = 'Car';
        categoryColor = '#4ECDC4';
      } else if (lowerText.includes('marshrutka')) {
        category = 'transport';
        categoryIcon = 'Car';
        categoryColor = '#4ECDC4';
      } else if (lowerText.includes('avtobus')) {
        category = 'transport';
        categoryIcon = 'Car';
        categoryColor = '#4ECDC4';
      } else if (lowerText.includes('metro')) {
        category = 'transport';
        categoryIcon = 'Car';
        categoryColor = '#4ECDC4';
      } else if (lowerText.includes('yolovchi')) {
        category = 'transport';
        categoryIcon = 'Car';
        categoryColor = '#4ECDC4';
      } else if (lowerText.includes('transport')) {
        category = 'transport';
        categoryIcon = 'Car';
        categoryColor = '#4ECDC4';
      } 
      // Qimor o'yinlari - juda aniq keywordlar
      else if (lowerText.includes('tikib')) {
        category = 'gambling';
      } else if (lowerText.includes('yutqizib')) {
        category = 'gambling';
      } else if (lowerText.includes('kazino')) {
        category = 'gambling';
      } else if (lowerText.includes('bukmeker')) {
        category = 'gambling';
      } else if (lowerText.includes('lotereya')) {
        category = 'gambling';
      } else if (lowerText.includes('qimor')) {
        category = 'gambling';
      }
      // Taom
      else if (lowerText.includes('restoran')) {
        category = 'Food';
      } else if (lowerText.includes('kafé') || lowerText.includes('cafe')) {
        category = 'Food';
      } else if (lowerText.includes('oshxona')) {
        category = 'Food';
      } else if (lowerText.includes('ovqat')) {
        category = 'Food';
      } else if (lowerText.includes('taom')) {
        category = 'Food';
      } else if (lowerText.includes('market')) {
        category = 'Food';
      }
      // Shopping
      else if (lowerText.includes('magazin')) {
        category = 'Shopping';
      } else if (lowerText.includes('do\'kon')) {
        category = 'Shopping';
      } else if (lowerText.includes('sotib')) {
        category = 'Shopping';
      } else if (lowerText.includes('olish')) {
        category = 'Shopping';
      } else if (lowerText.includes('shopping')) {
        category = 'Shopping';
      } else if (lowerText.includes('savdo')) {
        category = 'Shopping';
      }
      // Xizmatlar
      else if (lowerText.includes('ekspert')) {
        category = 'Services';
      } else if (lowerText.includes('konsultatsiya')) {
        category = 'Services';
      } else if (lowerText.includes('yurist')) {
        category = 'Services';
      } else if (lowerText.includes('hisobchi')) {
        category = 'Services';
      } else if (lowerText.includes('xizmat')) {
        category = 'Services';
      }
      // Kommunal to'lovlar
      else if (lowerText.includes('kommunal')) {
        category = 'Utilities';
      } else if (lowerText.includes('internet')) {
        category = 'Utilities';
      } else if (lowerText.includes('telefon')) {
        category = 'Utilities';
      } else if (lowerText.includes('elektr')) {
        category = 'Utilities';
      } else if (lowerText.includes('gaz')) {
        category = 'Utilities';
      } else if (lowerText.includes('suv')) {
        category = 'Utilities';
      }
      // Uy-joy
      else if (lowerText.includes('ijara')) {
        category = 'housing';
      } else if (lowerText.includes('kvartira')) {
        category = 'housing';
      } else if (lowerText.includes('ipoteka')) {
        category = 'housing';
      } else if (lowerText.includes('uy-joy')) {
        category = 'housing';
      } else if (lowerText.includes('uy')) {
        category = 'housing';
      }
      // Sog'liq
      else if (lowerText.includes('dorixona')) {
        category = 'health';
      } else if (lowerText.includes('kasalxona')) {
        category = 'health';
      } else if (lowerText.includes('tibbiyot')) {
        category = 'health';
      } else if (lowerText.includes('shifokor')) {
        category = 'health';
      } else if (lowerText.includes('sog\'liq')) {
        category = 'health';
      }
      // Ta'lim
      else if (lowerText.includes('universitet')) {
        category = 'education';
      } else if (lowerText.includes('maktab')) {
        category = 'education';
      } else if (lowerText.includes('kurs')) {
        category = 'education';
      } else if (lowerText.includes('o\'qish')) {
        category = 'education';
      } else if (lowerText.includes('ta\'lim')) {
        category = 'education';
      }
      // Kiyim-kechak
      else if (lowerText.includes('poyabzal')) {
        category = 'clothing';
      } else if (lowerText.includes('kurtka')) {
        category = 'clothing';
      } else if (lowerText.includes('libos')) {
        category = 'clothing';
      } else if (lowerText.includes('kiyim')) {
        category = 'clothing';
      }
      // Avtomobil
      else if (lowerText.includes('benzin')) {
        category = 'vehicle';
      } else if (lowerText.includes('yog\'')) {
        category = 'vehicle';
      } else if (lowerText.includes('tezlik')) {
        category = 'vehicle';
      } else if (lowerText.includes('mashina')) {
        category = 'vehicle';
      } else if (lowerText.includes('avtomobil')) {
        category = 'vehicle';
      }
      // Sayohat
      else if (lowerText.includes('mehmonxona')) {
        category = 'travel';
      } else if (lowerText.includes('aviachipta')) {
        category = 'travel';
      } else if (lowerText.includes('dam olish')) {
        category = 'travel';
      } else if (lowerText.includes('sayohat')) {
        category = 'travel';
      }
      // Sovg'alar
      else if (lowerText.includes('tug\'ilgan kun')) {
        category = 'gifts';
      } else if (lowerText.includes('to\'y')) {
        category = 'gifts';
      } else if (lowerText.includes('bayram')) {
        category = 'gifts';
      } else if (lowerText.includes('sovg\'a')) {
        category = 'gifts';
      }
      // Sport
      else if (lowerText.includes('fitnes')) {
        category = 'sports';
      } else if (lowerText.includes('zal')) {
        category = 'sports';
      } else if (lowerText.includes('badiy tana')) {
        category = 'sports';
      } else if (lowerText.includes('sport')) {
        category = 'sports';
      }
      // Daromad kategoriyalari
      else if (lowerText.includes('bonus')) {
        category = 'salary';
      } else if (lowerText.includes('premium')) {
        category = 'salary';
      } else if (lowerText.includes('oylik')) {
        category = 'salary';
      } else if (lowerText.includes('ish haqi')) {
        category = 'salary';
      } else if (lowerText.includes('maosh')) {
        category = 'salary';
      }
      else if (lowerText.includes('tadbirkorlik')) {
        category = 'business';
      } else if (lowerText.includes('foyda')) {
        category = 'business';
      } else if (lowerText.includes('savdo')) {
        category = 'business';
      } else if (lowerText.includes('biznes')) {
        category = 'business';
      }
      else if (lowerText.includes('aksiya')) {
        category = 'investment';
      } else if (lowerText.includes('valyuta')) {
        category = 'investment';
      } else if (lowerText.includes('kripto')) {
        category = 'investment';
      } else if (lowerText.includes('investitsiya')) {
        category = 'investment';
      }
      // Qarz kredit
      else if (lowerText.includes('foiz')) {
        category = 'debt';
      } else if (lowerText.includes('nasiya')) {
        category = 'debt';
      } else if (lowerText.includes('kredit')) {
        category = 'debt';
      } else if (lowerText.includes('qarz')) {
        category = 'debt';
      }
      // Oilaviy
      else if (lowerText.includes('farzand')) {
        category = 'family';
      } else if (lowerText.includes('bola')) {
        category = 'family';
      } else if (lowerText.includes('oilaviya')) {
        category = 'family';
      } else if (lowerText.includes('oilaviy')) {
        category = 'family';
      }
      // Agar hech qaysi kategoriya topilmasa - "other"
      else {
        category = 'other';
      }
      
      // Raqamlarni ajratib olish - to'g'rilangan versiya
      const numberWords = {
        'bir': 1, 'ikki': 2, 'uch': 3, 'to\'rt': 4, 'besh': 5, 'olti': 6, 'yetti': 7, 'sakkiz': 8, 'to\'qqiz': 9, 'o\'n': 10,
        'yigirma': 20, 'o\'ttiz': 30, 'qirq': 40, 'ellik': 50, 'oltmish': 60, 'yetmish': 70, 'sakson': 80, 'to\'qson': 90, 'yuz': 100
      };
      
      let totalAmount = 0;
      
      // Matndan raqamlarni ajratib olish
      const cleanText = text.replace(/[^0-9a-z'ʻ\s]/gi, ' ').toLowerCase();
      
      // O'zbek sonlarini raqamlarga aylantirish
      let processedText = cleanText;
      for (let [word, num] of Object.entries(numberWords)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processedText = processedText.replace(regex, num);
      }
      
      console.log('🔍 Processed text:', processedText);
      
      // Raqamlarni topish - "ellik besh ming" -> "50 55 ming"
      const words = processedText.split(/\s+/);
      console.log('🔢 Words:', words);
      
      let i = 0;
      while (i < words.length) {
        const word = words[i];
        
        if (/^\d+$/.test(word)) {
          const num = parseInt(word);
          
          // Keyingi so'z "ming" yoki "million" bo'lishini tekshirish
          if (i + 1 < words.length) {
            const nextWord = words[i + 1];
            
            if (nextWord === 'ming' || nextWord === '1000') {
              totalAmount += num * 1000;
              i += 2; // "ming" so'zini o'tkazib yuborish
              console.log(`💰 ${num} ming -> ${num * 1000}`);
            } else if (nextWord === 'million' || nextWord === '1000000') {
              totalAmount += num * 1000000;
              i += 2; // "million" so'zini o'tkazib yuborish
              console.log(`💰 ${num} million -> ${num * 1000000}`);
            } else {
              totalAmount += num;
              i++;
              console.log(`💰 ${num} -> ${num}`);
            }
          } else {
            totalAmount += num;
            i++;
            console.log(`💰 ${num} -> ${num}`);
          }
        } else {
          i++;
        }
      }
      
      amount = totalAmount;
      console.log(`💰 Final calculated amount: ${amount}`);
      
      console.log(`💰 Finance detected: ${financeType}, category: ${category}, amount: ${amount}`);
    }
    
    return {
      type: type,
      financeType: financeType,
      category: category,
      categoryIcon: categoryIcon,
      categoryColor: categoryColor,
      amount: amount,
      currency: currency,
      text: text
    };
  }

  // Moliyani saqlash
  async saveFinance(analysis, userId) {
    const Finance = require('../models/Finance');
    
    try {
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
    } catch (error) {
      console.error('Error saving finance:', error);
      throw error;
    }
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
