const FamilyService = require('../services/familyService');
const { 
    CreateFamilyDto, 
    UpdateFamilyDto, 
    InviteMemberDto, 
    UpdateMemberRoleDto,
    UpdateMemberPermissionsDto,
    AcceptInvitationDto,
    FamilyQueryDto
} = require('../dto/familyDto');

class FamilyController {
    static async createFamily(req, res) {
        try {
            const dto = new CreateFamilyDto(req.body);
            const validation = dto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const family = await FamilyService.createFamily(req.user.id, dto);
            res.status(201).json({
                success: true,
                data: family,
                message: 'Family created successfully'
            });
        } catch (error) {
            console.error('Create family error:', error);
            res.status(400).json({ 
                error: error.message || 'Failed to create family' 
            });
        }
    }

    static async getUserFamilies(req, res) {
        try {
            const queryDto = new FamilyQueryDto(req.query);
            const validation = queryDto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const result = await FamilyService.getUserFamilies(req.user.id, queryDto);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get user families error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to fetch families' 
            });
        }
    }

    static async getFamilyById(req, res) {
        try {
            const { familyId } = req.params;
            const family = await FamilyService.getFamilyById(familyId, req.user.id);
            
            res.json({
                success: true,
                data: family
            });
        } catch (error) {
            console.error('Get family error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ 
                error: error.message || 'Failed to fetch family' 
            });
        }
    }

    static async updateFamily(req, res) {
        try {
            const { familyId } = req.params;
            const dto = new UpdateFamilyDto(req.body);
            const validation = dto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const family = await FamilyService.updateFamily(familyId, req.user.id, dto);
            res.json({
                success: true,
                data: family,
                message: 'Family updated successfully'
            });
        } catch (error) {
            console.error('Update family error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to update family' 
            });
        }
    }

    static async inviteMember(req, res) {
        try {
            const { familyId } = req.params;
            const dto = new InviteMemberDto(req.body);
            const validation = dto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const invitation = await FamilyService.inviteMember(familyId, req.user.id, dto);
            res.status(201).json({
                success: true,
                data: invitation,
                message: 'Invitation sent successfully'
            });
        } catch (error) {
            console.error('Invite member error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to send invitation' 
            });
        }
    }

    static async acceptInvitation(req, res) {
        try {
            const dto = new AcceptInvitationDto(req.body);
            const validation = dto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const family = await FamilyService.acceptInvitation(
                req.user.id, 
                dto.inviteCode, 
                dto.nickname
            );
            
            res.json({
                success: true,
                data: family,
                message: 'Joined family successfully'
            });
        } catch (error) {
            console.error('Accept invitation error:', error);
            res.status(400).json({ 
                error: error.message || 'Failed to accept invitation' 
            });
        }
    }

    static async rejectInvitation(req, res) {
        try {
            const { inviteCode } = req.params;
            const result = await FamilyService.rejectInvitation(req.user.id, inviteCode);
            
            res.json({
                success: true,
                data: result,
                message: 'Invitation rejected'
            });
        } catch (error) {
            console.error('Reject invitation error:', error);
            res.status(400).json({ 
                error: error.message || 'Failed to reject invitation' 
            });
        }
    }

    static async removeMember(req, res) {
        try {
            const { familyId, memberId } = req.params;
            const family = await FamilyService.removeMember(familyId, req.user.id, memberId);
            
            res.json({
                success: true,
                data: family,
                message: 'Member removed successfully'
            });
        } catch (error) {
            console.error('Remove member error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to remove member' 
            });
        }
    }

    static async updateMemberRole(req, res) {
        try {
            const { familyId, memberId } = req.params;
            const dto = new UpdateMemberRoleDto(req.body);
            const validation = dto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const family = await FamilyService.updateMemberRole(familyId, req.user.id, memberId, dto);
            
            res.json({
                success: true,
                data: family,
                message: 'Member role updated successfully'
            });
        } catch (error) {
            console.error('Update member role error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to update member role' 
            });
        }
    }

    static async updateMemberPermissions(req, res) {
        try {
            const { familyId, memberId } = req.params;
            const dto = new UpdateMemberPermissionsDto(req.body);
            const validation = dto.validate();

            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const family = await FamilyService.updateMemberPermissions(familyId, req.user.id, memberId, dto.permissions);
            
            res.json({
                success: true,
                data: family,
                message: 'Member permissions updated successfully'
            });
        } catch (error) {
            console.error('Update member permissions error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to update member permissions' 
            });
        }
    }

    static async leaveFamily(req, res) {
        try {
            const { familyId } = req.params;
            const result = await FamilyService.leaveFamily(familyId, req.user.id);
            
            res.json({
                success: true,
                data: result,
                message: 'Left family successfully'
            });
        } catch (error) {
            console.error('Leave family error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to leave family' 
            });
        }
    }

    static async transferOwnership(req, res) {
        try {
            const { familyId } = req.params;
            const { newOwnerId } = req.body;

            if (!newOwnerId) {
                return res.status(400).json({ error: 'New owner ID is required' });
            }

            const family = await FamilyService.transferOwnership(familyId, req.user.id, newOwnerId);
            
            res.json({
                success: true,
                data: family,
                message: 'Ownership transferred successfully'
            });
        } catch (error) {
            console.error('Transfer ownership error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to transfer ownership' 
            });
        }
    }

    static async getPendingInvitations(req, res) {
        try {
            const invitations = await FamilyService.getPendingInvitations(req.user.id);
            
            res.json({
                success: true,
                data: invitations
            });
        } catch (error) {
            console.error('Get pending invitations error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to fetch invitations' 
            });
        }
    }

    static async getFamilyInvitations(req, res) {
        try {
            const { familyId } = req.params;
            const invitations = await FamilyService.getFamilyInvitations(familyId, req.user.id);
            
            res.json({
                success: true,
                data: invitations
            });
        } catch (error) {
            console.error('Get family invitations error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ 
                error: error.message || 'Failed to fetch invitations' 
            });
        }
    }

    static async deleteFamily(req, res) {
        try {
            const { familyId } = req.params;
            const result = await FamilyService.deleteFamily(familyId, req.user.id);
            
            res.json({
                success: true,
                data: result,
                message: 'Family deleted successfully'
            });
        } catch (error) {
            console.error('Delete family error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(400).json({ 
                error: error.message || 'Failed to delete family' 
            });
        }
    }

    static async getFamilyStats(req, res) {
        try {
            const { familyId } = req.params;
            const family = await FamilyService.getFamilyById(familyId, req.user.id);
            
            const stats = {
                memberCount: family.getMemberCount(),
                subscriptionPlan: family.subscriptionPlan,
                isActive: family.isActive,
                budgetBalance: family.budget.balance,
                currency: family.budget.currency,
                createdAt: family.createdAt,
                roles: family.members.reduce((acc, member) => {
                    acc[member.role] = (acc[member.role] || 0) + 1;
                    return acc;
                }, {})
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get family stats error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ 
                error: error.message || 'Failed to fetch family stats' 
            });
        }
    }

    static async getUserFamilyDashboard(req, res) {
        try {
            const userId = req.user.id;
            
            // Get user's families
            const families = await FamilyService.getUserFamilies(userId);
            
            if (!families || families.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        family: null,
                        memberCount: 0,
                        subscriptionPlan: 'FREE',
                        isActive: false
                    }
                });
            }
            
            // Get the first family (or primary family)
            const family = families[0];
            
            const Task = require('../models/Task');
            const Finance = require('../models/Finance');

            const tasks = await Task.find({ familyId: family._id });
            const completedTasks = tasks.filter(t => t.status === 'completed').length;

            const finances = await Finance.find({ familyId: family._id });
            const income = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
            const expense = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

            res.json({
                success: true,
                data: {
                    family,
                    memberCount: family.members.length,
                    subscriptionPlan: family.subscriptionPlan,
                    isActive: family.isActive !== false,
                    stats: {
                        totalTasks: tasks.length,
                        completedTasks,
                        income,
                        expense,
                        balance: income - expense
                    }
                }
            });
        } catch (error) {
            console.error('Get user family dashboard error:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to get family dashboard' 
            });
        }
    }

    static async getFamilyDashboard(req, res) {
        try {
            const { familyId } = req.params;
            const family = await FamilyService.getFamilyById(familyId, req.user.id);
            
            const Task = require('../models/Task');
            const Finance = require('../models/Finance');

            const tasks = await Task.find({ familyId });
            const completedTasks = tasks.filter(t => t.status === 'completed').length;

            const finances = await Finance.find({ familyId });
            const income = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
            const expense = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

            res.json({
                success: true,
                data: {
                    family,
                    stats: {
                        totalTasks: tasks.length,
                        completedTasks,
                        income,
                        expense,
                        balance: income - expense
                    },
                    recentTransactions: finances.slice(-5).reverse()
                }
            });
        } catch (error) {
            console.error('Get family dashboard error:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ 
                error: error.message || 'Failed to fetch family dashboard' 
            });
        }
    }
}

module.exports = FamilyController;
