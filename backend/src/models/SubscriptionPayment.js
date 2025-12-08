import mongoose from "mongoose";

const subscriptionPaymentSchema = new mongoose.Schema({
  tenantId: { 
    type: String, 
    required: true,
    index: true
  },
  
  // Invoice details
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  invoiceDate: {
    type: Date,
    default: Date.now
  },

  // Amount details
  amount: { 
    type: Number, 
    required: true 
  },
  
  currency: {
    type: String,
    default: "INR"
  },
  
  tax: {
    type: Number,
    default: 0
  },
  
  totalAmount: {
    type: Number,
    required: true
  },

  // Plan details
  planName: {
    type: String,
    required: true
  },
  
  planKey: {
    type: String,
    enum: ["basic", "pro", "enterprise", "trial"],
    required: true
  },
  
  billingCycle: {
    type: String,
    enum: ["monthly", "annual"],
    default: "monthly"
  },
  
  // Period covered
  periodStart: {
    type: Date,
    required: true
  },
  
  periodEnd: {
    type: Date,
    required: true
  },

  // Payment gateway details
  paymentMethod: { 
    type: String, 
    enum: ["cashfree", "razorpay", "stripe", "bank_transfer", "free"],
    default: "cashfree" 
  },
  
  gatewayOrderId: {
    type: String
  },
  
  gatewayPaymentId: {
    type: String
  },
  
  gatewaySignature: {
    type: String
  },

  // Payment status
  status: { 
    type: String, 
    enum: ["success", "failed", "pending", "refunded"],
    default: "pending"
  },
  
  paidAt: {
    type: Date
  },

  // Invoice PDF in S3
  invoiceS3Key: {
    type: String
  },
  
  invoiceUrl: {
    type: String
  },
  
  invoiceGenerated: {
    type: Boolean,
    default: false
  },

  // Tenant info snapshot (for invoice)
  tenantSnapshot: {
    instituteName: String,
    email: String,
    phone: String,
    address: String,
    gstin: String
  },

  // Metadata
  notes: {
    type: String
  }

}, { timestamps: true });

// Generate invoice number before saving
subscriptionPaymentSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("SubscriptionPayment").countDocuments() + 1;
    this.invoiceNumber = `INV-${year}${month}-${String(count).padStart(5, "0")}`;
  }
  next();
});

// Index for querying by tenant
subscriptionPaymentSchema.index({ tenantId: 1, createdAt: -1 });
subscriptionPaymentSchema.index({ invoiceNumber: 1 });
subscriptionPaymentSchema.index({ status: 1 });

export default mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);
