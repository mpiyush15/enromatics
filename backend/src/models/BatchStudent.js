import mongoose from "mongoose";

/**
 * BatchStudent Schema
 * 
 * Manages the many-to-many relationship between Students and Batches.
 * A student can be in multiple batches (theory, lab, test, etc.)
 * A batch can have many students.
 * 
 * REPLACES the simple batchId field in Student collection.
 */

const batchStudentSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Student reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // Batch reference
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    // Status of the student in this batch
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "removed"],
      default: "active",
      index: true,
    },

    // When was student added to this batch
    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // When was student removed from this batch (if ever)
    removedAt: {
      type: Date,
      default: null,
    },

    // Optional: Notes about student in this batch
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
batchStudentSchema.index({ tenantId: 1, batchId: 1 }); // Find students in a batch
batchStudentSchema.index({ tenantId: 1, studentId: 1 }); // Find batches for a student
batchStudentSchema.index({ tenantId: 1, batchId: 1, status: 1 }); // Find active students in batch
batchStudentSchema.index({ tenantId: 1, studentId: 1, status: 1 }); // Find active batches for student

// Unique constraint: A student can only be in a batch once (but can have different statuses over time)
batchStudentSchema.index(
  { tenantId: 1, studentId: 1, batchId: 1 },
  { unique: true }
);

export default mongoose.model(
  "BatchStudent",
  batchStudentSchema,
  "batch_students"
);
