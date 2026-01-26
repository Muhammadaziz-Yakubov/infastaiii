const Family = require('../models/Family');
const User = require('../models/User');
const Task = require('../models/Task');
const Finance = require('../models/Finance');
const crypto = require('crypto');

// Utility to fix avatar paths
const fixAvatarPath = (user) => {
    if (!user.avatar) return null;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `/uploads/avatars/${user.avatar.split('/').pop()}`;
};

// Create a new family
exports.createFamily = async (req, res) => {
    try {
        const { name, role } = req.body;
        const userId = req.user.id;

        const existingFamily = await Family.findOne({ owner: userId });
        if (existingFamily) {
            return res.status(400).json({ message: 'Sizda allaqachon oila mavjud.' });
        }

        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const family = new Family({
            name,
            owner: userId,
            members: [{ user: userId, role: role || 'admin' }],
            inviteCode
        });

        await family.save();

        await User.findByIdAndUpdate(userId, {
            familyId: family._id,
            familyRole: role || 'admin'
        });

        res.status(201).json(family);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Join a family via invite code
exports.joinFamily = async (req, res) => {
    try {
        const { inviteCode, role } = req.body;
        const userId = req.user.id;

        const family = await Family.findOne({ inviteCode });
        if (!family) {
            return res.status(404).json({ message: 'Noto\'g\'ri taklif kodi.' });
        }

        const isMember = family.members.some(m => m.user.toString() === userId);
        if (isMember) {
            return res.status(400).json({ message: 'Siz allaqachon bu oila a\'zosisiz.' });
        }

        family.members.push({ user: userId, role: role || 'member' });
        await family.save();

        await User.findByIdAndUpdate(userId, {
            familyId: family._id,
            familyRole: role || 'member'
        });

        res.json(family);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get family details
exports.getFamily = async (req, res) => {
    try {
        const familyId = req.user.familyId;
        if (!familyId) {
            return res.status(404).json({ message: 'Siz hech qanday oilaga a\'zo emassiz.' });
        }

        const family = await Family.findById(familyId).populate('members.user', 'firstName lastName avatar email phone');

        // Fix avatars in member objects
        const familyData = family.toObject();
        familyData.members.forEach(member => {
            if (member.user) {
                member.user.avatar = fixAvatarPath(member.user);
            }
        });

        res.json(familyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get family dashboard stats
exports.getFamilyDashboard = async (req, res) => {
    try {
        const familyId = req.user.familyId;
        if (!familyId) return res.status(200).json({ family: null });

        const family = await Family.findById(familyId).populate('members.user', 'firstName lastName avatar email');

        const familyData = family.toObject();
        familyData.members.forEach(member => {
            if (member.user) {
                member.user.avatar = fixAvatarPath(member.user);
            }
        });

        const tasks = await Task.find({ familyId });
        const completedTasks = tasks.filter(t => t.status === 'completed').length;

        const finances = await Finance.find({ familyId });
        const income = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const expense = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

        // Update family balance if needed (or just use stats)
        const balance = income - expense;

        res.json({
            family: familyData,
            stats: {
                totalTasks: tasks.length,
                completedTasks,
                income,
                expense,
                balance
            },
            recentTransactions: finances.slice(-5).reverse()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Family Goals Management
exports.addGoal = async (req, res) => {
    try {
        const { title, targetAmount, deadline, color, icon } = req.body;
        const familyId = req.user.familyId;

        const family = await Family.findById(familyId);
        family.goals.push({ title, targetAmount, deadline, color, icon, currentAmount: 0 });
        await family.save();

        res.status(201).json(family.goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateGoalProgress = async (req, res) => {
    try {
        const { goalId, amount } = req.body;
        const familyId = req.user.familyId;

        const family = await Family.findById(familyId);
        const goal = family.goals.id(goalId);
        if (!goal) return res.status(404).json({ message: 'Maqsad topilmadi' });

        goal.currentAmount += amount;
        await family.save();

        res.json(family.goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign Task
exports.assignTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, deadline } = req.body;
        const familyId = req.user.familyId;

        const task = new Task({
            userId: req.user.id,
            familyId,
            assignedTo,
            title,
            description,
            priority: priority || 'medium',
            deadline,
            status: 'pending'
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
