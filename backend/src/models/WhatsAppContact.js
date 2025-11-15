import mongoose from 'mongoose';

const whatsAppContactSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['student', 'parent', 'guardian', 'other'],
    default: 'student'
  },
  isOptedIn: {
    type: Boolean,
    default: true
  },
  lastMessageAt: Date,
  messageCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  metadata: {
    class: String,
    section: String,
    rollNumber: String,
    parentName: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Indexes
whatsAppContactSchema.index({ tenantId: 1, whatsappNumber: 1 }, { unique: true });
whatsAppContactSchema.index({ tenantId: 1, studentId: 1 });
whatsAppContactSchema.index({ tenantId: 1, type: 1 });

export default mongoose.model('WhatsAppContact', whatsAppContactSchema);
