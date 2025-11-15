import mongoose from "mongoose";

const testMarksSchema = new mongoose.Schema(
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
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      trim: true,
    },
    percentage: {
      type: Number,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enteredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one marks record per student per test
testMarksSchema.index({ testId: 1, studentId: 1 }, { unique: true });

// Pre-save middleware to calculate percentage, grade, and pass status
testMarksSchema.pre("save", async function (next) {
  if (this.isModified("marksObtained") || this.isNew) {
    try {
      const Test = mongoose.model("Test");
      const test = await Test.findById(this.testId);
      
      if (test) {
        // Calculate percentage
        this.percentage = (this.marksObtained / test.totalMarks) * 100;
        
        // Determine pass/fail
        this.passed = this.marksObtained >= test.passingMarks;
        
        // Calculate grade
        if (this.percentage >= 90) {
          this.grade = "A+";
        } else if (this.percentage >= 80) {
          this.grade = "A";
        } else if (this.percentage >= 70) {
          this.grade = "B+";
        } else if (this.percentage >= 60) {
          this.grade = "B";
        } else if (this.percentage >= 50) {
          this.grade = "C";
        } else if (this.percentage >= 40) {
          this.grade = "D";
        } else {
          this.grade = "F";
        }
      }
    } catch (err) {
      console.error("Error calculating marks:", err);
    }
  }
  next();
});

const TestMarks = mongoose.model("TestMarks", testMarksSchema);

export default TestMarks;
