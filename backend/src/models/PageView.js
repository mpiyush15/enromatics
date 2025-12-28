// models/PageView.js
import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    // Page Info
    page: {
      type: String,
      required: true,
      index: true,
    },
    path: { type: String }, // Full URL path

    // Visitor Info
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    ip: { type: String },
    
    // Device & Browser
    userAgent: { type: String },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    browser: { type: String },
    os: { type: String },

    // Traffic Source
    referrer: { type: String },
    source: {
      type: String,
      enum: ["direct", "google", "facebook", "instagram", "linkedin", "twitter", "email", "other"],
      default: "direct",
    },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },

    // Session Tracking
    isNewSession: { type: Boolean, default: true },
    sessionStart: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds

    // Geo (optional - can add later)
    country: { type: String },
    city: { type: String },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes for common queries
pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ page: 1, createdAt: -1 });
pageViewSchema.index({ sessionId: 1, createdAt: -1 });
pageViewSchema.index({ source: 1, createdAt: -1 });

// TTL Index - Auto-delete after 90 days to save storage
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const PageView = mongoose.models.PageView || mongoose.model("PageView", pageViewSchema);
export default PageView;
