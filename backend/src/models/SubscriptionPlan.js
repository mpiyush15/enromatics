import mongoose from "mongoose";

/**
 * SUBSCRIPTION PLAN SCHEMA
 * ========================
 * This schema matches the frontend types in /types/subscription-plan.ts
 * 
 * Fields:
 * - id: Plan slug (trial, basic, pro, enterprise)
 * - name: Display name
 * - monthlyPrice/annualPrice: Number or "Free" or "Custom"
 * - features: Array of strings OR {name, enabled} objects
 * - isVisible: Controls public /plans page visibility
 * - status: active/inactive/archived
 */

const subscriptionPlanSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      enum: ["Trial", "Basic", "Pro", "Enterprise"],
    },
    id: {
      type: String,
      required: [true, "Plan ID is required"],
      lowercase: true,
      enum: ["trial", "basic", "pro", "enterprise"],
    },
    description: {
      type: String,
      required: [true, "Plan description is required"],
    },

    // Pricing - Mixed type allows Number, "Free", or "Custom"
    monthlyPrice: {
      type: mongoose.Schema.Types.Mixed,
      default: 0,
    },
    annualPrice: {
      type: mongoose.Schema.Types.Mixed,
      default: 0,
    },

    // Quotas
    quotas: {
      students: mongoose.Schema.Types.Mixed, // number or "Unlimited" or "Trial Access"
      staff: mongoose.Schema.Types.Mixed,    // number or "Unlimited" or "Trial Access"
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
    // String format: ["Feature A", "Feature B"] (legacy)
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
    displayOrder: {
      type: Number,
      default: 0,
    },
    cta: {
      type: String,
      default: "",
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

    // Metadata - Optional (plans can be seeded without user)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
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

// Create compound unique index for id and name
// Using schema.index() only - no duplicate "unique: true" in field definition
subscriptionPlanSchema.index({ id: 1 }, { unique: true });
subscriptionPlanSchema.index({ name: 1 }, { unique: true });
subscriptionPlanSchema.index({ status: 1 });
subscriptionPlanSchema.index({ isVisible: 1 });
subscriptionPlanSchema.index({ displayOrder: 1 });

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
