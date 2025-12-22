import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: String, // e.g., "6 months", "1 year"
      trim: true,
    },
    fees: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index for tenant-specific course name uniqueness
CourseSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Course = mongoose.model("Course", CourseSchema);

export default Course;
