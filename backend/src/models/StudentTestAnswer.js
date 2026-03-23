import mongoose from 'mongoose';
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const studentTestAnswerSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestQuestion',
      required: true,
    },
    questionNumber: Number,
    studentAnswer: String, // Student's answer: 'a'/'b' for MCQ, text for subjective
    isCorrect: {
      type: Boolean,
      default: null, // null means not yet evaluated (for subjective questions)
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    totalMarks: Number,
    // For subjective/manual evaluation
    evaluationStatus: {
      type: String,
      enum: ENUMS.STUDENT_TEST_ANSWER_STATUS,
      default: 'auto-evaluated',
    },
    evaluatedBy: mongoose.Schema.Types.ObjectId, // Teacher/Evaluator ID
    evaluatedAt: Date,
    evaluatorComment: String,
    // Timeline
    answeredAt: {
      type: Date,
      default: Date.now,
    },
    timeSpentSeconds: Number, // Time student spent on this question
  },
  {
    timestamps: true,
  }
);

// Indexes
studentTestAnswerSchema.index({ tenantId: 1, testId: 1, studentId: 1 });
studentTestAnswerSchema.index({ testId: 1, studentId: 1 });
studentTestAnswerSchema.index({ evaluationStatus: 1, tenantId: 1 });

export default mongoose.model('StudentTestAnswer', studentTestAnswerSchema);
