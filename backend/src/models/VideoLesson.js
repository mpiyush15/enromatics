import mongoose from 'mongoose';

const videoLessonSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    thumbnailUrl: String,
    notes: {
      type: String,
      default: '',
    },
    transcription: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    createdBy: {
      type: String,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
videoLessonSchema.index({ tenantId: 1, chapterId: 1 });
videoLessonSchema.index({ tenantId: 1, subjectId: 1 });
videoLessonSchema.index({ tenantId: 1, status: 1 });

const VideoLesson = mongoose.model('VideoLesson', videoLessonSchema);

export default VideoLesson;
