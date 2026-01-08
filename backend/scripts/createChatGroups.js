// Script to create chat groups for existing challenges
const mongoose = require('mongoose');
const Challenge = require('../src/models/Challenge');
const ChatGroup = require('../src/models/ChatGroup');
const User = require('../src/models/User');
require('dotenv').config();

const createChatGroupsForExistingChallenges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all challenges without chat groups
    const challengesWithoutGroups = await Challenge.find({
      chatGroup: { $exists: false },
      status: 'active'
    }).populate('participants.userId', 'firstName lastName');

    console.log(`📋 Found ${challengesWithoutGroups.length} challenges without chat groups`);

    for (const challenge of challengesWithoutGroups) {
      try {
        // Create chat group for the challenge
        const chatGroup = new ChatGroup({
          name: challenge.title,
          description: challenge.description,
          challengeId: challenge._id,
          createdBy: challenge.creatorId,
          members: []
        });

        // Add all participants to chat group
        if (challenge.participants && challenge.participants.length > 0) {
          for (const participant of challenge.participants) {
            const userName = participant.userId?.firstName || participant.name || 'User';
            chatGroup.members.push({
              userId: participant.userId._id || participant.userId,
              name: userName,
              role: participant.role || 'member',
              joinedAt: participant.joinedAt || new Date(),
              isOnline: false
            });
          }
        }

        await chatGroup.save();

        // Update challenge with chat group reference
        challenge.chatGroup = chatGroup._id;
        await challenge.save();

        console.log(`✅ Created chat group for challenge: ${challenge.title}`);
      } catch (error) {
        console.error(`❌ Error creating chat group for challenge ${challenge.title}:`, error);
      }
    }

    console.log('🎉 Chat group creation completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
};

createChatGroupsForExistingChallenges();
