import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
      enum: ["Trial", "Basic", "Pro", "Enterprise"],
    },
    id: {
      type: String,
      required: [true, "Plan ID is required"],
      unique: true,
      lowercase: true,
      enum: ["trial", "basic", "pro", "enterprise"],
    },
    description: {
      type: String,
      required: [true, "Plan description is required"],
    },

    // Pricing
    monthlyPrice: {
      type: mongoose.Schema.Types.Mixed,
      default: 0, // Can be number or "Free" or "Custom"
    },
    annualPrice: {
      type: mongoose.Schema.Types.Mixed,
      default: 0, // Can be number or "Free" or "Custom"
    },

    // Quotas
    quotas: {
      students: mongoose.Schema.Types.Mixed, // number or "Unlimited" or "Trial Access"
      staff: mongoose.Schema.Types.Mixed, // number or "Unlimited" or "Trial Access"
      storage: {
        type: String,
        default: "Standard", // Standard, Enhanced, Unlimited
      },
      concurrentTests: {
        type: Number,
        default: 1,
      },
    },

    // Features - Can be strings OR objects with {name, enabled}
    // String format: ["Feature A", "Feature B"] (old)
    // Object format: [{name: "Feature A", enabled: true}] (new - toggleable)
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    highlightFeatures: [
      {
        type: String,
      },
    ],

    // UI Settings
    buttonLabel: {
      type: String,
      default: "Get Started",
    },
    popular: {
      type: Boolean,
      default: false,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
subscriptionPlanSchema.index({ id: 1 });
subscriptionPlanSchema.index({ status: 1 });
subscriptionPlanSchema.index({ name: 1 });

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
