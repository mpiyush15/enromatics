import mongoose from 'mongoose';

const whatsAppTemplateSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
    default: 'UTILITY'
  },
  language: {
    type: String,
    default: 'en'
  },
  content: {
    type: String,
    required: true
  },
  variables: [{
    name: String,
    placeholder: String,
    example: String
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  waTemplateId: String,
  useCase: {
    type: String,
    enum: ['welcome', 'fee_reminder', 'attendance_alert', 'test_notification', 'general', 'other'],
    default: 'general'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Indexes
whatsAppTemplateSchema.index({ tenantId: 1 });
whatsAppTemplateSchema.index({ tenantId: 1, useCase: 1 });
whatsAppTemplateSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model('WhatsAppTemplate', whatsAppTemplateSchema);
