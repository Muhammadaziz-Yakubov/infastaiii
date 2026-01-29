const AIService = require('../services/aiService');

class AIController {
    static async getFamilyAnalysis(req, res) {
        try {
            const { familyId } = req.params;
            const analysis = await AIService.getFamilyAnalysis(familyId);
            
            res.json({
                success: true,
                data: analysis,
                message: 'Family analysis generated successfully'
            });
        } catch (error) {
            console.error('Get family analysis error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to generate family analysis' 
            });
        }
    }

    static async getFinanceSummary(req, res) {
        try {
            const { familyId } = req.params;
            const summary = await AIService.getFinanceSummary(familyId);
            
            res.json({
                success: true,
                data: summary,
                message: 'Finance summary generated successfully'
            });
        } catch (error) {
            console.error('Get finance summary error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to generate finance summary' 
            });
        }
    }

    static async getTaskRecommendations(req, res) {
        try {
            const { familyId } = req.params;
            const Task = require('../models/Task');
            const Family = require('../models/Family');

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            const tasks = await Task.find({ familyId });
            const recommendations = [];

            const overdueTasks = tasks.filter(t => 
                t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed'
            );

            if (overdueTasks.length > 0) {
                recommendations.push({
                    type: 'urgent',
                    title: 'Overdue Tasks',
                    description: `You have ${overdueTasks.length} overdue tasks that need immediate attention.`,
                    count: overdueTasks.length,
                    action: 'Review and complete overdue tasks'
                });
            }

            const highPriorityTasks = tasks.filter(t => 
                t.priority === 'high' && t.status === 'pending'
            );

            if (highPriorityTasks.length > 3) {
                recommendations.push({
                    type: 'priority',
                    title: 'Too Many High Priority Tasks',
                    description: `You have ${highPriorityTasks.length} high priority tasks. Consider prioritizing the most important ones.`,
                    count: highPriorityTasks.length,
                    action: 'Re-evaluate task priorities'
                });
            }

            const completionRate = tasks.length > 0 ? 
                (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0;

            if (completionRate < 30) {
                recommendations.push({
                    type: 'performance',
                    title: 'Low Completion Rate',
                    description: `Task completion rate is ${completionRate.toFixed(1)}%. Consider setting more realistic deadlines.`,
                    rate: completionRate,
                    action: 'Adjust task deadlines and priorities'
                });
            }

            res.json({
                success: true,
                data: {
                    recommendations,
                    stats: {
                        totalTasks: tasks.length,
                        completedTasks: tasks.filter(t => t.status === 'completed').length,
                        overdueTasks: overdueTasks.length,
                        completionRate: completionRate.toFixed(1)
                    }
                }
            });
        } catch (error) {
            console.error('Get task recommendations error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to generate task recommendations' 
            });
        }
    }

    static async getGoalRecommendations(req, res) {
        try {
            const { familyId } = req.params;
            const Goal = require('../models/Goal');
            const Family = require('../models/Family');

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            const goals = await Goal.find({ familyId });
            const recommendations = [];

            const stalledGoals = goals.filter(g => {
                const daysSinceCreation = (new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
                return g.currentAmount === 0 && daysSinceCreation > 7;
            });

            if (stalledGoals.length > 0) {
                recommendations.push({
                    type: 'stalled',
                    title: 'Stalled Goals',
                    description: `You have ${stalledGoals.length} goals with no progress for over a week.`,
                    count: stalledGoals.length,
                    action: 'Start working on these goals or consider adjusting them'
                });
            }

            const nearCompletionGoals = goals.filter(g => 
                g.currentAmount > g.targetAmount * 0.8 && g.currentAmount < g.targetAmount
            );

            if (nearCompletionGoals.length > 0) {
                recommendations.push({
                    type: 'motivation',
                    title: 'Almost There!',
                    description: `You're close to completing ${nearCompletionGoals.length} goals. Keep going!`,
                    count: nearCompletionGoals.length,
                    action: 'Make a final push to complete these goals'
                });
            }

            const overdueGoals = goals.filter(g => 
                g.deadline && new Date(g.deadline) < new Date() && g.currentAmount < g.targetAmount
            );

            if (overdueGoals.length > 0) {
                recommendations.push({
                    type: 'deadline',
                    title: 'Overdue Goals',
                    description: `${overdueGoals.length} goals have passed their deadlines.`,
                    count: overdueGoals.length,
                    action: 'Review deadlines and adjust goals if needed'
                });
            }

            res.json({
                success: true,
                data: {
                    recommendations,
                    stats: {
                        totalGoals: goals.length,
                        completedGoals: goals.filter(g => g.currentAmount >= g.targetAmount).length,
                        inProgressGoals: goals.filter(g => g.currentAmount > 0 && g.currentAmount < g.targetAmount).length,
                        overdueGoals: overdueGoals.length
                    }
                }
            });
        } catch (error) {
            console.error('Get goal recommendations error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to generate goal recommendations' 
            });
        }
    }

    static async getFamilyInsights(req, res) {
        try {
            const { familyId } = req.params;
            const Family = require('../models/Family');
            const Task = require('../models/Task');
            const Finance = require('../models/Finance');

            const family = await Family.findById(familyId).populate('members.userId', 'firstName lastName');
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            const tasks = await Task.find({ familyId });
            const finances = await Finance.find({ familyId });

            const insights = [];

            const memberActivity = family.members.map(member => {
                const memberTasks = tasks.filter(t => t.assignedTo && t.assignedTo.toString() === member.userId.toString());
                const completedTasks = memberTasks.filter(t => t.status === 'completed');
                
                return {
                    memberId: member.userId._id,
                    name: member.nickname || member.userId.firstName,
                    totalTasks: memberTasks.length,
                    completedTasks: completedTasks.length,
                    completionRate: memberTasks.length > 0 ? 
                        (completedTasks.length / memberTasks.length * 100).toFixed(1) : 0
                };
            }).sort((a, b) => b.completionRate - a.completionRate);

            if (memberActivity.length > 0) {
                insights.push({
                    type: 'performance',
                    title: 'Top Performer',
                    description: `${memberActivity[0].name} has the highest task completion rate at ${memberActivity[0].completionRate}%`,
                    data: memberActivity[0]
                });
            }

            const weeklyTaskTrend = this.calculateWeeklyTaskTrend(tasks);
            if (weeklyTaskTrend.trend === 'increasing') {
                insights.push({
                    type: 'productivity',
                    title: 'Productivity Increasing',
                    description: 'Task completion has been increasing over the past few weeks',
                    data: weeklyTaskTrend
                });
            }

            const spendingPattern = this.analyzeSpendingPattern(finances);
            if (spendingPattern.unusualSpending) {
                insights.push({
                    type: 'financial',
                    title: 'Unusual Spending Pattern',
                    description: 'Spending has increased significantly compared to previous periods',
                    data: spendingPattern
                });
            }

            res.json({
                success: true,
                data: {
                    insights,
                    memberActivity,
                    weeklyTrend: weeklyTaskTrend,
                    spendingPattern
                }
            });
        } catch (error) {
            console.error('Get family insights error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to generate family insights' 
            });
        }
    }

    static calculateWeeklyTaskTrend(tasks) {
        const now = new Date();
        const weeks = [];
        
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekTasks = tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate >= weekStart && taskDate <= weekEnd;
            });

            weeks.push({
                week: `Week ${4 - i}`,
                completed: weekTasks.filter(t => t.status === 'completed').length,
                total: weekTasks.length
            });
        }

        const trend = weeks[3].completed > weeks[0].completed ? 'increasing' : 
                    weeks[3].completed < weeks[0].completed ? 'decreasing' : 'stable';

        return { weeks, trend };
    }

    static analyzeSpendingPattern(finances) {
        const recentFinances = finances.filter(f => 
            new Date(f.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        const previousFinances = finances.filter(f => {
            const financeDate = new Date(f.date);
            const thirtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            return financeDate >= sixtyDaysAgo && financeDate < thirtyDaysAgo;
        });

        const recentExpenses = recentFinances.filter(f => f.type === 'expense')
            .reduce((sum, f) => sum + f.amount, 0);
        const previousExpenses = previousFinances.filter(f => f.type === 'expense')
            .reduce((sum, f) => sum + f.amount, 0);

        const unusualSpending = recentExpenses > previousExpenses * 1.5;

        return {
            recentExpenses,
            previousExpenses,
            unusualSpending,
            percentageChange: previousExpenses > 0 ? 
                ((recentExpenses - previousExpenses) / previousExpenses * 100).toFixed(1) : 0
        };
    }
}

module.exports = AIController;
