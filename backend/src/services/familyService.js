const Family = require('../models/Family');
const FamilyInvitation = require('../models/FamilyInvitation');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const MonetizationMiddleware = require('../middleware/monetizationMiddleware');

class FamilyService {
    static async createFamily(userId, familyData) {
        const { name, subscriptionPlan = 'FREE' } = familyData;

        const existingFamily = await Family.findOne({ 
            ownerId: userId, 
            isArchived: false 
        });

        if (subscriptionPlan === 'FREE' && existingFamily) {
            throw new Error('FREE plan allows only 1 family per user');
        }

        const family = new Family({
            name: name.trim(),
            ownerId: userId,
            subscriptionPlan,
            members: [{
                userId: userId,
                role: 'ADMIN',
                joinedAt: new Date(),
                permissions: {
                    canInviteMembers: true,
                    canManageTasks: true,
                    canViewFinance: true,
                    canManageFinance: true,
                    canCreateGoals: true,
                    canManageChallenges: true
                }
            }]
        });

        family.updatePermissionsBasedOnPlan();
        await family.save();

        return await Family.findById(family._id).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async getUserFamilies(userId, query = {}) {
        try {
            console.log('Getting families for user:', userId);
            
            let matchQuery = {
                $or: [
                    { ownerId: userId },
                    { 'members.userId': userId }
                ],
                isArchived: false
            };

            if (query.isActive !== undefined) {
                matchQuery.isActive = query.isActive;
            }

            if (query.search) {
                matchQuery.name = { $regex: query.search, $options: 'i' };
            }

            console.log('Family query:', JSON.stringify(matchQuery, null, 2));

            const families = await Family.find(matchQuery)
                .populate('members.userId', 'firstName lastName email phone avatar')
                .populate('ownerId', 'firstName lastName email phone avatar')
                .sort({ updatedAt: -1 })
                .limit(query.limit || 10);

            console.log('Found families:', families.length);

            return {
                families,
                pagination: {
                    page: query.page || 1,
                    limit: query.limit || 10,
                    total: families.length,
                    pages: Math.ceil(families.length / (query.limit || 10))
                }
            };
        } catch (error) {
            console.error('Error in getUserFamilies:', error);
            throw error;
        }
    }

    static async getFamilyById(familyId, userId) {
        const family = await Family.findById(familyId)
            .populate('members.userId', 'firstName lastName email phone avatar')
            .populate('ownerId', 'firstName lastName email phone avatar');

        if (!family) {
            throw new Error('Family not found');
        }

        if (!family.isMember(userId) && family.ownerId.toString() !== userId.toString()) {
            throw new Error('Access denied: Not a family member');
        }

        return family;
    }

    static async updateFamily(familyId, userId, updateData) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        if (!family.isMember(userId)) {
            throw new Error('Access denied: Not a family member');
        }

        const userRole = family.getMemberRole(userId);
        if (userRole !== 'ADMIN') {
            throw new Error('Access denied: Admin privileges required');
        }

        const { name, settings, subscriptionPlan } = updateData;

        if (name) family.name = name.trim();
        if (settings) family.settings = { ...family.settings, ...settings };
        if (subscriptionPlan) {
            family.subscriptionPlan = subscriptionPlan;
            family.updatePermissionsBasedOnPlan();
        }

        await family.save();
        return await Family.findById(familyId).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async inviteMember(familyId, inviterId, invitationData) {
        const { email, phone, role = 'MEMBER', message } = invitationData;

        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        if (!family.isMember(inviterId)) {
            throw new Error('Access denied: Not a family member');
        }

        if (!family.hasPermission(inviterId, 'canInviteMembers')) {
            throw new Error('Access denied: No permission to invite members');
        }

        if (family.subscriptionPlan === 'FREE' && family.getMemberCount() >= 3) {
            throw new Error('FREE plan supports maximum 3 members');
        }

        const existingMember = family.members.find(member => {
            if (email) {
                return member.userId.email === email;
            }
            if (phone) {
                return member.userId.phone === phone;
            }
            return false;
        });

        if (existingMember) {
            throw new Error('User is already a family member');
        }

        const inviteCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invitation = new FamilyInvitation({
            familyId: familyId,
            invitedBy: inviterId,
            invitedEmail: email,
            invitedPhone: phone,
            inviteCode,
            role,
            expiresAt,
            message
        });

        await invitation.save();

        family.inviteCode = inviteCode;
        family.inviteCodeExpires = expiresAt;
        await family.save();

        return invitation;
    }

    static async acceptInvitation(userId, inviteCode, nickname) {
        const invitation = await FamilyInvitation.findOne({ inviteCode });
        
        if (!invitation) {
            throw new Error('Invalid invitation code');
        }

        if (!invitation.canBeAccepted()) {
            throw new Error('Invitation is no longer valid');
        }

        const family = await Family.findById(invitation.familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        if (family.isMember(userId)) {
            throw new Error('Already a member of this family');
        }

        if (family.subscriptionPlan === 'FREE' && family.getMemberCount() >= 3) {
            throw new Error('Family has reached maximum member limit for FREE plan');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (invitation.invitedEmail && user.email !== invitation.invitedEmail) {
            throw new Error('Email does not match invitation');
        }

        if (invitation.invitedPhone && user.phone !== invitation.invitedPhone) {
            throw new Error('Phone does not match invitation');
        }

        family.members.push({
            userId: userId,
            role: invitation.role,
            joinedAt: new Date(),
            nickname: nickname || user.firstName
        });

        family.updatePermissionsBasedOnPlan();
        await family.save();

        invitation.status = 'ACCEPTED';
        invitation.acceptedBy = userId;
        invitation.acceptedAt = new Date();
        await invitation.save();

        return await Family.findById(family._id).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async rejectInvitation(userId, inviteCode) {
        const invitation = await FamilyInvitation.findOne({ inviteCode });
        
        if (!invitation) {
            throw new Error('Invalid invitation code');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (invitation.invitedEmail && user.email !== invitation.invitedEmail) {
            throw new Error('Email does not match invitation');
        }

        if (invitation.invitedPhone && user.phone !== invitation.invitedPhone) {
            throw new Error('Phone does not match invitation');
        }

        invitation.status = 'REJECTED';
        await invitation.save();

        return { message: 'Invitation rejected successfully' };
    }

    static async removeMember(familyId, adminId, memberUserId) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        const adminRole = family.getMemberRole(adminId);
        if (adminRole !== 'ADMIN') {
            throw new Error('Access denied: Admin privileges required');
        }

        if (family.ownerId.toString() === memberUserId.toString()) {
            throw new Error('Cannot remove family owner');
        }

        if (adminId.toString() === memberUserId.toString()) {
            throw new Error('Cannot remove yourself from family');
        }

        const memberIndex = family.members.findIndex(
            member => member.userId.toString() === memberUserId.toString()
        );

        if (memberIndex === -1) {
            throw new Error('Member not found in family');
        }

        family.members.splice(memberIndex, 1);
        await family.save();

        return await Family.findById(familyId).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async updateMemberRole(familyId, adminId, memberUserId, roleData) {
        const { role, nickname } = roleData;

        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        const adminRole = family.getMemberRole(adminId);
        if (adminRole !== 'ADMIN') {
            throw new Error('Access denied: Admin privileges required');
        }

        if (family.ownerId.toString() === memberUserId.toString()) {
            throw new Error('Cannot change family owner role');
        }

        const member = family.members.find(
            member => member.userId.toString() === memberUserId.toString()
        );

        if (!member) {
            throw new Error('Member not found in family');
        }

        if (role) member.role = role;
        if (nickname) member.nickname = nickname;

        family.updatePermissionsBasedOnPlan();
        await family.save();

        return await Family.findById(familyId).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async updateMemberPermissions(familyId, adminId, memberUserId, permissions) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        const adminRole = family.getMemberRole(adminId);
        if (adminRole !== 'ADMIN') {
            throw new Error('Access denied: Admin privileges required');
        }

        const member = family.members.find(
            member => member.userId.toString() === memberUserId.toString()
        );

        if (!member) {
            throw new Error('Member not found in family');
        }

        if (member.role === 'ADMIN') {
            throw new Error('Cannot modify admin permissions');
        }

        member.permissions = { ...member.permissions, ...permissions };
        await family.save();

        return await Family.findById(familyId).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async leaveFamily(familyId, userId) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        if (family.ownerId.toString() === userId.toString()) {
            throw new Error('Family owner cannot leave family. Transfer ownership first.');
        }

        const memberIndex = family.members.findIndex(
            member => member.userId.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            throw new Error('Not a family member');
        }

        family.members.splice(memberIndex, 1);
        await family.save();

        return { message: 'Left family successfully' };
    }

    static async transferOwnership(familyId, currentOwnerId, newOwnerId) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        if (family.ownerId.toString() !== currentOwnerId.toString()) {
            throw new Error('Access denied: Current owner privileges required');
        }

        const newOwner = family.members.find(
            member => member.userId.toString() === newOwnerId.toString()
        );

        if (!newOwner) {
            throw new Error('New owner must be a family member');
        }

        const currentOwnerMember = family.members.find(
            member => member.userId.toString() === currentOwnerId.toString()
        );

        family.ownerId = newOwnerId;
        
        currentOwnerMember.role = 'MEMBER';
        newOwner.role = 'ADMIN';

        family.updatePermissionsBasedOnPlan();
        await family.save();

        return await Family.findById(familyId).populate('members.userId', 'firstName lastName email phone avatar');
    }

    static async getPendingInvitations(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const invitations = await FamilyInvitation.find({
            $or: [
                { invitedEmail: user.email },
                { invitedPhone: user.phone }
            ],
            status: 'PENDING',
            expiresAt: { $gt: new Date() }
        })
        .populate('familyId', 'name subscriptionPlan')
        .populate('invitedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

        return invitations;
    }

    static async getFamilyInvitations(familyId, adminId) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        const adminRole = family.getMemberRole(adminId);
        if (adminRole !== 'ADMIN') {
            throw new Error('Access denied: Admin privileges required');
        }

        const invitations = await FamilyInvitation.find({ familyId })
            .populate('invitedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return invitations;
    }

    static async deleteFamily(familyId, ownerId) {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error('Family not found');
        }

        if (family.ownerId.toString() !== ownerId.toString()) {
            throw new Error('Access denied: Family owner privileges required');
        }

        family.isArchived = true;
        await family.save();

        await FamilyInvitation.updateMany(
            { familyId },
            { status: 'EXPIRED' }
        );

        return { message: 'Family archived successfully' };
    }

    static async joinFamily(userId, inviteCode, role = 'MEMBER') {
        try {
            console.log('Joining family with invite code:', inviteCode);
            
            const family = await Family.findOne({ 
                inviteCode: inviteCode.toUpperCase(),
                inviteCodeExpires: { $gt: new Date() }
            });

            if (!family) {
                throw new Error('Invalid or expired invite code');
            }

            // Check if user is already a member
            if (family.isMember(userId)) {
                throw new Error('You are already a member of this family');
            }

            // Check plan limits
            if (family.subscriptionPlan === 'FREE' && family.getMemberCount() >= 3) {
                throw new Error('This family has reached the FREE plan member limit');
            }

            // Add user to family
            family.members.push({
                userId: userId,
                role: role,
                joinedAt: new Date(),
                permissions: {
                    canInviteMembers: role === 'ADMIN',
                    canManageTasks: true,
                    canViewFinance: role === 'ADMIN',
                    canManageFinance: role === 'ADMIN',
                    canCreateGoals: role === 'ADMIN',
                    canManageChallenges: role === 'ADMIN'
                }
            });

            await family.save();

            // Clear the invite code
            family.inviteCode = null;
            family.inviteCodeExpires = null;
            await family.save();

            return await Family.findById(family._id)
                .populate('members.userId', 'firstName lastName email phone avatar')
                .populate('ownerId', 'firstName lastName email phone avatar');
        } catch (error) {
            console.error('Error in joinFamily:', error);
            throw error;
        }
    }
}

module.exports = FamilyService;
