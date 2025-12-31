import mongoose from "mongoose";

const workflowConversationSchema = new mongoose.Schema(
  {
    // Tenant - Use String to match Tenant.tenantId
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Workflow & Conversation Link
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomationWorkflow",
      required: true,
      index: true,
    },
    conversationId: {
      type: String, // Link to existing Conversation in inbox
      required: true,
      index: true,
    },

    // WhatsApp User Info
    senderPhone: {
      type: String,
      required: true,
      index: true,
    },
    senderName: String,
    senderProfileName: String,

    // Extracted Data from Workflow
    extractedData: {
      name: String,
      mobileNumber: String,
      email: String,
      customAnswers: mongoose.Schema.Types.Mixed, // { questionId: answer, ... }
    },

    // Workflow Progress
    currentQuestionIndex: {
      type: Number,
      default: -1, // -1 = not started, waiting for trigger keyword
    },
    completedQuestions: [Number], // Array of completed question indexes
    
    // Responses
    answers: [
      {
        questionId: String,
        questionText: String,
        questionType: {
          type: String,
          enum: ["text", "choice", "multiselect"],
        },
        answer: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
        timestamp: {
          type: Date,
          default: Date.now,
        },
        crmFieldName: String, // Which CRM field this maps to
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["triggered", "in_progress", "completed", "abandoned"],
      default: "triggered",
      index: true,
    },

    // Tracking
    startedAt: Date,
    completedAt: Date,
    abandonedAt: Date,
    
    // CRM Lead Created
    crmLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead", // Link to CRM Lead
      default: null,
    },
    leadCreatedAt: Date,

    // Metadata
    isAutomationGenerated: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: "whatsapp_automation",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workflowConversationSchema.index({ tenantId: 1, status: 1 });
workflowConversationSchema.index({ workflowId: 1, status: 1 });
workflowConversationSchema.index({ conversationId: 1 });
workflowConversationSchema.index({ senderPhone: 1, tenantId: 1 });
workflowConversationSchema.index({ crmLeadId: 1 });
workflowConversationSchema.index({ status: 1, completedAt: -1 });

const WorkflowConversation =
  mongoose.models.WorkflowConversation ||
  mongoose.model("WorkflowConversation", workflowConversationSchema);

export default WorkflowConversation;
