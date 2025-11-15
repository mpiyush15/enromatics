import mongoose from 'mongoose';
import crypto from 'crypto';

const whatsAppConfigSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true,
    set: function(token) {
      // Encrypt token before storing
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback-key', 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    },
    get: function(encrypted) {
      if (!encrypted) return encrypted;
      try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback-key', 'salt', 32);
        const parts = encrypted.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch (err) {
        return encrypted;
      }
    }
  },
  wabaId: {
    type: String,
    required: true
  },
  businessName: String,
  isActive: {
    type: Boolean,
    default: true
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  lastTestedAt: Date,
  messageCount: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  settings: {
    autoReply: { type: Boolean, default: false },
    autoReplyMessage: String,
    sendWelcomeMessage: { type: Boolean, default: true },
    welcomeMessageTemplate: String
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index for quick tenant lookup
whatsAppConfigSchema.index({ tenantId: 1 });

export default mongoose.model('WhatsAppConfig', whatsAppConfigSchema);
