
const Challenge = require('../models/Challenge');
const ChallengeParticipant = require('../models/ChallengeParticipant');
const DailyProgress = require('../models/DailyProgress');
const crypto = require('crypto');

const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};


exports.getChallenges = async (req, res) => {
  try {
    const userId = req.user._id;

    const participations = await ChallengeParticipant.find({
      userId,
      status: { $in: ['active', 'completed'] }
    }).populate({
      path: 'challengeId',
      populate: {
        path: 'creatorId',
        select: 'name avatar'
      }
    });

    // Get progress data for each challenge to determine today's status
    const DailyProgress = require('../models/DailyProgress');
    const challengesWithProgress = await Promise.all(
      participations.map(async (p) => {
        if (!p.challengeId) return null;

        // Get today's progress
        const progress = await DailyProgress.find({
          userId,
          challengeId: p.challengeId._id
        }).sort({ dayNumber: 1 }).lean();

        return {
          ...p.challengeId.toObject(),
          participantData: {
            role: p.role,
            status: p.status,
            completedDays: p.completedDays,
            currentStreak: p.currentStreak,
            maxStreak: p.maxStreak,
            totalPoints: p.totalPoints,
            completionRate: p.completionRate,
            badges: p.badges
          },
          progress // Include progress array so frontend can check today's status
        };
      })
    );

    const challenges = challengesWithProgress.filter(c => c !== null);

    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengelarni yuklashda xatolik'
    });
  }
};

// Create new challenge
exports.createChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      type,
      category,
      duration,
      dailyGoal,
      trackingType,
      maxParticipants,
      isPublic,
      startDate,
      icon,
      color
    } = req.body;

    // Validate required fields
    if (!title || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Sarlavha va boshlanish sanasi majburiy'
      });
    }

    // Create challenge
    const challenge = new Challenge({
      creatorId: userId,
      title,
      description,
      type: type || 'daily',
      category: category || 'custom',
      duration: duration || 30,
      dailyGoal: dailyGoal || { value: 1, unit: 'times' },
      trackingType: trackingType || 'manual',
      maxParticipants: maxParticipants || 10,
      isPublic: isPublic || false,
      startDate: new Date(startDate),
      icon: icon || '🎯',
      color: color || '#3B82F6',
      status: 'active' // Set status to active to trigger chat group creation
    });

    // Generate invite code
    challenge.inviteCode = generateInviteCode();
    challenge.inviteCodeExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Add creator as participant
    const User = require('../models/User');
    const user = await User.findById(userId);

    challenge.participants.push({
      userId,
      name: user?.firstName || 'User',
      role: 'owner',
      status: 'active',
      joinedAt: new Date()
    });

    await challenge.save();

    // Also create ChallengeParticipant for progress tracking
    const participant = new ChallengeParticipant({
      userId,
      challengeId: challenge._id,
      role: 'owner',
      status: 'active'
    });
    await participant.save();

    // Create daily progress entries for the challenge duration
    const progressEntries = [];
    for (let day = 1; day <= challenge.duration; day++) {
      const date = new Date(challenge.startDate);
      date.setDate(date.getDate() + day - 1);

      progressEntries.push({
        userId,
        challengeId: challenge._id,
        participantId: participant._id,
        dayNumber: day,
        date,
        goalValue: challenge.dailyGoal.value,
        status: 'pending'
      });
    }
    await DailyProgress.insertMany(progressEntries);

    res.status(201).json({
      success: true,
      message: 'Challenge muvaffaqiyatli yaratildi',
      challenge: {
        ...challenge.toObject(),
        participantData: {
          role: 'owner',
          status: 'active',
          completedDays: 0,
          currentStreak: 0,
          maxStreak: 0,
          totalPoints: 0,
          completionRate: 0,
          badges: []
        }
      }
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challenge yaratishda xatolik'
    });
  }
};

