import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['mcq', 'short-answer', 'essay'],
      default: 'mcq',
    },
    options: [
      {
        id: String,
        text: String,
        isCorrect: Boolean,
      },
    ],
    correctAnswer: String, // For short answer/essay
    explanation: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    marks: {
      type: Number,
      default: 1,
    },
    imageUrl: String, // For image-based questions
    source: {
      type: String,
      enum: ['manual', 'ai-generated'],
      default: 'manual',
    },
    generatedBy: {
      userId: String,
      timestamp: Date,
      model: String, // e.g., "gpt-4o-mini"
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
questionSchema.index({ tenantId: 1, chapterId: 1 });
questionSchema.index({ tenantId: 1, difficulty: 1 });
questionSchema.index({ tenantId: 1, source: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
