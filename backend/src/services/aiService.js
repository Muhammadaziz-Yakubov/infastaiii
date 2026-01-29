const Family = require('../models/Family');
const Task = require('../models/Task');
const Finance = require('../models/Finance');
const Goal = require('../models/Goal');
const Challenge = require('../models/Challenge');

class AIService {
    static async getFamilyAnalysis(familyId) {
        try {
            const family = await Family.findById(familyId)
                .populate('members.userId', 'firstName lastName')
                .populate('ownerId', 'firstName lastName');

            if (!family) {
                throw new Error('Family not found');
            }

            const tasks = await Task.find({ familyId });
            const finances = await Finance.find({ familyId });
            const goals = await Goal.find({ familyId });
            const challenges = await Challenge.find({ familyId });

            const analysis = {
                familyOverview: {
                    name: family.name,
                    memberCount: family.getMemberCount(),
                    subscriptionPlan: family.subscriptionPlan,
                    createdAt: family.createdAt,
                    isActive: family.isActive
                },
                taskAnalysis: {
                    totalTasks: tasks.length,
                    completedTasks: tasks.filter(t => t.status === 'completed').length,
                    pendingTasks: tasks.filter(t => t.status === 'pending').length,
                    failedTasks: tasks.filter(t => t.status === 'failed').length,
                    completionRate: tasks.length > 0 ? 
                        (tasks.filter(t => t.status === 'completed').length / tasks.length * 100).toFixed(2) : 0,
                    averageCompletionTime: this.calculateAverageCompletionTime(tasks)
                },
                financialAnalysis: {
                    totalIncome: finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0),
                    totalExpenses: finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
                    balance: 0,
                    topSpendingCategories: this.getTopSpendingCategories(finances),
                    monthlyTrend: this.calculateMonthlyTrend(finances),
                    savingsRate: 0
                },
                goalAnalysis: {
                    totalGoals: goals.length,
                    completedGoals: goals.filter(g => g.currentAmount >= g.targetAmount).length,
                    inProgressGoals: goals.filter(g => g.currentAmount < g.targetAmount && g.currentAmount > 0).length,
                    notStartedGoals: goals.filter(g => g.currentAmount === 0).length,
                    averageProgress: goals.length > 0 ? 
                        (goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length).toFixed(2) : 0
                },
                challengeAnalysis: {
                    totalChallenges: challenges.length,
                    activeChallenges: challenges.filter(c => c.isActive).length,
                    completedChallenges: challenges.filter(c => c.status === 'completed').length,
                    participationRate: this.calculateChallengeParticipation(challenges, family.getMemberCount())
                },
                recommendations: this.generateRecommendations(family, tasks, finances, goals, challenges),
                insights: this.generateInsights(family, tasks, finances, goals)
            };

            analysis.financialAnalysis.balance = 
                analysis.financialAnalysis.totalIncome - analysis.financialAnalysis.totalExpenses;
            
            analysis.financialAnalysis.savingsRate = analysis.financialAnalysis.totalIncome > 0 ? 
                ((analysis.financialAnalysis.totalIncome - analysis.financialAnalysis.totalExpenses) / 
                 analysis.financialAnalysis.totalIncome * 100).toFixed(2) : 0;

            return analysis;
        } catch (error) {
            console.error('AI Family Analysis error:', error);
            throw new Error('Failed to generate family analysis');
        }
    }

    static async getFinanceSummary(familyId) {
        try {
            const family = await Family.findById(familyId);
            if (!family) {
                throw new Error('Family not found');
            }

            const finances = await Finance.find({ familyId }).sort({ date: -1 });
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const monthlyFinances = finances.filter(f => {
                const financeDate = new Date(f.date);
                return financeDate.getMonth() === currentMonth && financeDate.getFullYear() === currentYear;
            });

            const summary = {
                currentMonth: {
                    income: monthlyFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0),
                    expenses: monthlyFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
                    balance: 0,
                    transactionCount: monthlyFinances.length
                },
                overall: {
                    totalIncome: finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0),
                    totalExpenses: finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
                    balance: 0,
                    transactionCount: finances.length
                },
                spendingPatterns: {
                    topCategories: this.getTopSpendingCategories(finances),
                    dailyAverage: this.calculateDailyAverageSpending(monthlyFinances),
                    highestExpense: this.getHighestExpense(monthlyFinances),
                    lowestIncome: this.getLowestIncome(monthlyFinances)
                },
                predictions: {
                    nextMonthExpenses: this.predictNextMonthExpenses(finances),
                    savingsPotential: this.calculateSavingsPotential(finances),
                    riskFactors: this.identifyFinancialRisks(finances)
                },
                recommendations: this.generateFinancialRecommendations(finances, family.subscriptionPlan)
            };

            summary.currentMonth.balance = summary.currentMonth.income - summary.currentMonth.expenses;
            summary.overall.balance = summary.overall.totalIncome - summary.overall.totalExpenses;

            return summary;
        } catch (error) {
            console.error('AI Finance Summary error:', error);
            throw new Error('Failed to generate finance summary');
        }
    }

    static calculateAverageCompletionTime(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
        if (completedTasks.length === 0) return '0 days';

        const totalDays = completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.completedAt);
            return sum + Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        }, 0);

        return `${Math.round(totalDays / completedTasks.length)} days`;
    }

    static getTopSpendingCategories(finances) {
        const expenses = finances.filter(f => f.type === 'expense');
        const categories = {};

        expenses.forEach(expense => {
            const category = expense.category || 'Other';
            categories[category] = (categories[category] || 0) + expense.amount;
        });

        return Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, amount]) => ({ category, amount }));
    }

    static calculateMonthlyTrend(finances) {
        const last6Months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthFinances = finances.filter(f => {
                const financeDate = new Date(f.date);
                return financeDate.getMonth() === monthDate.getMonth() && 
                       financeDate.getFullYear() === monthDate.getFullYear();
            });

            last6Months.push({
                month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                income: monthFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0),
                expenses: monthFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0)
            });
        }

        return last6Months;
    }

    static calculateChallengeParticipation(challenges, memberCount) {
        if (challenges.length === 0 || memberCount === 0) return 0;

        const totalParticipants = challenges.reduce((sum, challenge) => {
            return sum + (challenge.participants ? challenge.participants.length : 0);
        }, 0);

        return Math.round((totalParticipants / (challenges.length * memberCount)) * 100);
    }

    static generateRecommendations(family, tasks, finances, goals, challenges) {
        const recommendations = [];

        if (tasks.length > 0) {
            const completionRate = (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100;
            if (completionRate < 50) {
                recommendations.push({
                    type: 'tasks',
                    priority: 'high',
                    title: 'Improve Task Completion',
                    description: 'Consider setting more realistic deadlines and breaking down large tasks into smaller ones.',
                    action: 'Review task assignments and deadlines'
                });
            }
        }

        const income = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const expenses = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
        
        if (expenses > income) {
            recommendations.push({
                type: 'finance',
                priority: 'high',
                title: 'Budget Deficit Alert',
                description: 'Your expenses exceed your income. Review spending patterns and identify areas to cut back.',
                action: 'Create a budget plan and track expenses'
            });
        }

        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
        if (activeGoals.length > 3) {
            recommendations.push({
                type: 'goals',
                priority: 'medium',
                title: 'Too Many Active Goals',
                description: 'Focus on completing a few goals before starting new ones for better success rate.',
                action: 'Prioritize top 3 goals and pause others'
            });
        }

        if (family.getMemberCount() < 3 && family.subscriptionPlan === 'PREMIUM') {
            recommendations.push({
                type: 'family',
                priority: 'low',
                title: 'Grow Your Family',
                description: 'Invite more family members to make the most of your PREMIUM plan features.',
                action: 'Send family invitations'
            });
        }

        return recommendations;
    }

    static generateInsights(family, tasks, finances, goals) {
        const insights = [];

        const taskPerformer = this.findTopTaskPerformer(tasks, family.members);
        if (taskPerformer) {
            insights.push({
                type: 'performance',
                title: 'Top Performer',
                description: `${taskPerformer.name} has completed the most tasks this month`,
                data: taskPerformer
            });
        }

        const biggestExpenseCategory = this.getTopSpendingCategories(finances)[0];
        if (biggestExpenseCategory) {
            insights.push({
                type: 'spending',
                title: 'Highest Spending Category',
                description: `${biggestExpenseCategory.category} accounts for most of your expenses`,
                data: biggestExpenseCategory
            });
        }

        const goalProgress = goals.filter(g => g.currentAmount > 0 && g.currentAmount < g.targetAmount);
        if (goalProgress.length > 0) {
            insights.push({
                type: 'goals',
                title: 'Goal Progress',
                description: `You're actively working on ${goalProgress.length} goals`,
                data: { activeGoals: goalProgress.length }
            });
        }

        return insights;
    }

    static findTopTaskPerformer(tasks, members) {
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const performerCounts = {};

        completedTasks.forEach(task => {
            if (task.assignedTo) {
                performerCounts[task.assignedTo] = (performerCounts[task.assignedTo] || 0) + 1;
            }
        });

        const topPerformerId = Object.entries(performerCounts)
            .sort(([,a], [,b]) => b - a)[0];

        if (!topPerformerId) return null;

        const member = members.find(m => m.userId.toString() === topPerformerId[0]);
        if (!member) return null;

        return {
            name: member.nickname || member.userId.firstName,
            completedTasks: topPerformerId[1]
        };
    }

    static calculateDailyAverageSpending(finances) {
        const expenses = finances.filter(f => f.type === 'expense');
        if (expenses.length === 0) return 0;

        const totalExpenses = expenses.reduce((sum, f) => sum + f.amount, 0);
        const daysInMonth = new Date().getDate();
        
        return Math.round(totalExpenses / daysInMonth);
    }

    static getHighestExpense(finances) {
        const expenses = finances.filter(f => f.type === 'expense');
        if (expenses.length === 0) return null;

        return expenses.reduce((max, expense) => 
            expense.amount > max.amount ? expense : max
        );
    }

    static getLowestIncome(finances) {
        const incomes = finances.filter(f => f.type === 'income');
        if (incomes.length === 0) return null;

        return incomes.reduce((min, income) => 
            income.amount < min.amount ? income : min
        );
    }

    static predictNextMonthExpenses(finances) {
        const last3Months = finances.filter(f => {
            const financeDate = new Date(f.date);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return financeDate >= threeMonthsAgo && f.type === 'expense';
        });

        if (last3Months.length === 0) return 0;

        const average = last3Months.reduce((sum, f) => sum + f.amount, 0) / last3Months.length;
        return Math.round(average);
    }

    static calculateSavingsPotential(finances) {
        const expenses = finances.filter(f => f.type === 'expense');
        const discretionaryExpenses = expenses.filter(f => 
            ['entertainment', 'dining', 'shopping'].includes(f.category?.toLowerCase())
        );

        if (discretionaryExpenses.length === 0) return 0;

        return Math.round(discretionaryExpenses.reduce((sum, f) => sum + f.amount, 0) * 0.3);
    }

    static identifyFinancialRisks(finances) {
        const risks = [];

        const recentExpenses = finances.filter(f => 
            f.type === 'expense' && 
            new Date(f.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        if (recentExpenses.length > 50) {
            risks.push({
                type: 'high_frequency',
                description: 'High number of transactions may indicate impulse spending'
            });
        }

        const largeExpenses = recentExpenses.filter(f => f.amount > 100000);
        if (largeExpenses.length > 5) {
            risks.push({
                type: 'large_expenses',
                description: 'Multiple large expenses detected in recent period'
            });
        }

        return risks;
    }

    static generateFinancialRecommendations(finances, subscriptionPlan) {
        const recommendations = [];

        const income = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const expenses = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

        if (expenses > income * 0.9) {
            recommendations.push({
                type: 'budget',
                title: 'Create Emergency Fund',
                description: 'Your expenses are close to your income. Consider building an emergency fund.',
                priority: 'high'
            });
        }

        if (subscriptionPlan === 'FREE') {
            recommendations.push({
                type: 'upgrade',
                title: 'Upgrade to PREMIUM',
                description: 'Get AI-powered insights and advanced financial analysis tools.',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}

module.exports = AIService;
