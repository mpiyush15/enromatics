import mongoose from "mongoose";

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
    enum: ["cash", "upi", "bank", "card", "cheque", "online"], 
    default: "cash" 
  },

  date: { 
    type: Date, 
    default: Date.now 
  },

  status: { 
    type: String, 
    enum: ["success", "failed", "pending"], 
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
    enum: ["hand", "email", "whatsapp", "none"],
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
    enum: ["admission", "tuition", "exam", "library", "transport", "other"],
    default: "tuition"
  },

  academicYear: {
    type: String
  },

  month: {
    type: String
  }

}, { timestamps: true });

// Generate receipt number before saving
paymentSchema.pre("save", async function (next) {
  if (!this.receiptNumber && this.receiptGenerated) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = await mongoose.model("Payment").countDocuments({
      tenantId: this.tenantId,
    });
    this.receiptNumber = `RCP/${year}${month}/${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);
