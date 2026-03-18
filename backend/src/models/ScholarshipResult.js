import mongoose from 'mongoose';

const scholarshipResultSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    examId: {
      type: String,
      required: true,
      index: true,
    },
    examName: String,
    examCode: String,
    registrationNumber: {
      type: String,
      required: true,
      index: true,
    },
    studentId: String,
    studentName: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    currentClass: String,
    school: String,
    marksObtained: {
      type: Number,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    rank: Number,
    result: {
      type: String,
      enum: ['pass', 'fail'],
      required: true,
    },
    // Reward eligibility based on percentage or rank
    rewardEligible: {
      type: Boolean,
      default: false,
    },
    rewardDetails: {
      type: {
        type: String,
        enum: ['Merit Scholarship', 'Excellence Award', 'Participation Certificate'],
      },
      amount: Number,
      description: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant and exam
scholarshipResultSchema.index({ tenantId: 1, examId: 1 });
// Index for searching by registration number
scholarshipResultSchema.index({ tenantId: 1, registrationNumber: 1 });
// Index for reward eligibility queries
scholarshipResultSchema.index({ tenantId: 1, rewardEligible: 1 });

export default mongoose.model('ScholarshipResult', scholarshipResultSchema);
