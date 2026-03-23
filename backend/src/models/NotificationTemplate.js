import mongoose from 'mongoose';
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const notificationTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    // Template name (e.g., "student_absence_notification")
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Template display name
    displayName: {
      type: String,
      required: true,
    },
    // Template description
    description: String,
    // Trigger event type
    triggerEvent: {
      type: String,
      enum: [
        'student_absent',
        'payment_received',
        'test_created',
        'test_result',
        'enrollment_confirmation',
        'fee_reminder',
        'exam_notification',
        'custom'
      ],
      required: true,
    },
    // Notification channels
    channels: {
      email: {
        enabled: { type: Boolean, default: true },
        subject: String,
        body: String,
      },
      whatsapp: {
        enabled: { type: Boolean, default: true },
        body: String,
      },
      sms: {
        enabled: { type: Boolean, default: false },
        body: String,
      },
      inApp: {
        enabled: { type: Boolean, default: true },
        title: String,
        body: String,
      },
    },
    // Template variables (placeholders)
    variables: [
      {
        name: String, // e.g., "studentName", "absenceDate"
        description: String,
      },
    ],
    // When to trigger (auto/manual)
    triggerType: {
      type: String,
      enum: ENUMS.NOTIFICATION_TRIGGER_TYPE,
      default: 'both',
    },
    // Priority
    priority: {
      type: String,
      enum: ENUMS.NOTIFICATION_PRIORITY,
      default: 'medium',
    },
    // Is active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Sample data for testing
    sampleData: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationTemplateSchema.index({ tenantId: 1, triggerEvent: 1 });
notificationTemplateSchema.index({ tenantId: 1, isActive: 1 });

export default mongoose.model('NotificationTemplate', notificationTemplateSchema);
