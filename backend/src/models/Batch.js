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

    // Course ID - Optional link to a course
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
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

// Foreign key validation: Ensure tenantId exists in Tenant collection
batchSchema.pre("save", async function (next) {
  if (!this.tenantId) {
    return next(new Error("tenantId is required"));
  }

  // Check if tenant exists (only on insert or if tenantId is modified)
  if (this.isNew || this.isModified("tenantId")) {
    const { default: Tenant } = await import('./Tenant.js');
    const tenant = await Tenant.findOne({ tenantId: this.tenantId });
    
    if (!tenant) {
      return next(new Error(`Invalid tenantId: Tenant "${this.tenantId}" does not exist`));
    }
  }

  next();
});

// Compound index for tenant + name (prevent duplicate batch names per tenant)
batchSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Batch = mongoose.models.Batch || mongoose.model("Batch", batchSchema);

export default Batch;
