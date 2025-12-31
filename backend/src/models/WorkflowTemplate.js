import mongoose from "mongoose";

const workflowTemplateSchema = new mongoose.Schema(
  {
    // Template Info
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "📋", // Emoji or icon identifier
    },
    type: {
      type: String,
      enum: ["admission", "demo", "inquiry", "lead", "custom"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["education", "ecommerce", "saas", "service", "healthcare", "real-estate", "custom"],
      default: "custom",
    },

    // Template Questions
    questions: [
      {
        id: String,
        order: Number,
        text: String,
        description: String,
        type: {
          type: String,
          enum: ["text", "choice", "multiselect"],
          default: "text",
        },
        options: [String],
        isRequired: {
          type: Boolean,
          default: true,
        },
        isNameField: {
          type: Boolean,
          default: false,
        },
        isMobileField: {
          type: Boolean,
          default: false,
        },
        crmFieldName: String,
        placeholder: String,
        helpText: String,
      },
    ],

    // Default Messages
    initialMessage: String,
    completionMessage: String,
    skipMessage: String,
    triggerKeyword: {
      type: String,
      default: "hi",
    },

    // Metadata
    isPublic: {
      type: Boolean,
      default: false, // SuperAdmin creates public templates
    },
    createdBy: {
      type: String, // "SuperAdmin" or tenantId
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0, // How many tenants have used this template
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workflowTemplateSchema.index({ type: 1, isPublic: 1 });
workflowTemplateSchema.index({ category: 1, status: 1 });
workflowTemplateSchema.index({ createdBy: 1, status: 1 });
workflowTemplateSchema.index({ createdAt: -1 });

const WorkflowTemplate =
  mongoose.models.WorkflowTemplate ||
  mongoose.model("WorkflowTemplate", workflowTemplateSchema);

export default WorkflowTemplate;