// Join challenge by invite code
exports.joinChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { inviteCode } = req.body;

    console.log('Join attempt with code:', inviteCode);

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Taklif kodi majburiy'
      });
    }

    // Find challenge by invite code - try both uppercase and as-is
    let challenge = await Challenge.findOne({
      inviteCode: inviteCode.toUpperCase(),
      status: { $in: ['pending', 'active'] }
    });

    // If not found, try exact match
    if (!challenge) {
      challenge = await Challenge.findOne({
        inviteCode: inviteCode,
        status: { $in: ['pending', 'active'] }
      });
    }

    // Debug: show all challenges with their invite codes
    if (!challenge) {
      const allChallenges = await Challenge.find({}).select('inviteCode status title');
      console.log('All challenges:', allChallenges);
      console.log('Looking for code:', inviteCode, 'uppercase:', inviteCode.toUpperCase());
    }

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi yoki taklif kodi noto\'g\'ri'
      });
    }

    // Check if invite code expired
    if (challenge.inviteCodeExpiry && new Date() > challenge.inviteCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Taklif kodi muddati tugagan'
      });
    }

    // Check if already participant
    const existingParticipant = await ChallengeParticipant.findOne({
      userId,
      challengeId: challenge._id
    });

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Siz allaqachon bu challengega qo\'shilgansiz'
      });
    }

    // Check max participants
    if (challenge.currentParticipants >= challenge.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Challenge to\'lgan, boshqa joy yo\'q'
      });
    }

    // Add participant
    const participant = new ChallengeParticipant({
      userId,
      challengeId: challenge._id,
      role: 'participant',
      status: 'active'
    });
    await participant.save();

    // Add to challenge participants array
    const User = require('../models/User');
    const user = await User.findById(userId);

    challenge.participants.push({
      userId,
      name: user?.firstName || 'User',
      role: 'member',
      status: 'active',
      joinedAt: new Date()
    });

    // Update participant count
    challenge.currentParticipants += 1;
    await challenge.save();

    // Add to chat group or create if doesn't exist
    const ChatGroup = require('../models/ChatGroup');

    if (challenge.chatGroup) {
      // Add to existing chat group
      try {
        const chatGroup = await ChatGroup.findById(challenge.chatGroup);
        if (chatGroup) {
          await chatGroup.addMember(
            userId.toString(),
            user?.firstName || 'User',
            'member'
          );
          console.log(`✅ User ${user?.firstName} added to chat group`);
        }
      } catch (error) {
        console.error('❌ Error adding user to chat group:', error);
      }
    } else {
      // Create new chat group if it doesn't exist
      try {
        const chatGroup = new ChatGroup({
          name: challenge.title,
          description: challenge.description || `${challenge.title} uchun guruh chat`,
          challengeId: challenge._id.toString(),
          createdBy: challenge.creatorId.toString(),
          members: challenge.participants.map(p => ({
            userId: p.userId.toString(),
            name: p.name || 'User',
            role: p.role === 'owner' ? 'owner' : 'member',
            joinedAt: p.joinedAt || new Date(),
            isOnline: false
          }))
        });

        await chatGroup.save();

        // Update challenge with chat group reference
        await Challenge.findByIdAndUpdate(challenge._id, {
          chatGroup: chatGroup._id
        });

        console.log(`✅ Chat group created for challenge: ${challenge.title}`);
      } catch (error) {
        console.error('❌ Error creating chat group:', error);
      }
    }

    // Create daily progress entries
    const progressEntries = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= challenge.duration; day++) {
      const date = new Date(challenge.startDate);
      date.setDate(date.getDate() + day - 1);

      // Determine initial status based on date
      let status = 'pending';
      if (date < today) {
        status = 'missed'; // Past days are missed for new joiners
      }

      progressEntries.push({
        userId,
        challengeId: challenge._id,
        participantId: participant._id,
        dayNumber: day,
        date,
        goalValue: challenge.dailyGoal.value,
        status
      });
    }
    await DailyProgress.insertMany(progressEntries);

    res.json({
      success: true,
      message: 'Challengega muvaffaqiyatli qo\'shildingiz',
      challenge: {
        ...challenge.toObject(),
        participantData: {
          role: 'participant',
          status: 'active',
          completedDays: 0,
          currentStreak: 0,
          maxStreak: 0,
          totalPoints: 0,
          completionRate: 0,
          badges: []
        }
      }
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengega qo\'shilishda xatolik'
    });
  }
};

// Get challenge details
exports.getChallengeDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const challenge = await Challenge.findById(id).populate('creatorId', 'name avatar');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    // Get participant data
    const participant = await ChallengeParticipant.findOne({
      userId,
      challengeId: id
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Siz bu challengening ishtirokchisi emassiz'
      });
    }

    // Get daily progress
    const progress = await DailyProgress.find({
      userId,
      challengeId: id
    }).sort({ dayNumber: 1 });

    // Get all participants for leaderboard
    const participants = await ChallengeParticipant.find({
      challengeId: id,
      status: { $in: ['active', 'completed'] }
    }).populate('userId', 'firstName lastName avatar').sort({ totalPoints: -1 });

    res.json({
      success: true,
      challenge: {
        ...challenge.toObject(),
        participantData: {
          role: participant.role,
          status: participant.status,
          completedDays: participant.completedDays,
          currentStreak: participant.currentStreak,
          maxStreak: participant.maxStreak,
          totalPoints: participant.totalPoints,
          completionRate: participant.completionRate,
          badges: participant.badges
        },
        progress,
        leaderboard: participants.map((p, index) => {
          let userName = 'Foydalanuvchi';
          if (p.userId) {
            const firstName = p.userId.firstName || '';
            const lastName = p.userId.lastName || '';
            userName = `${firstName} ${lastName}`.trim() || 'Foydalanuvchi';
          }
          return {
            rank: index + 1,
            user: p.userId ? {
              id: p.userId._id,
              name: userName,
              avatar: p.userId.avatar
            } : { id: null, name: 'Foydalanuvchi', avatar: null },
            completedDays: p.completedDays,
            currentStreak: p.currentStreak,
            totalPoints: p.totalPoints,
            completionRate: p.completionRate
          };
        })
      }
    });
  } catch (error) {
    console.error('Get challenge details error:', error);
    res.status(500).json({
      success: false,
      message: 'Challenge ma\'lumotlarini yuklashda xatolik'
    });
  }
};

