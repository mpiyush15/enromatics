import mongoose from 'mongoose';

const testQuestionSchema = new mongoose.Schema(
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
    questionNumber: {
      type: Number,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['mcq', 'subjective', 'numeric', 'true_false', 'fill_blank'],
      default: 'mcq',
    },
    question: {
      type: String,
      required: true,
    },
    // For MCQ, True/False, Fill Blank
    options: [
      {
        id: String,
        text: String,
        isCorrect: Boolean,
      },
    ],
    // For all question types
    correctAnswer: String, // For subjective: answer key text; for numeric: the number; for MCQ: 'a'/'b'/etc
    correctAnswerOptions: [String], // For subjective: array of acceptable answers
    explanation: String,
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    // For subjective/numeric questions
    answerFormat: String, // 'text', 'number', 'equation', 'short_answer'
    acceptableVariance: Number, // For numeric: acceptable error margin
    maxChars: {
      type: Number,
      default: 500,
    },
    // Ordering
    displayOrder: Number,
    // Question metadata
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    source: {
      type: String,
      enum: ['manual', 'ai-generated', 'imported'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
testQuestionSchema.index({ tenantId: 1, testId: 1 });
testQuestionSchema.index({ testId: 1, questionNumber: 1 });

export default mongoose.model('TestQuestion', testQuestionSchema);
