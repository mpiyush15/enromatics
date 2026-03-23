import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const refundSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  originalPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },

  amount: {
    type: Number,
    required: true
  },

  reason: {
    type: String,
    required: true
  },

  refundDate: {
    type: Date,
    default: Date.now
  },

  refundMethod: {
    type: String,
    enum: ENUMS.REFUND_METHOD,
    default: "cash"
  },

  status: {
    type: String,
    enum: ENUMS.REFUND_STATUS,
    default: "pending"
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  approvedAt: {
    type: Date
  },

  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  processedAt: {
    type: Date
  },

  transactionId: {
    type: String
  },

  remarks: {
    type: String
  },

  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  }

}, { timestamps: true });

// Add indexes for faster queries
refundSchema.index({ tenantId: 1, refundDate: -1 });
refundSchema.index({ tenantId: 1, studentId: 1 });
refundSchema.index({ tenantId: 1, status: 1 });

// Generate refund receipt number
refundSchema.pre("save", async function (next) {
  if (!this.receiptNumber && this.status === "completed") {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = await mongoose.model("Refund").countDocuments({
      tenantId: this.tenantId,
    });
    this.receiptNumber = `REF/${year}${month}/${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Refund", refundSchema);
