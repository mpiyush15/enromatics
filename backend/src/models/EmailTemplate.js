import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const emailTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    templateName: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    htmlBody: String,

    previewText: String,

    fromName: String,

    fromEmail: String,

    replyTo: String,

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    variables: [String],

    createdBy: String,

    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for tenant isolation
emailTemplateSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model("EmailTemplate", emailTemplateSchema);
