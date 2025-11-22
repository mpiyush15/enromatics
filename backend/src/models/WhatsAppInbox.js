import mongoose from 'mongoose';

const whatsAppInboxSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  waMessageId: {
    type: String,
    required: true,
    unique: true
  },
  senderPhone: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    default: null
  },
  senderProfileName: {
    type: String,
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video', 'location', 'contact', 'sticker', 'reaction', 'interactive', 'button', 'list', 'template'],
    required: true
  },
  content: {
    // Text message
    text: String,
    
    // Media messages
    mediaId: String,
    mediaUrl: String,
    mimeType: String,
    filename: String,
    caption: String,
    
    // Location message
    latitude: Number,
    longitude: Number,
    address: String,
    name: String,
    
    // Contact message
    contacts: [{
      name: String,
      phone: String,
      email: String
    }],
    
    // Interactive message response
    interactiveType: String, // button_reply, list_reply
    buttonId: String,
    buttonText: String,
    listId: String,
    listTitle: String,
    listDescription: String,
    
    // Reaction
    reactionEmoji: String,
    reactedToMessageId: String
  },
  timestamp: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replied: {
    type: Boolean,
    default: false
  },
  repliedAt: Date,
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyMessageId: String,
  // For conversation threading
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  // Contextual information
  context: {
    forwarded: Boolean,
    quotedMessageId: String,
    quotedMessage: String
  },
  // Message priority/tags
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String],
  notes: String,
  // Webhook metadata
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
whatsAppInboxSchema.index({ tenantId: 1, createdAt: -1 });
whatsAppInboxSchema.index({ tenantId: 1, conversationId: 1, createdAt: -1 });
whatsAppInboxSchema.index({ tenantId: 1, senderPhone: 1, createdAt: -1 });
whatsAppInboxSchema.index({ tenantId: 1, isRead: 1 });
whatsAppInboxSchema.index({ tenantId: 1, messageType: 1 });
whatsAppInboxSchema.index({ waMessageId: 1 });

// Virtual for sender display name
whatsAppInboxSchema.virtual('displayName').get(function() {
  return this.senderName || this.senderProfileName || this.senderPhone;
});

// Method to mark as read
whatsAppInboxSchema.methods.markAsRead = function(userId) {
  this.isRead = true;
  this.readAt = new Date();
  this.readBy = userId;
  return this.save();
};

// Method to mark as replied
whatsAppInboxSchema.methods.markAsReplied = function(userId, replyMessageId) {
  this.replied = true;
  this.repliedAt = new Date();
  this.repliedBy = userId;
  this.replyMessageId = replyMessageId;
  return this.save();
};

// Static method to get conversation
whatsAppInboxSchema.statics.getConversation = function(tenantId, conversationId, limit = 50) {
  return this.find({ tenantId, conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('readBy', 'name email')
    .populate('repliedBy', 'name email')
    .lean();
};

// Static method to get unread count
whatsAppInboxSchema.statics.getUnreadCount = function(tenantId) {
  return this.countDocuments({ tenantId, isRead: false });
};

// Static method to get conversations list
whatsAppInboxSchema.statics.getConversations = function(tenantId, limit = 20) {
  return this.aggregate([
    { $match: { tenantId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        totalMessages: { $sum: 1 }
      }
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: limit },
    {
      $project: {
        conversationId: '$_id',
        senderPhone: '$lastMessage.senderPhone',
        senderName: '$lastMessage.senderName',
        senderProfileName: '$lastMessage.senderProfileName',
        lastMessageType: '$lastMessage.messageType',
        lastMessageContent: '$lastMessage.content',
        lastMessageTime: '$lastMessage.createdAt',
        unreadCount: 1,
        totalMessages: 1
      }
    }
  ]);
};

export default mongoose.model('WhatsAppInbox', whatsAppInboxSchema);