// models/Lead.js
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Basic Info
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    
    // Lead Source
    source: {
      type: String,
      enum: ["website", "whatsapp", "walk-in", "facebook", "instagram", "referral", "scholarship-exam", "phone-call", "other"],
      default: "other",
    },
    sourceDetails: { type: String }, // e.g., "Facebook Ad Campaign March 2025"

    // Interest
    interestedCourse: { type: String },
    interestedBatch: { type: String },
    
    // Pipeline Status
    status: {
      type: String,
      enum: ["new", "contacted", "interested", "follow-up", "negotiation", "converted", "lost"],
      default: "new",
      index: true,
    },
    lostReason: { type: String }, // Only if status is "lost"

    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
    assignedAt: { type: Date },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // Call Tracking
    lastCallDate: { type: Date },
    totalCalls: { type: Number, default: 0 },
    lastCallOutcome: {
      type: String,
      enum: ["interested", "callback", "not-interested", "no-answer", "busy", "wrong-number", null],
    },

    // Follow-up
    nextFollowUpDate: { type: Date, index: true },
    followUpNotes: { type: String },
    missedFollowUps: { type: Number, default: 0 },

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Notes & Tags
    notes: { type: String },
    tags: [{ type: String }],

    // Conversion Tracking
    convertedToStudent: { type: Boolean, default: false },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    conversionDate: { type: Date },
    expectedFees: { type: Number },
    actualFees: { type: Number },

    // Additional Info
    address: { type: String },
    city: { type: String },
    qualification: { type: String },
    dateOfBirth: { type: Date },
    parentName: { type: String },
    parentPhone: { type: String },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Indexes for common queries
leadSchema.index({ tenantId: 1, status: 1 });
leadSchema.index({ tenantId: 1, assignedTo: 1 });
leadSchema.index({ tenantId: 1, nextFollowUpDate: 1 });
leadSchema.index({ tenantId: 1, source: 1 });
leadSchema.index({ tenantId: 1, createdAt: -1 });

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default Lead;
