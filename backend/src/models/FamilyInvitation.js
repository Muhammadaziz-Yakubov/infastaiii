const mongoose = require('mongoose');

const familyInvitationSchema = new mongoose.Schema({
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitedEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    invitedPhone: {
        type: String,
        trim: true
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'MEMBER', 'CHILD'],
        default: 'MEMBER',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
        default: 'PENDING'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: function() {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
    },
    acceptedAt: {
        type: Date
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

familyInvitationSchema.index({ inviteCode: 1 });
familyInvitationSchema.index({ familyId: 1 });
familyInvitationSchema.index({ invitedEmail: 1 });
familyInvitationSchema.index({ invitedPhone: 1 });
familyInvitationSchema.index({ status: 1 });
familyInvitationSchema.index({ expiresAt: 1 });

familyInvitationSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

familyInvitationSchema.methods.canBeAccepted = function() {
    return this.status === 'PENDING' && !this.isExpired();
};

familyInvitationSchema.pre('save', function(next) {
    if (this.isExpired() && this.status === 'PENDING') {
        this.status = 'EXPIRED';
    }
    next();
});

module.exports = mongoose.model('FamilyInvitation', familyInvitationSchema);
