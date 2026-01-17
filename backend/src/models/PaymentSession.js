import mongoose from 'mongoose';

const paymentSessionSchema = new mongoose.Schema({
  // Payment session details
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  
  // Plan and pricing details
  planId: {
    type: String,
    required: true  // basic, pro, enterprise
  },
  
  planName: {
    type: String,
    required: true  // "Basic", "Pro", "Enterprise"
  },
  
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Email and contact
  email: {
    type: String,
    required: true
  },
  
  phone: String,
  
  // Session status
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired', 'failed'],
    default: 'pending',
    index: true
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Payment details (once paid)
  orderId: String,
  paymentSessionId: String,
  paymentLink: String,
  
  // Created by
  createdBy: String,  // SuperAdmin ID who created the link
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  // Notes
  notes: String
}, { timestamps: true });

// Auto-delete expired sessions after 72 hours
paymentSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 259200 });

export default mongoose.model('PaymentSession', paymentSessionSchema);
