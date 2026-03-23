// models/CallLog.js
import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const callLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    // Who made the call
    counsellorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    counsellorName: { type: String }, // Denormalized for quick access

    // Call Details
    callDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    callDuration: {
      type: Number, // in seconds
      default: 0,
    },
    callType: {
      type: String,
      enum: ENUMS.CALL_TYPE,
      default: "outbound",
    },

    // Outcome
    outcome: {
      type: String,
      enum: ENUMS.CALL_OUTCOME,
      required: true,
    },

    // Notes
    notes: { type: String },
    
    // Call Quality Rating (1-5 stars)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    
    // Status change (if status was updated during this call)
    previousStatus: { type: String },
    newStatus: { type: String },

    // Follow-up scheduling
    nextFollowUpDate: { type: Date },
    nextFollowUpNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
callLogSchema.index({ tenantId: 1, leadId: 1 });
callLogSchema.index({ tenantId: 1, counsellorId: 1 });
callLogSchema.index({ tenantId: 1, callDate: -1 });
callLogSchema.index({ tenantId: 1, outcome: 1 });

const CallLog = mongoose.models.CallLog || mongoose.model("CallLog", callLogSchema);
export default CallLog;
