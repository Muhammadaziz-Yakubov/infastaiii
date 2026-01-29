const Family = require('../models/Family');
const jwt = require('jsonwebtoken');

class FamilyGuard {
    static async requireFamilyMember(req, res, next) {
        try {
            const { familyId } = req.params;
            const userId = req.user.id;

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            if (!family.isMember(userId)) {
                return res.status(403).json({ error: 'Access denied: Not a family member' });
            }

            req.family = family;
            req.userRole = family.getMemberRole(userId);
            next();
        } catch (error) {
            console.error('Family member guard error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async requireFamilyAdmin(req, res, next) {
        try {
            const { familyId } = req.params;
            const userId = req.user.id;

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            if (!family.isMember(userId)) {
                return res.status(403).json({ error: 'Access denied: Not a family member' });
            }

            const userRole = family.getMemberRole(userId);
            if (userRole !== 'ADMIN') {
                return res.status(403).json({ error: 'Access denied: Admin privileges required' });
            }

            req.family = family;
            req.userRole = userRole;
            next();
        } catch (error) {
            console.error('Family admin guard error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async requirePermission(permission) {
        return async (req, res, next) => {
            try {
                const { familyId } = req.params;
                const userId = req.user.id;

                const family = await Family.findById(familyId);
                if (!family) {
                    return res.status(404).json({ error: 'Family not found' });
                }

                if (!family.isMember(userId)) {
                    return res.status(403).json({ error: 'Access denied: Not a family member' });
                }

                if (!family.hasPermission(userId, permission)) {
                    return res.status(403).json({ 
                        error: `Access denied: Missing permission "${permission}"` 
                    });
                }

                req.family = family;
                req.userRole = family.getMemberRole(userId);
                next();
            } catch (error) {
                console.error('Permission guard error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
    }

    static async requireFamilyOwner(req, res, next) {
        try {
            const { familyId } = req.params;
            const userId = req.user.id;

            const family = await Family.findById(familyId);
            if (!family) {
                return res.status(404).json({ error: 'Family not found' });
            }

            if (family.ownerId.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Access denied: Family owner privileges required' });
            }

            req.family = family;
            req.userRole = 'OWNER';
            next();
        } catch (error) {
            console.error('Family owner guard error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

class RoleDecorator {
    static requireRole(...allowedRoles) {
        return (req, res, next) => {
            const userRole = req.userRole;

            if (!userRole) {
                return res.status(403).json({ error: 'Role not determined' });
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ 
                    error: `Access denied: Required roles: ${allowedRoles.join(', ')}` 
                });
            }

            next();
        };
    }

    static requireAdmin(req, res, next) {
        return RoleDecorator.requireRole('ADMIN')(req, res, next);
    }

    static requireMemberOrAbove(req, res, next) {
        return RoleDecorator.requireRole('ADMIN', 'MEMBER')(req, res, next);
    }

    static excludeChildren(req, res, next) {
        if (req.userRole === 'CHILD') {
            return res.status(403).json({ error: 'Access denied: Children not allowed' });
        }
        next();
    }
}

class PermissionDecorator {
    static requirePermission(permission) {
        return (req, res, next) => {
            const family = req.family;
            const userId = req.user.id;

            if (!family) {
                return res.status(400).json({ error: 'Family context required' });
            }

            if (!family.hasPermission(userId, permission)) {
                return res.status(403).json({ 
                    error: `Access denied: Missing permission "${permission}"` 
                });
            }

            next();
        };
    }

    static requireFinanceAccess(req, res, next) {
        return PermissionDecorator.requirePermission('canViewFinance')(req, res, next);
    }

    static requireFinanceManagement(req, res, next) {
        return PermissionDecorator.requirePermission('canManageFinance')(req, res, next);
    }

    static requireTaskManagement(req, res, next) {
        return PermissionDecorator.requirePermission('canManageTasks')(req, res, next);
    }

    static requireGoalCreation(req, res, next) {
        return PermissionDecorator.requirePermission('canCreateGoals')(req, res, next);
    }

    static requireChallengeManagement(req, res, next) {
        return PermissionDecorator.requirePermission('canManageChallenges')(req, res, next);
    }

    static requireMemberInvitation(req, res, next) {
        return PermissionDecorator.requirePermission('canInviteMembers')(req, res, next);
    }
}

function extractFamilyFromToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = {
    FamilyGuard,
    RoleDecorator,
    PermissionDecorator,
    extractFamilyFromToken
};
