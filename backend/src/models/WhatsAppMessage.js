import mongoose from 'mongoose';

const whatsAppMessageSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppContact'
  },
  recipientPhone: {
    type: String,
    required: true
  },
  recipientName: String,
  messageType: {
    type: String,
    enum: ['text', 'template', 'media', 'interactive'],
    default: 'text'
  },
  content: {
    text: String,
    templateName: String,
    templateParams: [String],
    mediaUrl: String,
    mediaType: String
  },
  waMessageId: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued'
  },
  statusUpdates: [{
    status: String,
    timestamp: Date,
    errorCode: String,
    errorMessage: String
  }],
  direction: {
    type: String,
    enum: ['outbound', 'inbound'],
    default: 'outbound'
  },
  campaign: {
    type: String,
    enum: ['manual', 'bulk_campaign', 'welcome', 'fee_reminder', 'attendance_alert', 'test_notification', 'inbox_reply', 'debug_test', 'other'],
    default: 'manual'
  },
  metadata: {
    studentId: mongoose.Schema.Types.ObjectId,
    class: String,
    feeAmount: Number,
    testName: String,
    marks: Number
  },
  cost: {
    type: Number,
    default: 0
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedAt: Date,
  errorCode: String,
  errorMessage: String
}, {
  timestamps: true
});

// Indexes
whatsAppMessageSchema.index({ tenantId: 1, createdAt: -1 });
whatsAppMessageSchema.index({ tenantId: 1, status: 1 });
whatsAppMessageSchema.index({ tenantId: 1, recipientPhone: 1 });
whatsAppMessageSchema.index({ tenantId: 1, campaign: 1 });

export default mongoose.model('WhatsAppMessage', whatsAppMessageSchema);
