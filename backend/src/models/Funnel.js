/**
 * Funnel Model for Phase 2 Analytics
 * Tracks multi-step conversion funnels (e.g., Landing → Signup → Email Verify → Payment)
 * 
 * Enro Matics © 2025
 */

import mongoose from "mongoose";

const FunnelSchema = new mongoose.Schema(
  {
    // Funnel identification
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
      // e.g., "Trial Signup Funnel", "Annual Subscription Flow"
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Funnel steps (ordered)
    steps: [
      {
        _id: false,
        stepNumber: {
          type: Number,
          required: true
        },

        name: {
          type: String,
          required: true
          // e.g., "Landing Page", "Signup Click", "Email Verification", "Payment"
        },

        description: {
          type: String
        },

        // How to track this step
        type: {
          type: String,
          enum: ["page_view", "event", "form_submit", "scroll_depth"],
          default: "page_view"
        },

        // For page_view tracking
        pageUrl: {
          type: String
          // e.g., "/pricing", "/signup"
        },

        // For event tracking
        eventName: {
          type: String
          // e.g., "signup_clicked", "payment_completed"
        },

        // For form_submit tracking
        formSelector: {
          type: String
        },

        // Metrics for this step
        uniqueVisitors: {
          type: Number,
          default: 0
        },

        completions: {
          type: Number,
          default: 0
        },

        conversionRate: {
          type: Number,
          default: 0
          // percentage from previous step
        },

        avgTimeOnStep: {
          type: Number,
          default: 0
          // seconds
        }
      }
    ],

    // Overall funnel metrics
    totalEntrants: {
      type: Number,
      default: 0
      // Users who reached step 1
    },

    totalCompleters: {
      type: Number,
      default: 0
      // Users who completed all steps
    },

    overallConversionRate: {
      type: Number,
      default: 0
      // percentage: (totalCompleters / totalEntrants) * 100
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
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
FunnelSchema.index({ name: 1 });
FunnelSchema.index({ isActive: 1 });
FunnelSchema.index({ createdAt: -1 });

const Funnel = mongoose.models.Funnel || mongoose.model("Funnel", FunnelSchema);
export default Funnel;
