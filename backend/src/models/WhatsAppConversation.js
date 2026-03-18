import mongoose from 'mongoose';

const whatsappConversationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    // ReplySys conversation ID
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Contact/Student phone number
    contactPhone: {
      type: String,
      required: true,
      index: true,
    },
    contactName: String,
    // Reference to Student if linked
    studentId: {
      type: String,
      index: true,
    },
    // Last message details
    lastMessage: String,
    lastMessageTime: Date,
    lastReadMessageId: String,
    lastReadTime: Date,
    // Conversation state
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
    },
    // Message count
    messageCount: {
      type: Number,
      default: 0,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    // Contact profile info
    profilePictureUrl: String,
    // Metadata
    source: {
      type: String,
      default: 'whatsapp',
    },
    tags: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
whatsappConversationSchema.index({ tenantId: 1, conversationId: 1 });
whatsappConversationSchema.index({ tenantId: 1, contactPhone: 1 });
whatsappConversationSchema.index({ tenantId: 1, studentId: 1 });
whatsappConversationSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model('WhatsAppConversation', whatsappConversationSchema);