// Update daily progress
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { dayNumber, status, progressValue, notes, proofUrl } = req.body;

    // Get challenge first
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    // Get participant
    const participant = await ChallengeParticipant.findOne({
      userId,
      challengeId: id
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Siz bu challengening ishtirokchisi emassiz'
      });
    }

    // Find the progress entry
    let progress = await DailyProgress.findOne({
      userId,
      challengeId: id,
      dayNumber
    });

    // If progress doesn't exist (for days beyond initial duration), create it automatically
    if (!progress) {
      const date = new Date(challenge.startDate);
      date.setDate(date.getDate() + dayNumber - 1);

      progress = new DailyProgress({
        userId,
        challengeId: id,
        participantId: participant._id,
        dayNumber,
        date,
        goalValue: challenge.dailyGoal.value,
        status: 'pending'
      });

      console.log(`✨ Auto-created progress for day ${dayNumber} (beyond initial duration of ${challenge.duration})`);
    }

    // Update progress
    const wasCompleted = progress.status === 'done';
    progress.status = status;
    progress.progressValue = progressValue || progress.progressValue;
    progress.notes = notes || progress.notes;
    progress.proofUrl = proofUrl || progress.proofUrl;

    let pointsEarned = 0;

    if (status === 'done' && !wasCompleted) {
      progress.completedAt = new Date();
      pointsEarned = 10; // Base points for completing a day
      progress.pointsEarned = pointsEarned;
    }

    await progress.save();

    // Update participant stats
    if (participant) {
      // Recalculate stats
      const allProgress = await DailyProgress.find({
        userId,
        challengeId: id
      });

      const completedDays = allProgress.filter(p => p.status === 'done').length;
      const missedDays = allProgress.filter(p => p.status === 'missed').length;
      const skippedDays = allProgress.filter(p => p.status === 'skipped').length;

      participant.completedDays = completedDays;
      participant.missedDays = missedDays;
      participant.skippedDays = skippedDays;

      // Calculate streak
      if (status === 'done') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (participant.lastCompletedDate) {
          const lastDate = new Date(participant.lastCompletedDate);
          lastDate.setHours(0, 0, 0, 0);

          if (lastDate.getTime() === yesterday.getTime()) {
            participant.currentStreak += 1;
          } else {
            participant.currentStreak = 1;
          }
        } else {
          participant.currentStreak = 1;
        }

        participant.lastCompletedDate = new Date();

        // Update max streak
        if (participant.currentStreak > participant.maxStreak) {
          participant.maxStreak = participant.currentStreak;
        }

        // Streak bonuses
        if (participant.currentStreak === 7) {
          pointsEarned += 50;
        }

        // Add points
        participant.totalPoints += pointsEarned;

        // Check for badges
        if (completedDays >= 10 && !participant.badges.find(b => b.type === 'bronze')) {
          participant.badges.push({ type: 'bronze' });
        }
        if (completedDays >= 20 && !participant.badges.find(b => b.type === 'silver')) {
          participant.badges.push({ type: 'silver' });
        }
        if (completedDays >= 30 && !participant.badges.find(b => b.type === 'gold')) {
          participant.badges.push({ type: 'gold' });
        }
      }

      await participant.save();
    }

    res.json({
      success: true,
      message: status === 'done' ? 'Bajarildi! 🎉' : 'Progress yangilandi',
      progress,
      pointsEarned,
      participantData: participant ? {
        completedDays: participant.completedDays,
        currentStreak: participant.currentStreak,
        maxStreak: participant.maxStreak,
        totalPoints: participant.totalPoints,
        badges: participant.badges
      } : null
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Progressni yangilashda xatolik'
    });
  }
};

// Generate new invite code
exports.generateInviteCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    // Check if user is owner
    if (challenge.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Faqat challenge egasi taklif kodi yaratishi mumkin'
      });
    }

    // Generate new code
    challenge.inviteCode = generateInviteCode();
    challenge.inviteCodeExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await challenge.save();

    res.json({
      success: true,
      inviteCode: challenge.inviteCode,
      expiresAt: challenge.inviteCodeExpiry
    });
  } catch (error) {
    console.error('Generate invite code error:', error);
    res.status(500).json({
      success: false,
      message: 'Taklif kodi yaratishda xatolik'
    });
  }
};

