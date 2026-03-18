import mongoose from 'mongoose';

const studentMaterialProgressSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true,
      index: true,
    },
    // Progress tracking
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    totalWatchedSeconds: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Download history
    downloadedAt: Date,
    isDownloaded: {
      type: Boolean,
      default: false,
    },
    // Timestamps for analytics
    firstViewedAt: Date,
    lastViewedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
studentMaterialProgressSchema.index({ tenantId: 1, studentId: 1 });
studentMaterialProgressSchema.index({ studentId: 1, status: 1 });
studentMaterialProgressSchema.index({ materialId: 1, status: 1 });

export default mongoose.model('StudentMaterialProgress', studentMaterialProgressSchema);
