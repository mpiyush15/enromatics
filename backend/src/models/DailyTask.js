import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const dailyTaskSchema = new mongoose.Schema(
  {
    // User who created the task
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Tenant (Super Admin scope)
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Task title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Task description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Due date (YYYY-MM-DD)
    date: {
      type: String,
      required: true,
      index: true,
    },

    // Time (HH:mm format)
    time: {
      type: String,
      default: null,
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // Task status
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    // When task was completed
    completedAt: {
      type: Date,
      default: null,
    },

    // When task was cancelled
    cancelledAt: {
      type: Date,
      default: null,
    },

    // Cancellation reason
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
dailyTaskSchema.index({ userId: 1, date: 1 });
dailyTaskSchema.index({ tenantId: 1, date: 1, status: 1 });
dailyTaskSchema.index({ userId: 1, status: 1 });

export default mongoose.model("DailyTask", dailyTaskSchema);
