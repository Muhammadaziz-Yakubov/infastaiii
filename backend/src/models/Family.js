const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['ADMIN', 'MEMBER', 'CHILD'],
            default: 'MEMBER',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        permissions: {
            canInviteMembers: {
                type: Boolean,
                default: false
            },
            canManageTasks: {
                type: Boolean,
                default: true
            },
            canViewFinance: {
                type: Boolean,
                default: true
            },
            canManageFinance: {
                type: Boolean,
                default: false
            },
            canCreateGoals: {
                type: Boolean,
                default: true
            },
            canManageChallenges: {
                type: Boolean,
                default: false
            }
        },
        nickname: {
            type: String,
            trim: true,
            maxlength: 50
        }
    }],
    subscriptionPlan: {
        type: String,
        enum: ['FREE', 'PREMIUM', 'PRO'],
        default: 'FREE',
        required: true
    },
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    inviteCodeExpires: {
        type: Date
    },
    settings: {
        allowMemberInvite: {
            type: Boolean,
            default: false
        },
        sharedBudget: {
            type: Boolean,
            default: true
        },
        childControls: {
            enabled: {
                type: Boolean,
                default: false
            },
            screenTimeLimit: {
                type: Number,
                default: 0
            },
            bedTimeAlert: {
                type: String,
                default: '21:00'
            }
        }
    },
    budget: {
        balance: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'UZS',
            enum: ['UZS', 'USD', 'EUR', 'RUB']
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

familySchema.index({ ownerId: 1 });
familySchema.index({ 'members.userId': 1 });
familySchema.index({ subscriptionPlan: 1 });

familySchema.methods.isMember = function(userId) {
    return this.members.some(member => member.userId.toString() === userId.toString());
};

familySchema.methods.getMemberRole = function(userId) {
    const member = this.members.find(member => member.userId.toString() === userId.toString());
    return member ? member.role : null;
};

familySchema.methods.hasPermission = function(userId, permission) {
    const member = this.members.find(member => member.userId.toString() === userId.toString());
    if (!member) return false;
    
    if (member.role === 'ADMIN') return true;
    return member.permissions[permission] || false;
};

familySchema.methods.getMemberCount = function() {
    return this.members.length;
};

familySchema.pre('save', function(next) {
    if (this.isModified('subscriptionPlan')) {
        this.updatePermissionsBasedOnPlan();
    }
    next();
});

familySchema.methods.updatePermissionsBasedOnPlan = function() {
    const isPremiumOrPro = this.subscriptionPlan === 'PREMIUM' || this.subscriptionPlan === 'PRO';
    
    this.members.forEach(member => {
        if (member.role === 'ADMIN') {
            member.permissions = {
                canInviteMembers: true,
                canManageTasks: true,
                canViewFinance: true,
                canManageFinance: true,
                canCreateGoals: true,
                canManageChallenges: true
            };
        } else if (member.role === 'MEMBER') {
            member.permissions = {
                canInviteMembers: isPremiumOrPro && this.settings.allowMemberInvite,
                canManageTasks: true,
                canViewFinance: true,
                canManageFinance: false,
                canCreateGoals: true,
                canManageChallenges: isPremiumOrPro
            };
        } else if (member.role === 'CHILD') {
            member.permissions = {
                canInviteMembers: false,
                canManageTasks: true,
                canViewFinance: false,
                canManageFinance: false,
                canCreateGoals: false,
                canManageChallenges: false
            };
        }
    });
};

module.exports = mongoose.model('Family', familySchema);
