import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for tenant + subject queries
chapterSchema.index({ tenantId: 1, subjectId: 1 });
chapterSchema.index({ tenantId: 1, status: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);

export default Chapter;
