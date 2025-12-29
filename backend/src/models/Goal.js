/**
 * Goal Model for Phase 2 Analytics
 * Tracks conversion goals (e.g., trial signup, payment, email verification)
 * 
 * Enro Matics © 2025
 */

import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    // Goal identification
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
      // e.g., "trial-signup", "email-verified", "payment-completed"
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Goal type - how to track it
    type: {
      type: String,
      enum: ["page_view", "event", "form_submit", "scroll_depth", "time_on_page"],
      default: "event"
    },

    // For page_view type
    targetPage: {
      type: String,
      // e.g., "/trial-success", "/payment-success"
    },

    // For event type (custom events)
    eventName: {
      type: String,
      // e.g., "trial_signup_completed", "payment_received"
    },

    // For form_submit type
    formSelector: {
      type: String,
      // CSS selector for form element
    },

    // For scroll_depth type
    scrollDepthThreshold: {
      type: Number,
      min: 1,
      max: 100
    },

    // For time_on_page type
    timeThresholdSeconds: {
      type: Number,
      min: 1
    },

    // Goal value/weight
    value: {
      type: Number,
      default: 1
      // e.g., value of signup = 1, value of payment = 999
    },

    // Revenue associated (if applicable)
    revenue: {
      type: Number,
      default: 0
      // e.g., ₹999 for annual subscription
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },

    // Tracking metrics
    totalConversions: {
      type: Number,
      default: 0
    },

    totalConversionValue: {
      type: Number,
      default: 0
    },

    conversionRate: {
      type: Number,
      default: 0
      // percentage: (totalConversions / totalSessions) * 100
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Indexes
GoalSchema.index({ name: 1 });
GoalSchema.index({ type: 1 });
GoalSchema.index({ isActive: 1 });
GoalSchema.index({ createdAt: -1 });

const Goal = mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
export default Goal;
