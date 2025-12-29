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
      enum: ["direct", "google", "facebook", "instagram", "linkedin", "twitter", "email", "meta", "fb", "ig", "paid", "other"],
      default: "direct",
    },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },

    // Session Tracking
    isNewSession: { type: Boolean, default: true },
    sessionStart: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds

    // Phase 1: Engagement Metrics
    bounced: { 
      type: Boolean, 
      default: false // true if user leaves without interaction in 30 sec
    },
    interactions: { 
      type: Number, 
      default: 0 // count of clicks, scrolls, inputs
    },
    scrollDepth: { 
      type: Number, 
      default: 0, // 0-100 percentage of page scrolled
      min: 0,
      max: 100
    },
    timeOnPage: { 
      type: Number, 
      default: 0 // seconds spent on this specific page
    },
    entryPage: { 
      type: Boolean, 
      default: false // true if first page in session
    },
    exitPage: { 
      type: Boolean, 
      default: false // true if last page in session
    },
    
    // Phase 2: Goal & Event Tracking (Pre-added for future use)
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    eventType: { 
      type: String, 
      enum: ["pageview", "click", "form_submit", "video_play", "download", "custom"]
    },
    eventMetadata: { type: mongoose.Schema.Types.Mixed }, // Flexible for custom data

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
