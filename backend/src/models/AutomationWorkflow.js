import mongoose from "mongoose";

const automationWorkflowSchema = new mongoose.Schema(
  {
    // Tenant - Use String to match Tenant.tenantId (e.g., "global", "inst_123")
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Workflow Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["admission", "demo", "inquiry", "lead", "custom"],
      default: "custom",
    },

    // Questions
    questions: [
      {
        id: {
          type: String,
          required: true,
          unique: false, // Unique within workflow only
        },
        order: {
          type: Number,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        description: String,
        type: {
          type: String,
          enum: ["text", "choice", "multiselect"],
          default: "text",
        },
        options: [String], // For choice/multiselect
        isRequired: {
          type: Boolean,
          default: true,
        },
        
        // Data extraction flags
        isNameField: {
          type: Boolean,
          default: false,
        },
        isMobileField: {
          type: Boolean,
          default: false,
        },
        
        // CRM Mapping
        crmFieldName: {
          type: String, // Maps to CRM field like "name", "phone", "email", or custom field
          default: null,
        },
        
        placeholder: String,
        helpText: String,
      },
    ],

    // WhatsApp Integration
    linkedPhoneNumber: {
      type: String,
      trim: true,
    },
    whatsappBusinessAccountId: {
      type: String,
    },

    // Trigger Settings
    triggerKeyword: {
      type: String,
      default: "hi", // Tenant can set custom keyword like "demo", "admission", "info"
      lowercase: true,
      trim: true,
    },
    triggerDescription: {
      type: String,
      default: "Send 'hi' to start the workflow",
    },

    // Messages
    initialMessage: {
      type: String,
      default: "Thanks for reaching out! Let me ask you a few questions to better assist you.",
    },
    completionMessage: {
      type: String,
      default: "Thanks for your responses! Our team will contact you soon.",
    },
    skipMessage: {
      type: String,
      default: "Skipped this question",
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
      index: true,
    },

    // Stats
    conversationCount: {
      type: Number,
      default: 0,
    },
    completionCount: {
      type: Number,
      default: 0,
    },

    // Metadata
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    lastModifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
automationWorkflowSchema.index({ tenantId: 1, status: 1 });
automationWorkflowSchema.index({ tenantId: 1, createdAt: -1 });
automationWorkflowSchema.index({ linkedPhoneNumber: 1 });
automationWorkflowSchema.index({ status: 1, isPublished: 1 });

const AutomationWorkflow =
  mongoose.models.AutomationWorkflow ||
  mongoose.model("AutomationWorkflow", automationWorkflowSchema);

export default AutomationWorkflow;
