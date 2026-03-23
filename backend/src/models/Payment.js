import mongoose from "mongoose";
import Counter from "./Counter.js";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const paymentSchema = new mongoose.Schema({

  tenantId: { 
    type: String, 
    required: true 
  },

  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student",
    required: true
  },

  amount: { 
    type: Number, 
    required: true 
  },

  method: { 
    type: String, 
    enum: ENUMS.PAYMENT_METHODS, 
    default: "cash" 
  },

  date: { 
    type: Date, 
    default: Date.now 
  },

  status: { 
    type: String, 
    enum: ENUMS.PAYMENT_STATUS, 
    default: "success" 
  },

  // Receipt tracking
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  receiptUrl: {
    type: String,
  },

  receiptGenerated: {
    type: Boolean,
    default: false
  },

  receiptGeneratedAt: {
    type: Date
  },

  receiptGeneratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  receiptDelivered: {
    type: Boolean,
    default: false
  },

  receiptDeliveryMethod: {
    type: String,
    enum: ENUMS.PAYMENT_RECEIPT_MODE,
    default: "none"
  },

  receiptDeliveredAt: {
    type: Date
  },

  // Payment details
  transactionId: {
    type: String
  },

  remarks: {
    type: String
  },

  // For partial payments
  feeType: {
    type: String,
    enum: ENUMS.PAYMENT_PURPOSE,
    default: "tuition"
  },

  academicYear: {
    type: String
  },

  month: {
    type: String
  }

}, { timestamps: true });

// Add indexes for faster queries
paymentSchema.index({ tenantId: 1, date: -1 });
paymentSchema.index({ tenantId: 1, studentId: 1 });
paymentSchema.index({ tenantId: 1, status: 1 });

// Generate receipt number before saving (atomic counter approach)
paymentSchema.pre("save", async function (next) {
  try {
    if (!this.receiptNumber && this.receiptGenerated) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const prefix = `RCP/${year}${month}/`;
      
      // Get next sequence number atomically
      const sequence = await Counter.getNextSequence(
        this.tenantId,
        'receipt',
        prefix
      );
      
      this.receiptNumber = `${prefix}${sequence.toString().padStart(4, "0")}`;
      console.log('📋 Generated receipt number:', this.receiptNumber);
    }
    next();
  } catch (err) {
    console.error('❌ Error generating receipt number:', err);
    next(err);
  }
});

export default mongoose.model("Payment", paymentSchema);
