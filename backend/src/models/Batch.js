import mongoose from "mongoose";

/**
 * Batch Schema
 * Represents a batch/class group in a coaching institute
 * Used for grouping students for admission, attendance, and academics
 */

const batchSchema = new mongoose.Schema(
  {
    // Tenant ID - Links batch to specific institute
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Batch name (e.g., "Batch 2024", "Morning Batch", "JEE Advanced")
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Batch description (optional)
    description: {
      type: String,
      trim: true,
      default: null,
    },

    // Start date of the batch
    startDate: {
      type: Date,
      default: null,
    },

    // End date of the batch
    endDate: {
      type: Date,
      default: null,
    },

    // Batch status
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },

    // Maximum students allowed in this batch
    capacity: {
      type: Number,
      default: null,
    },

    // Current number of students enrolled
    enrolledCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for tenant + name (prevent duplicate batch names per tenant)
batchSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Batch = mongoose.models.Batch || mongoose.model("Batch", batchSchema);

export default Batch;
