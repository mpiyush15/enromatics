import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },

  category: {
    type: String,
    required: true,
    enum: [
      "salary",
      "rent",
      "utilities",
      "supplies",
      "maintenance",
      "marketing",
      "transport",
      "equipment",
      "software",
      "books",
      "other"
    ]
  },

  amount: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  description: {
    type: String,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "bank", "card", "cheque", "online"],
    default: "cash"
  },

  paidTo: {
    type: String
  },

  invoiceNumber: {
    type: String
  },

  receiptAttached: {
    type: Boolean,
    default: false
  },

  receiptUrl: {
    type: String
  },

  status: {
    type: String,
    enum: ["paid", "pending", "cancelled"],
    default: "paid"
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  remarks: {
    type: String
  },

  academicYear: {
    type: String
  },

  month: {
    type: String
  }

}, { timestamps: true });

// Index for faster queries
expenseSchema.index({ tenantId: 1, date: -1 });
expenseSchema.index({ tenantId: 1, category: 1 });

export default mongoose.model("Expense", expenseSchema);
