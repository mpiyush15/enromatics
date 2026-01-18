import mongoose from "mongoose";

const marketingSubscriberSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: String,

    name: String,

    status: {
      type: String,
      enum: ["subscribed", "unsubscribed", "bounced", "complained"],
      default: "subscribed",
    },

    source: {
      type: String,
      enum: ["import", "form", "api", "signup"],
      default: "import",
    },

    segments: [String],

    tags: [String],

    customFields: mongoose.Schema.Types.Mixed,

    subscriptionDate: {
      type: Date,
      default: Date.now,
    },

    unsubscriptionDate: Date,

    lastEngagedAt: Date,

    campaignHistory: [
      {
        campaignId: mongoose.Schema.Types.ObjectId,
        status: {
          type: String,
          enum: ["sent", "opened", "clicked", "converted", "bounced"],
        },
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

// Compound index for tenant isolation
marketingSubscriberSchema.index({ tenantId: 1, email: 1 }, { unique: true });
marketingSubscriberSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model("MarketingSubscriber", marketingSubscriberSchema);
