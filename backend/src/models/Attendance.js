import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    tenantId: { 
      type: String, 
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },
    date: { 
      type: Date, 
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "present"
    },
    remarks: {
      type: String,
      default: ""
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }, 
  { timestamps: true }
);

// Compound index to ensure one attendance record per student per date
attendanceSchema.index({ tenantId: 1, studentId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
