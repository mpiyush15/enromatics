import mongoose from "mongoose";

/**
 * Tenant Schema
 * Represents each coaching institute (client) using Enro Matics.
 * Every tenant has its own users, students, and staff associated via tenantId.
 */

const tenantSchema = new mongoose.Schema(
  {
    // Unique tenant identifier used to link all data
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Owner/Tenant person name (e.g., "John Smith")
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Institute/Organization name (e.g., "ABC Coaching Institute")
    instituteName: {
      type: String,
      required: false,
      trim: true,
      default: function() {
        // Use name as default if instituteName not provided
        return this.name;
      }
    },

    // Owner (tenantAdmin) email address
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    // Plan type: free, basic, pro, enterprise
    // NOTE: Subscription data moved to TenantSubscription model for single source of truth
    plan: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      default: "free",
    },

    // Subscription metadata (mirrored from TenantSubscription for quick access)
    subscriptionMetadata: {
      billingCycle: {
        type: String,
        enum: ["monthly", "annual"],
        default: "monthly",
        description: "How often subscription renews"
      },
      autoRenew: {
        type: Boolean,
        default: true,
        description: "Whether subscription auto-renews at end date"
      },
      nextBillingDate: {
        type: Date,
        default: null,
        description: "Calculated date of next billing cycle"
      },
      renewalReminderSent: {
        type: Boolean,
        default: false,
        description: "Whether renewal reminder notification was sent"
      },
      lastRenewalDate: {
        type: Date,
        default: null,
        description: "When subscription was last renewed"
      }
    },

    // Invoice data (quick access to latest invoices)
    invoiceData: {
      lastInvoiceNumber: {
        type: String,
        default: null
      },
      lastInvoicePdfUrl: {
        type: String,
        default: null
      },
      lastInvoiceDate: {
        type: Date,
        default: null
      },
      totalInvoices: {
        type: Number,
        default: 0
      }
    },

    // Whether tenant account is active or suspended
    active: {
      type: Boolean,
      default: true,
    },

    // Optional contact information for admin use
    contact: {
      phone: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: "India" },
    },

    // WhatsApp consent for marketing messages
    whatsappOptIn: {
      type: Boolean,
      default: true, // Default to true for existing tenants
    },

    // WhatsApp Platform Configuration (for WhatsApp integration)
    whatsappConfig: {
      businessAccountId: { type: String, default: null },
      phoneNumberId: { type: String, default: null },
      phoneNumber: { type: String, default: null },
      apiKey: { type: String, default: null },
      accessToken: { type: String, default: null },
      isConfigured: { type: Boolean, default: false },
      connectionStatus: { type: String, enum: ['connected', 'disconnected', 'error'], default: 'disconnected' },
      connectedAt: { type: Date, default: null },
      errorMessage: { type: String, default: null },
      updatedAt: { type: Date, default: null },
    },

    // WhatsApp Event Triggers Configuration
    eventTriggers: {
      absenceNotifications: {
        enabled: { type: Boolean, default: false },
        template: {
          type: String,
          default: "Hi {studentName}, you were marked absent on {date}",
        },
      },
      enrollmentNotifications: {
        enabled: { type: Boolean, default: false },
        emailEnabled: { type: Boolean, default: false },
        whatsappTemplate: {
          type: String,
          default: "Hi {studentName}, welcome! You have been enrolled in {batchName}. 📚\n\nYour Portal Access:\n🔗 URL: {portalUrl}\n👤 Login ID: {loginId}\n🔐 Password: {password}\n\nDownload our app: {googlePlayUrl}\n\nHappy Learning!",
        },
      },
      paymentReceipts: {
        enabled: { type: Boolean, default: false },
        template: {
          type: String,
          default: "Payment of ₹{amount} received on {date}",
        },
      },
      testResults: {
        enabled: { type: Boolean, default: false },
        template: {
          type: String,
          default: "Your test result: {marks}/{total} ({percentage}%)",
        },
      },
    },

    // Analytics and usage tracking (for future scaling)
    usage: {
      studentsCount: { type: Number, default: 0 },
      staffCount: { type: Number, default: 0 },
      adsCount: { type: Number, default: 0 },
    },

    // Branding and subdomain configuration
    subdomain: {
      type: String,
      default: null,
      index: true,
    },
    branding: {
      logoUrl: { type: String, default: null },
      themeColor: { type: String, default: "#2F6CE5" },
      appName: { type: String, default: null },
    },
  },
  { timestamps: true }
);

