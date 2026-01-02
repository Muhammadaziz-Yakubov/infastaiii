const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/ai-suggestions - Get AI suggestions
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.userId;
        
        // Ma'lumotlarni yuklash
        const [goals, tasks, user] = await Promise.all([
            Goal.find({ userId }),
            Task.find({ userId }),
            User.findById(userId)
        ]);

        // AI maslahatlarini generatsiya qilish
        const suggestions = generateAiSuggestions(goals, tasks, user);
        
        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('AI suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// AI maslahatlarini generatsiya qilish funksiyasi
function generateAiSuggestions(goals, tasks, user) {
    const suggestions = [];
    
    // 1. Goals uchun maslahatlar
    if (goals && goals.length > 0) {
        goals.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            // Progress maslahatlari
            const milestones = [25, 50, 75, 90];
            const reachedMilestone = milestones.find(m => progress >= m && progress < m + 5);
            
            if (reachedMilestone) {
                suggestions.push({
                    id: `goal-${goal._id}-milestone`,
                    type: 'milestone',
                    title: `Tabriklaymiz! ${goal.name} ${reachedMilestone}% ga yetdi! 🎉`,
                    description: `Maqsadingizning ${reachedMilestone}% bajarildi. Davom eting!`,
                    goalId: goal._id,
                    priority: 'high'
                });
            }
            
            // Deadline maslahatlari
            if (daysRemaining > 0 && daysRemaining <= 30) {
                const monthlyNeeded = (goal.targetAmount - goal.currentAmount) / daysRemaining * 30;
                suggestions.push({
                    id: `goal-${goal._id}-deadline`,
                    type: 'funding',
                    title: `${daysRemaining} kun qoldi! ⏳`,
                    description: `Har oy ${formatCurrency(monthlyNeeded)} ajratsangiz, maqsadga yetasiz.`,
                    goalId: goal._id,
                    priority: daysRemaining <= 7 ? 'high' : 'medium'
                });
            }
            
            // No activity maslahati
            const lastActivityDays = Math.floor((new Date() - new Date(goal.updatedAt)) / (1000 * 60 * 60 * 24));
            if (lastActivityDays >= 3 && goal.status === 'active') {
                suggestions.push({
                    id: `goal-${goal._id}-inactive`,
                    type: 'reminder',
                    title: `${lastActivityDays} kun harakat yo'q ⚠️`,
                    description: `"${goal.name}" maqsadi uchun oxirgi harakat ${lastActivityDays} kun oldin. Bugun kichik summa ajrating.`,
                    goalId: goal._id,
                    priority: 'high'
                });
            }
            
            // Auto-save maslahati
            if (!goal.autoSave?.enabled && goal.status === 'active') {
                suggestions.push({
                    id: `goal-${goal._id}-autosave`,
                    type: 'funding',
                    title: 'Avtomatik tejashni yoqing 💰',
                    description: `Har oy ${formatCurrency(goal.targetAmount / 12)} ajratsangiz, 12 oyda maqsadga erishasiz.`,
                    goalId: goal._id,
                    priority: 'medium'
                });
            }
        });
    }
    
    // 2. Tasks uchun maslahatlar
    if (tasks && tasks.length > 0) {
        const pendingTasks = tasks.filter(t => t.status === 'pending');

        if (pendingTasks.length > 5) {
            suggestions.push({
                id: 'tasks-overwhelming',
                type: 'reminder',
                title: `${pendingTasks.length} ta kutilayotgan vazifa 📋`,
                description: 'Juda ko\'p kutilayotgan vazifalar bor. Prioritizatsiya qiling yoki ba\'zilarini bajarib arxivga o\'tkazing.',
                priority: 'medium'
            });
        }

        // Deadline yaqin bo'lgan vazifalar uchun maslahat
        const urgentTasks = tasks.filter(t => {
            if (!t.deadline) return false;
            const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            return daysLeft > 0 && daysLeft <= 3;
        });

        if (urgentTasks.length > 0) {
            suggestions.push({
                id: 'tasks-urgent',
                type: 'reminder',
                title: `${urgentTasks.length} ta shoshilinch vazifa ⏰`,
                description: 'Muddatlari yaqinlashib qolgan vazifalar bor. Ularni birinchi navbatda bajarishni tavsiya qilamiz.',
                priority: 'high'
            });
        }
    }
    
    // 3. General maslahatlar
    if (goals.length === 0) {
        suggestions.push({
            id: 'no-goals',
            type: 'funding',
            title: 'Maqsad yaratishingiz kerak 🎯',
            description: 'Birinchi maqsadingizni yarating va rejangizni boshlang!',
            priority: 'medium'
        });
    }
    
    // Sort by priority (high first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    suggestions.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    
    // Limit to 5 suggestions
    return suggestions.slice(0, 5);
}

// Format currency
function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return '0';
    return Math.round(amount).toLocaleString('uz-UZ') + ' so\'m';
}

module.exports = router;