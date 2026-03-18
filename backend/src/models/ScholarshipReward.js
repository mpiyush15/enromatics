import mongoose from 'mongoose';

const scholarshipRewardSchema = new mongoose.Schema(
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
    examDate: Date,
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    registrationNumber: String,
    email: String,
    phone: String,
    currentClass: String,
    school: String,
    marksObtained: Number,
    maxMarks: Number,
    percentage: Number,
    rank: Number,
    rewardType: {
      type: String,
      enum: ['Merit Scholarship', 'Excellence Award', 'Participation Certificate', 'Other'],
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    rewardDescription: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disbursed'],
      default: 'pending',
      index: true,
    },
    approvedBy: String,
    approvedAt: Date,
    rejectedReason: String,
    disbursedAt: Date,
    disbursedVia: {
      type: String,
      enum: ['bank_transfer', 'check', 'cash', 'other'],
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant and exam
scholarshipRewardSchema.index({ tenantId: 1, examId: 1 });
// Index for status tracking
scholarshipRewardSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model('ScholarshipReward', scholarshipRewardSchema);
