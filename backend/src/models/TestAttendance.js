import mongoose from "mongoose";

const testAttendanceSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    tenantId: {
      type: String,
      ref: "Tenant",
      required: true,
      index: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per student per test
testAttendanceSchema.index({ testId: 1, studentId: 1 }, { unique: true });

const TestAttendance = mongoose.model("TestAttendance", testAttendanceSchema);

export default TestAttendance;
