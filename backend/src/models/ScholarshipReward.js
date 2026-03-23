import mongoose from 'mongoose';
import ENUMS from '../config/ENUMS_CONSTANTS.js';

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
      enum: ENUMS.SCHOLARSHIP_REWARD_TYPE,
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    rewardDescription: String,
    status: {
      type: String,
      enum: ENUMS.SCHOLARSHIP_APPROVAL_STATUS,
      default: 'pending',
      index: true,
    },
    approvedBy: String,
    approvedAt: Date,
    rejectedReason: String,
    disbursedAt: Date,
    disbursedVia: {
      type: String,
      enum: ENUMS.SCHOLARSHIP_DISBURSAL_METHOD,
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
