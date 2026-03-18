import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'document', 'notes', 'presentation'],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
      enum: ['mathematics', 'science', 'english', 'hindi', 'social-studies', 'general'],
    },
    chapter: String,
    // File/Content details
    fileUrl: String,
    fileName: String,
    fileSizeBytes: Number,
    fileType: String, // video/mp4, application/pdf, etc
    // For video content
    duration: Number, // Duration in seconds for videos
    thumbnailUrl: String,
    videoQuality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p'],
      default: '720p',
    },
    // Sharing configuration
    sharedWith: [
      {
        batchId: mongoose.Schema.Types.ObjectId,
        className: String,
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ['private', 'class-only', 'batch-wise', 'public'],
      default: 'batch-wise',
    },
    // Access control
    requiresPassword: {
      type: Boolean,
      default: false,
    },
    accessPassword: String,
    // Engagement metrics
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
studyMaterialSchema.index({ tenantId: 1, subject: 1, contentType: 1 });
studyMaterialSchema.index({ 'sharedWith.batchId': 1 });
studyMaterialSchema.index({ createdBy: 1 });
studyMaterialSchema.index({ isActive: 1 });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
