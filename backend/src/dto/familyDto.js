class CreateFamilyDto {
    constructor(data) {
        this.name = data.name;
        this.subscriptionPlan = data.subscriptionPlan || 'FREE';
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length === 0) {
            errors.push('Family name is required');
        }

        if (this.name && this.name.length > 100) {
            errors.push('Family name must be less than 100 characters');
        }

        if (this.subscriptionPlan && !['FREE', 'PREMIUM', 'PRO'].includes(this.subscriptionPlan)) {
            errors.push('Invalid subscription plan');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class UpdateFamilyDto {
    constructor(data) {
        this.name = data.name;
        this.settings = data.settings;
        this.subscriptionPlan = data.subscriptionPlan;
    }

    validate() {
        const errors = [];

        if (this.name && this.name.trim().length === 0) {
            errors.push('Family name cannot be empty');
        }

        if (this.name && this.name.length > 100) {
            errors.push('Family name must be less than 100 characters');
        }

        if (this.subscriptionPlan && !['FREE', 'PREMIUM', 'PRO'].includes(this.subscriptionPlan)) {
            errors.push('Invalid subscription plan');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class InviteMemberDto {
    constructor(data) {
        this.email = data.email;
        this.phone = data.phone;
        this.role = data.role || 'MEMBER';
        this.message = data.message;
    }

    validate() {
        const errors = [];

        if (!this.email && !this.phone) {
            errors.push('Either email or phone is required');
        }

        if (this.email && !this.isValidEmail(this.email)) {
            errors.push('Invalid email format');
        }

        if (this.role && !['ADMIN', 'MEMBER', 'CHILD'].includes(this.role)) {
            errors.push('Invalid role');
        }

        if (this.message && this.message.length > 500) {
            errors.push('Message must be less than 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

class UpdateMemberRoleDto {
    constructor(data) {
        this.role = data.role;
        this.nickname = data.nickname;
    }

    validate() {
        const errors = [];

        if (!this.role) {
            errors.push('Role is required');
        }

        if (this.role && !['ADMIN', 'MEMBER', 'CHILD'].includes(this.role)) {
            errors.push('Invalid role');
        }

        if (this.nickname && this.nickname.length > 50) {
            errors.push('Nickname must be less than 50 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class UpdateMemberPermissionsDto {
    constructor(data) {
        this.permissions = data.permissions;
    }

    validate() {
        const errors = [];

        if (!this.permissions || typeof this.permissions !== 'object') {
            errors.push('Permissions object is required');
            return { isValid: false, errors };
        }

        const validPermissions = [
            'canInviteMembers',
            'canManageTasks',
            'canViewFinance',
            'canManageFinance',
            'canCreateGoals',
            'canManageChallenges'
        ];

        Object.keys(this.permissions).forEach(key => {
            if (!validPermissions.includes(key)) {
                errors.push(`Invalid permission: ${key}`);
            }

            if (typeof this.permissions[key] !== 'boolean') {
                errors.push(`Permission ${key} must be a boolean`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class AcceptInvitationDto {
    constructor(data) {
        this.inviteCode = data.inviteCode;
        this.nickname = data.nickname;
    }

    validate() {
        const errors = [];

        if (!this.inviteCode || this.inviteCode.trim().length === 0) {
            errors.push('Invite code is required');
        }

        if (this.nickname && this.nickname.length > 50) {
            errors.push('Nickname must be less than 50 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class FamilyQueryDto {
    constructor(query) {
        this.page = parseInt(query.page) || 1;
        this.limit = parseInt(query.limit) || 10;
        this.search = query.search;
        this.subscriptionPlan = query.subscriptionPlan;
        this.isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;
    }

    validate() {
        const errors = [];

        if (this.page < 1) {
            errors.push('Page must be greater than 0');
        }

        if (this.limit < 1 || this.limit > 100) {
            errors.push('Limit must be between 1 and 100');
        }

        if (this.subscriptionPlan && !['FREE', 'PREMIUM', 'PRO'].includes(this.subscriptionPlan)) {
            errors.push('Invalid subscription plan');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    getSkip() {
        return (this.page - 1) * this.limit;
    }
}

module.exports = {
    CreateFamilyDto,
    UpdateFamilyDto,
    InviteMemberDto,
    UpdateMemberRoleDto,
    UpdateMemberPermissionsDto,
    AcceptInvitationDto,
    FamilyQueryDto
};
