import mongoose from "mongoose";

/**
 * WhatsApp Template Schema
 * Stores WhatsApp message templates for each tenant
 * These templates can be used for broadcasts, bulk messaging, or automation
 */

const whatsappTemplateSchema = new mongoose.Schema(
  {
    // Tenant identifier
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Template ID from WhatsApp Platform
    templateId: {
      type: String,
      default: null,
      index: true,
    },

    // Template name
    templateName: {
      type: String,
      required: true,
    },

    // Template body/message content
    templateBody: {
      type: String,
      required: true,
    },

    // Template category (MARKETING, UTILITY, AUTHENTICATION, etc.)
    category: {
      type: String,
      enum: ["MARKETING", "UTILITY", "AUTHENTICATION"],
      default: "MARKETING",
    },

    // Language code (en, hi, es, etc.)
    language: {
      type: String,
      default: "en",
    },

    // Approval status from WhatsApp Platform
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },

    // Variables/placeholders in the template
    variables: {
      type: [String],
      default: [],
    },

    // Rejection reason (if rejected)
    rejectionReason: {
      type: String,
      default: null,
    },

    // Whether this is a local template (not yet synced to WhatsApp)
    isLocalOnly: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create compound index for tenant + template name
whatsappTemplateSchema.index({ tenantId: 1, templateName: 1 });

// Model creation
const WhatsAppTemplate =
  mongoose.models.WhatsAppTemplate ||
  mongoose.model("WhatsAppTemplate", whatsappTemplateSchema);

export default WhatsAppTemplate;
