const Family = require('../models/Family');
const User = require('../models/User');

class MonetizationMiddleware {
    static async validateFamilyCreation(req, res, next) {
        try {
            const userId = req.user.id;
            const { subscriptionPlan = 'FREE' } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const existingFamily = await Family.findOne({ 
                ownerId: userId, 
                isArchived: false 
            });

            if (subscriptionPlan === 'FREE' && existingFamily) {
                return res.status(403).json({ 
                    error: 'FREE plan allows only 1 family per user',
                    code: 'FREE_PLAN_LIMIT'
                });
            }

            next();
        } catch (error) {
            console.error('Monetization validation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async validateMemberInvitation(req, res, next) {
        try {
            const { familyId } = req.params;
            const userId = req.user.id;

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            if (!family.isMember(userId)) {
                return res.status(403).json({ error: 'Not a family member' });
            }

            if (!family.hasPermission(userId, 'canInviteMembers')) {
                return res.status(403).json({ error: 'No permission to invite members' });
            }

            if (family.subscriptionPlan === 'FREE' && family.getMemberCount() >= 3) {
                return res.status(403).json({ 
                    error: 'FREE plan supports maximum 3 members',
                    code: 'FREE_PLAN_MEMBER_LIMIT'
                });
            }

            next();
        } catch (error) {
            console.error('Member invitation validation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async validateFeatureAccess(req, res, next) {
        try {
            const { familyId } = req.params;
            const userId = req.user.id;
            const feature = req.feature || 'basic';

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            if (!family.isMember(userId)) {
                return res.status(403).json({ error: 'Not a family member' });
            }

            const restrictedFeatures = {
                'ai-analysis': ['PREMIUM', 'PRO'],
                'sms-notifications': ['PREMIUM', 'PRO'],
                'child-controls': ['PREMIUM', 'PRO'],
                'unlimited-members': ['PREMIUM', 'PRO'],
                'advanced-challenges': ['PRO']
            };

            if (restrictedFeatures[feature]) {
                if (!restrictedFeatures[feature].includes(family.subscriptionPlan)) {
                    return res.status(403).json({ 
                        error: `Feature "${feature}" requires ${restrictedFeatures[feature].join(' or ')} plan`,
                        code: 'FEATURE_NOT_AVAILABLE',
                        requiredPlan: restrictedFeatures[feature]
                    });
                }
            }

            req.family = family;
            next();
        } catch (error) {
            console.error('Feature access validation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async validateAIAccess(req, res, next) {
        req.feature = 'ai-analysis';
        return MonetizationMiddleware.validateFeatureAccess(req, res, next);
    }

    static async validateSMSAccess(req, res, next) {
        req.feature = 'sms-notifications';
        return MonetizationMiddleware.validateFeatureAccess(req, res, next);
    }

    static async validateChildControls(req, res, next) {
        req.feature = 'child-controls';
        return MonetizationMiddleware.validateFeatureAccess(req, res, next);
    }

    static async validateAdvancedChallenges(req, res, next) {
        req.feature = 'advanced-challenges';
        return MonetizationMiddleware.validateFeatureAccess(req, res, next);
    }

    static async checkSubscriptionLimits(req, res, next) {
        try {
            const { familyId } = req.params;
            const userId = req.user.id;

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            const limits = {
                FREE: {
                    maxMembers: 3,
                    maxFamilies: 1,
                    features: ['basic-tasks', 'basic-goals', 'basic-finance']
                },
                PREMIUM: {
                    maxMembers: Infinity,
                    maxFamilies: 3,
                    features: ['unlimited-members', 'ai-analysis', 'sms-notifications', 'child-controls']
                },
                PRO: {
                    maxMembers: Infinity,
                    maxFamilies: 10,
                    features: ['unlimited-members', 'ai-analysis', 'sms-notifications', 'child-controls', 'advanced-challenges']
                }
            };

            const currentLimits = limits[family.subscriptionPlan];
            req.limits = currentLimits;
            req.family = family;

            next();
        } catch (error) {
            console.error('Subscription limits check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = MonetizationMiddleware;
