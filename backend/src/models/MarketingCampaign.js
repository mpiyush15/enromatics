import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const marketingCampaignSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["email", "sms", "whatsapp", "push"],
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "scheduled", "running", "completed", "paused", "failed"],
      default: "draft",
    },

    audience: {
      type: String,
      enum: ["all", "segment", "custom"],
      default: "all",
    },

    segmentId: mongoose.Schema.Types.ObjectId,

    scheduledAt: Date,

    startedAt: Date,

    endedAt: Date,

    template: mongoose.Schema.Types.ObjectId,

    templateType: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
    },

    recipientCount: {
      type: Number,
      default: 0,
    },

    sentCount: {
      type: Number,
      default: 0,
    },

    openCount: {
      type: Number,
      default: 0,
    },

    clickCount: {
      type: Number,
      default: 0,
    },

    conversionCount: {
      type: Number,
      default: 0,
    },

    metrics: {
      openRate: { type: Number, default: 0 },
      clickRate: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
    },

    createdBy: {
      type: String,
      required: true,
    },

    content: {
      subject: String,
      body: String,
      cta: String,
    },
  },
  { timestamps: true }
);

// Compound index for tenant isolation
marketingCampaignSchema.index({ tenantId: 1, status: 1 });
marketingCampaignSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model("MarketingCampaign", marketingCampaignSchema);
