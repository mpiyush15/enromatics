import mongoose from "mongoose";

/**
 * WhatsApp Event Log Schema
 * Tracks all WhatsApp messages sent for events (absence, payment, results)
 */

const whatsappEventLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    studentName: {
      type: String,
    },

    studentPhone: {
      type: String,
      required: true,
    },

    eventType: {
      type: String,
      enum: ["absence", "payment", "result"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },

    sentAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    error: {
      type: String,
    },

    retryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
whatsappEventLogSchema.index({ tenantId: 1, eventType: 1 });
whatsappEventLogSchema.index({ tenantId: 1, studentId: 1 });
whatsappEventLogSchema.index({ tenantId: 1, createdAt: -1 });

const WhatsAppEventLog = mongoose.model("WhatsAppEventLog", whatsappEventLogSchema);

export default WhatsAppEventLog;