/**
 * Virtual: users
 * Helps populate all users belonging to this tenant (if needed).
 */
tenantSchema.virtual("users", {
  ref: "User",
  localField: "tenantId",
  foreignField: "tenantId",
});

// Instance method: Check if subscription is due for renewal
tenantSchema.methods.isRenewalDue = function() {
  if (!this.subscriptionMetadata?.nextBillingDate) {
    return false;
  }
  return new Date() >= this.subscriptionMetadata.nextBillingDate;
};

// Instance method: Get days until renewal
tenantSchema.methods.getDaysUntilRenewal = function() {
  if (!this.subscriptionMetadata?.nextBillingDate) {
    return null;
  }
  const now = new Date();
  const nextDate = new Date(this.subscriptionMetadata.nextBillingDate);
  const daysMs = nextDate - now;
  return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
};

// Instance method: Check if renewal reminder should be sent
tenantSchema.methods.shouldSendRenewalReminder = function(daysBeforeExpiry = 7) {
  const daysUntil = this.getDaysUntilRenewal();
  return (
    daysUntil !== null && 
    daysUntil > 0 && 
    daysUntil <= daysBeforeExpiry &&
    !this.subscriptionMetadata?.renewalReminderSent
  );
};

// Instance method: Mark renewal reminder as sent
tenantSchema.methods.markRenewalReminderSent = async function() {
  this.subscriptionMetadata.renewalReminderSent = true;
  return this.save();
};

// Instance method: Reset renewal reminder flag
tenantSchema.methods.resetRenewalReminder = async function() {
  this.subscriptionMetadata.renewalReminderSent = false;
  return this.save();
};

// Instance method: Get invoice summary
tenantSchema.methods.getInvoiceSummary = function() {
  return {
    lastInvoiceNumber: this.invoiceData?.lastInvoiceNumber,
    lastInvoicePdfUrl: this.invoiceData?.lastInvoicePdfUrl,
    lastInvoiceDate: this.invoiceData?.lastInvoiceDate,
    totalInvoices: this.invoiceData?.totalInvoices || 0
  };
};

// Static method: Find tenants due for renewal
tenantSchema.statics.findDueForRenewal = function() {
  return this.find({
    'subscriptionMetadata.nextBillingDate': { $lte: new Date() },
    'subscriptionMetadata.autoRenew': true
  });
};

// Static method: Find tenants needing renewal reminders
tenantSchema.statics.findNeedingRenewalReminder = function(daysBeforeExpiry = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);
  
  return this.find({
    'subscriptionMetadata.nextBillingDate': {
      $gt: new Date(),
      $lte: targetDate
    },
    'subscriptionMetadata.renewalReminderSent': false
  });
};

// Ensure virtuals are included in JSON responses
tenantSchema.set("toJSON", { virtuals: true });
tenantSchema.set("toObject", { virtuals: true });

/**
 * CASCADE DELETE: When a tenant is deleted, remove all dependent records
 * This prevents orphaned records and maintains referential integrity
 */
tenantSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const tenantId = this.tenantId;
  console.log(`🗑️  Cascade deleting records for tenant: ${tenantId}`);
  
  try {
    // Import models dynamically to avoid circular dependencies
    const { default: User } = await import('./User.js');
    const { default: Student } = await import('./Student.js');
    const { default: Batch } = await import('./Batch.js');
    const { default: Test } = await import('./Test.js');
    const { default: TestAttendance } = await import('./TestAttendance.js');
    const { default: Attendance } = await import('./Attendance.js');
    const { default: TestMarks } = await import('./TestMarks.js');
    const { default: TenantSubscription } = await import('./TenantSubscription.js');
    const { default: TenantRole } = await import('./TenantRole.js');
    const { default: Lead } = await import('./Lead.js');
    const { default: CallLog } = await import('./CallLog.js');
    const { default: Employee } = await import('./Employee.js');
    const { default: Counter } = await import('./Counter.js');
    const { default: NotificationTemplate } = await import('./NotificationTemplate.js');
    const { default: WhatsAppEventLog } = await import('./WhatsAppEventLog.js');
    const { default: PaymentSession } = await import('./PaymentSession.js');
    const { default: Chapter } = await import('./Chapter.js');
    const { default: Subject } = await import('./Subject.js');
    const { default: Lesson } = await import('./Lesson.js');
    const { default: TestQuestion } = await import('./TestQuestion.js');
    const { default: StudentTestAnswer } = await import('./StudentTestAnswer.js');
    const { default: StudentMaterialProgress } = await import('./StudentMaterialProgress.js');
    const { default: StudyMaterial } = await import('./StudyMaterial.js');
    const { default: VideoLesson } = await import('./VideoLesson.js');
    const { default: SMSTemplate } = await import('./SMSTemplate.js');
    const { default: WhatsAppMessage } = await import('./WhatsAppMessage.js');
    const { default: AutomationWorkflow } = await import('./AutomationWorkflow.js');
    const { default: WorkflowTemplate } = await import('./WorkflowTemplate.js');
    const { default: WorkflowConversation } = await import('./WorkflowConversation.js');
    const { default: BatchStudent } = await import('./BatchStudent.js');

    // Delete operations for all collections with this tenantId
    const deleteResults = [];

    const collections = [
      { name: 'User', model: User },
      { name: 'Student', model: Student },
      { name: 'Batch', model: Batch },
      { name: 'Test', model: Test },
      { name: 'TestAttendance', model: TestAttendance },
      { name: 'Attendance', model: Attendance },
      { name: 'TestMarks', model: TestMarks },
      { name: 'TenantSubscription', model: TenantSubscription },
      { name: 'TenantRole', model: TenantRole },
      { name: 'Lead', model: Lead },
      { name: 'CallLog', model: CallLog },
      { name: 'Employee', model: Employee },
      { name: 'Counter', model: Counter },
      { name: 'NotificationTemplate', model: NotificationTemplate },
      { name: 'WhatsAppEventLog', model: WhatsAppEventLog },
      { name: 'PaymentSession', model: PaymentSession },
      { name: 'Chapter', model: Chapter },
      { name: 'Subject', model: Subject },
      { name: 'Lesson', model: Lesson },
      { name: 'TestQuestion', model: TestQuestion },
      { name: 'StudentTestAnswer', model: StudentTestAnswer },
      { name: 'StudentMaterialProgress', model: StudentMaterialProgress },
      { name: 'StudyMaterial', model: StudyMaterial },
      { name: 'VideoLesson', model: VideoLesson },
      { name: 'SMSTemplate', model: SMSTemplate },
      { name: 'WhatsAppMessage', model: WhatsAppMessage },
      { name: 'AutomationWorkflow', model: AutomationWorkflow },
      { name: 'WorkflowTemplate', model: WorkflowTemplate },
      { name: 'WorkflowConversation', model: WorkflowConversation },
      { name: 'BatchStudent', model: BatchStudent },
    ];

    for (const { name, model } of collections) {
      try {
        const result = await model.deleteMany({ tenantId });
        if (result.deletedCount > 0) {
          deleteResults.push(`  ✅ ${name}: ${result.deletedCount} deleted`);
        }
      } catch (error) {
        deleteResults.push(`  ⚠️  ${name}: Failed - ${error.message}`);
      }
    }

    if (deleteResults.length > 0) {
      console.log('Cascade delete results:');
      deleteResults.forEach(r => console.log(r));
    }
  } catch (error) {
    console.error(`❌ Cascade delete error for tenant ${tenantId}:`, error.message);
    throw error;
  }
});

// Model creation
const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);

export default Tenant;
