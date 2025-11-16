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
  variables: {
    type: [String], // Array of variable placeholders like ["1", "2", "3"]
    default: []
  },
  components: {
    type: Array, // Store full Meta template components
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  metaTemplateId: String, // Meta's template ID
  waTemplateId: String, // Legacy field
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
  lastSyncedAt: Date, // Last time synced from Meta
  approvedAt: Date,
  rejectedAt: Date,
  rejectedReason: String, // Meta's rejection reason
  deleted: {
    type: Boolean,
    default: false
  } // Mark as deleted if removed from Meta
}, {
  timestamps: true
});

// Indexes
whatsAppTemplateSchema.index({ tenantId: 1 });
whatsAppTemplateSchema.index({ tenantId: 1, useCase: 1 });
whatsAppTemplateSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model('WhatsAppTemplate', whatsAppTemplateSchema);
