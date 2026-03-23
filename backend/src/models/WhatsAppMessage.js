import mongoose from 'mongoose';
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const whatsappMessageSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    // ReplySys IDs
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Message content
    messageText: String,
    messageType: {
      type: String,
      enum: ENUMS.WHATSAPP_MESSAGE_TYPE,
      default: 'text',
    },
    // Direction: 'inbound' (from customer) or 'outbound' (from business)
    direction: {
      type: String,
      enum: ENUMS.WHATSAPP_MESSAGE_DIRECTION,
      required: true,
      index: true,
    },
    // Sender/recipient phone
    senderPhone: String,
    senderName: String,
    recipientPhone: String,
    // References
    studentId: String,
    // Message status
    status: {
      type: String,
      enum: ENUMS.WHATSAPP_MESSAGE_STATUS,
      default: 'sent',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    failureReason: String,
    // Media (if applicable)
    mediaUrl: String,
    mediaType: String,
    mediaSize: Number,
    // Metadata
    sourceUrl: String, // Media source
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Webhook data
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
whatsappMessageSchema.index({ tenantId: 1, conversationId: 1 });
whatsappMessageSchema.index({ tenantId: 1, messageId: 1 });
whatsappMessageSchema.index({ tenantId: 1, direction: 1 });
whatsappMessageSchema.index({ tenantId: 1, status: 1 });
whatsappMessageSchema.index({ tenantId: 1, studentId: 1 });
whatsappMessageSchema.index({ conversationId: 1, timestamp: -1 });

export default mongoose.model('WhatsAppMessage', whatsappMessageSchema);
