import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        index: true
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    recipient: {
        type: String,
        required: true,
        index: true
    },

    subject: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: [
            'otp',
            'welcome',
            'password-reset',
            'tenant-registration',
            'student-registration',
            'payment-confirmation',
            'subscription',
            'demo-request',
            'demo-status',
            'admin-notification',
            'general'
        ],
        default: 'general',
        index: true
    },

    status: {
        type: String,
        enum: ['sent', 'failed', 'bounced', 'opened', 'clicked'],
        default: 'sent',
        index: true
    },

    messageId: {
        type: String
    },

    error: {
        type: String
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed
    },

    sentAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    openedAt: {
        type: Date
    },

    clickedAt: {
        type: Date
    }

}, { timestamps: true });

// Indexes for better query performance
emailLogSchema.index({ tenantId: 1, sentAt: -1 });
emailLogSchema.index({ recipient: 1, sentAt: -1 });
emailLogSchema.index({ type: 1, status: 1 });

export default mongoose.model('EmailLog', emailLogSchema);