// Leave challenge
exports.leaveChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const participant = await ChallengeParticipant.findOne({
      userId,
      challengeId: id
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Siz bu challengening ishtirokchisi emassiz'
      });
    }

    if (participant.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Challenge egasi tark eta olmaydi. Challengeni bekor qiling.'
      });
    }

    participant.status = 'left';
    await participant.save();

    // Remove from challenge participants array
    await Challenge.findByIdAndUpdate(id, {
      $pull: { participants: { userId } },
      $inc: { currentParticipants: -1 }
    });

    // Remove from chat group if exists
    const challenge = await Challenge.findById(id);
    if (challenge && challenge.chatGroup) {
      const ChatGroup = require('../models/ChatGroup');
      await ChatGroup.removeMember(challenge.chatGroup, userId);
    }

    res.json({
      success: true,
      message: 'Challengeni tark etdingiz'
    });
  } catch (error) {
    console.error('Leave challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengeni tark etishda xatolik'
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const participants = await ChallengeParticipant.find({
      challengeId: id,
      status: { $in: ['active', 'completed'] }
    }).populate('userId', 'firstName lastName avatar').sort({ totalPoints: -1, completedDays: -1 });

    const leaderboard = participants.map((p, index) => {
      let userName = 'Foydalanuvchi';
      if (p.userId) {
        const firstName = p.userId.firstName || '';
        const lastName = p.userId.lastName || '';
        userName = `${firstName} ${lastName}`.trim() || 'Foydalanuvchi';
      }
      return {
        rank: index + 1,
        user: p.userId ? {
          id: p.userId._id,
          name: userName,
          avatar: p.userId.avatar
        } : { id: null, name: 'Foydalanuvchi', avatar: null },
        completedDays: p.completedDays,
        currentStreak: p.currentStreak,
        maxStreak: p.maxStreak,
        totalPoints: p.totalPoints,
        completionRate: p.completionRate,
        badges: p.badges
      };
    });

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Leaderboardni yuklashda xatolik'
    });
  }
};

// Update challenge
exports.updateChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, description, category, dailyGoal, maxParticipants, duration } = req.body;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    if (challenge.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Faqat challenge egasi tahrirlashi mumkin'
      });
    }

    // Update fields
    if (title) challenge.title = title;
    if (description !== undefined) challenge.description = description;
    if (category) challenge.category = category;
    if (dailyGoal) challenge.dailyGoal = dailyGoal;
    if (maxParticipants && maxParticipants >= challenge.currentParticipants) {
      challenge.maxParticipants = maxParticipants;
    }

    // Update duration and recalculate endDate
    if (duration && duration >= 1 && duration <= 1000) {
      challenge.duration = duration;
      const endDate = new Date(challenge.startDate);
      endDate.setDate(endDate.getDate() + duration);
      challenge.endDate = endDate;
    }

    await challenge.save();

    res.json({
      success: true,
      message: 'Challenge yangilandi',
      challenge
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengeni yangilashda xatolik'
    });
  }
};

// Delete/Cancel challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    console.log('Delete check - creatorId:', challenge.creatorId.toString(), 'userId:', userId.toString());

    if (challenge.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Faqat challenge egasi o\'chirishi mumkin'
      });
    }

    // Delete all related data
    await DailyProgress.deleteMany({ challengeId: id });
    await ChallengeParticipant.deleteMany({ challengeId: id });
    await Challenge.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Challenge o\'chirildi'
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengeni o\'chirishda xatolik'
    });
  }
};

// Complete challenge
exports.completeChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body; // Optional completion reason

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    // Get participant
    const participant = await ChallengeParticipant.findOne({
      userId,
      challengeId: id
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Siz bu challengening ishtirokchisi emassiz'
      });
    }

    // Update participant status to completed
    participant.status = 'completed';
    if (reason) {
      participant.completionReason = reason;
    }
    participant.completedAt = new Date();
    await participant.save();

    // Check if all participants completed
    const allParticipants = await ChallengeParticipant.find({
      challengeId: id
    });

    const allCompleted = allParticipants.every(p => p.status === 'completed' || p.status === 'left');

    // If all completed, mark challenge as completed
    if (allCompleted) {
      challenge.status = 'completed';
      await challenge.save();
    }

    res.json({
      success: true,
      message: 'Challenge tugatildi! 🎉',
      participant,
      challengeCompleted: allCompleted
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengeni tugatishda xatolik'
    });
  }
};
