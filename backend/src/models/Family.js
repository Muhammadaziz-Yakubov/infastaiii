const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'dad', 'mom', 'son', 'daughter', 'grandfather', 'grandmother', 'member', 'child'],
            default: 'member'
        },
        nickname: String
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    settings: {
        allowMemberInvite: {
            type: Boolean,
            default: false
        },
        sharedBudget: {
            type: Boolean,
            default: true
        }
    },
    budget: {
        balance: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'UZS'
        }
    },
    goals: [{
        title: String,
        targetAmount: Number,
        currentAmount: {
            type: Number,
            default: 0
        },
        deadline: Date,
        icon: String,
        color: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Family', familySchema);
