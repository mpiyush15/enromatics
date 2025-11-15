import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    testType: {
      type: String,
      enum: ["Unit Test", "Mid Term", "Final Exam", "Practice Test", "Assignment", "Quiz", "Other"],
      default: "Unit Test",
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
testSchema.index({ tenantId: 1, testDate: -1 });
testSchema.index({ tenantId: 1, course: 1, batch: 1 });

const Test = mongoose.model("Test", testSchema);

export default Test;
