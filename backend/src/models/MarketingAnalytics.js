import mongoose from "mongoose";

const marketingAnalyticsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketingCampaign",
      required: true,
    },

    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketingSubscriber",
    },

    email: String,

    eventType: {
      type: String,
      enum: ["sent", "open", "click", "bounce", "complaint", "conversion"],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    clickedLink: String,

    ipAddress: String,

    userAgent: String,

    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
    },
  },
  { timestamps: true }
);

// Compound indexes for queries
marketingAnalyticsSchema.index({ tenantId: 1, campaignId: 1 });
marketingAnalyticsSchema.index({ tenantId: 1, eventType: 1 });
marketingAnalyticsSchema.index({ tenantId: 1, subscriberId: 1 });

export default mongoose.model("MarketingAnalytics", marketingAnalyticsSchema);
