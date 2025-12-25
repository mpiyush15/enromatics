import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      example: "Summer Sale 2025"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      example: "SUMMER25"
    },
    description: {
      type: String,
      trim: true
    },

    // Discount Details
    discountType: {
      type: String,
      enum: ["percentage", "flat"], // percentage = 20% off, flat = ₹500 off
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      example: 20 // 20% or 20 units (currency)
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
      default: null,
      example: 5000 // Max ₹5000 discount for percentage discounts
    },

    // Validity
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },

    // Applicable Plans
    applicableTo: {
      type: String,
      enum: ["all_plans", "specific_plans"],
      default: "all_plans"
    },
    planIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        // Only populated if applicableTo is "specific_plans"
      }
    ],

    // Usage Limits
    maxUsageCount: {
      type: Number,
      default: null,
      example: 100 // How many times this offer can be used
    },
    usageCount: {
      type: Number,
      default: 0,
      example: 25 // How many times it's been used already
    },
    maxUsagePerUser: {
      type: Number,
      default: 1,
      example: 1 // Each user can use offer max 1 time
    },

    // Minimum Requirements
    minimumOrderValue: {
      type: Number,
      min: 0,
      default: 0,
      example: 999 // Only apply if order > ₹999
    },

    // Who Created It
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Statistics
    totalRedemptions: {
      type: Number,
      default: 0
    },
    totalDiscountGiven: {
      type: Number,
      default: 0
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "expired", "paused"],
      default: "draft"
    }
  },
  { timestamps: true }
);

// Index for quick lookups
offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Method to check if offer is currently valid
offerSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (!this.maxUsageCount || this.usageCount < this.maxUsageCount)
  );
};

// Method to check if plan is eligible
offerSchema.methods.isEligibleForPlan = function (planId) {
  if (this.applicableTo === "all_plans") {
    return true;
  }
  return this.planIds.some(id => id.toString() === planId.toString());
};

// Method to calculate discount
offerSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (amount * this.discountValue) / 100;
    // Apply max discount limit if set
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else if (this.discountType === "flat") {
    discount = this.discountValue;
  }

  return Math.round(discount);
};

export default mongoose.model("Offer", offerSchema);
