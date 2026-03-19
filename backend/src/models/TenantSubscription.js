import mongoose from 'mongoose';

const tenantSubscriptionSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'basic'
  },
  features: {
    webDashboard: {
      type: Boolean,
      default: true
    },
    mobileApp: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    offlineAccess: {
      type: Boolean,
      default: false
    }
  },
  pricing: {
    monthlyPrice: {
      type: Number,
      default: 499  // Updated to INR pricing (was 29 USD)
    },
    annualPrice: {
      type: Number,
      default: 4999  // Annual pricing in INR
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR'  // Changed from USD to INR for Indian market
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'trial', 'inactive', 'cancelled', 'pending', 'expired'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly',
    description: 'How often the subscription renews'
  },
  mobileAppDetails: {
    hasCustomApp: {
      type: Boolean,
      default: false
    },
    appGeneratedDate: {
      type: Date
    },
    appVersion: {
      type: String
    },
    downloadUrl: {
      type: String
    },
    lastBuildStatus: {
      type: String,
      enum: ['pending', 'building', 'completed', 'failed'],
      default: 'pending'
    }
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    planType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed'
    },
    transactionId: String,
    invoiceNumber: String,
    pdfUrl: String,
    description: String,
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly'
    },
    periodStart: Date,
    periodEnd: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }],
  invoiceData: {
    lastInvoiceNumber: String,
    lastInvoicePdfUrl: String,
    lastInvoiceDate: Date,
    totalInvoices: {
      type: Number,
      default: 0
    }
  },
  statusHistory: [{
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    reason: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  renewalHistory: [{
    renewedAt: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    planType: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Foreign key validation: Ensure tenantId exists in Tenant collection
tenantSubscriptionSchema.pre('save', async function(next) {
  if (!this.tenantId) {
    return next(new Error("tenantId is required"));
  }

  // Validate status transition
  if (this.isModified('subscription.status') && !this.isNew) {
    const { isValidTransition } = await import('../services/subscriptionLifecycleService.js');
    const oldDoc = await TenantSubscription.findById(this._id);
    
    if (oldDoc) {
      const oldStatus = oldDoc.subscription.status;
      const newStatus = this.subscription.status;
      
      if (!isValidTransition(oldStatus, newStatus)) {
        return next(new Error(
          `Invalid status transition: ${oldStatus} → ${newStatus}`
        ));
      }
    }
  }

  // Check if tenant exists (only on insert or if tenantId is modified)
  if (this.isNew || this.isModified("tenantId")) {
    const { default: Tenant } = await import('./Tenant.js');
    const tenant = await Tenant.findOne({ tenantId: this.tenantId });
    
    if (!tenant) {
      return next(new Error(`Invalid tenantId: Tenant "${this.tenantId}" does not exist`));
    }
  }

  this.updatedAt = Date.now();
  next();
});

// Sync billing metadata to Tenant after save
tenantSubscriptionSchema.post('save', async function(doc) {
  try {
    const { default: Tenant } = await import('./Tenant.js');
    const { syncBillingMetadata } = await import('../utils/billingUtils.js');
    
    const tenant = await Tenant.findOne({ tenantId: this.tenantId });
    if (tenant) {
      syncBillingMetadata(tenant, this);
      await tenant.save();
    }
  } catch (error) {
    console.warn(`⚠️  Failed to sync billing metadata for ${this.tenantId}:`, error.message);
    // Don't throw - continue even if sync fails
  }
});

// Virtual for checking if premium features are available
tenantSubscriptionSchema.virtual('isPremium').get(function() {
  return (this.planType === 'pro' || this.planType === 'enterprise') && 
         this.subscription.status === 'active';
});

// Virtual for checking if basic or higher features are available
tenantSubscriptionSchema.virtual('isActive').get(function() {
  return this.subscription.status === 'active' && this.planType !== 'free';
});

// Method to upgrade subscription
tenantSubscriptionSchema.methods.upgradePlan = function(newPlanType) {
  const PLAN_PRICING = {
    free: { monthlyPrice: 0, annualPrice: 0 },
    basic: { monthlyPrice: 499, annualPrice: 4999 },
    pro: { monthlyPrice: 999, annualPrice: 9999 },
    enterprise: { monthlyPrice: null, annualPrice: null }
  };

  const PLAN_FEATURES = {
    free: {
      webDashboard: true,
      mobileApp: false,
      prioritySupport: false,
      offlineAccess: false
    },
    basic: {
      webDashboard: true,
      mobileApp: true,
      prioritySupport: false,
      offlineAccess: false
    },
    pro: {
      webDashboard: true,
      mobileApp: true,
      prioritySupport: true,
      offlineAccess: true
    },
    enterprise: {
      webDashboard: true,
      mobileApp: true,
      prioritySupport: true,
      offlineAccess: true
    }
  };

  if (!PLAN_PRICING[newPlanType]) {
    throw new Error(`Invalid plan type: ${newPlanType}`);
  }

  this.planType = newPlanType;
  this.features = PLAN_FEATURES[newPlanType];
  this.pricing.monthlyPrice = PLAN_PRICING[newPlanType].monthlyPrice;
  this.pricing.annualPrice = PLAN_PRICING[newPlanType].annualPrice;
  
  // Add payment record
  this.paymentHistory.push({
    amount: PLAN_PRICING[newPlanType].monthlyPrice || 0,
    planType: newPlanType,
    status: 'completed'
  });
  
  return this.save();
};

// Method to check if mobile app access is allowed
tenantSubscriptionSchema.methods.canAccessMobileApp = function() {
  const APP_ENABLED_PLANS = ['basic', 'pro', 'enterprise'];
  return APP_ENABLED_PLANS.includes(this.planType) && 
         this.subscription.status === 'active';
};

// Static method to find active premium subscriptions (pro or enterprise)
tenantSubscriptionSchema.statics.findPremiumTenants = function() {
  return this.find({
    planType: { $in: ['pro', 'enterprise'] },
    'subscription.status': 'active'
  });
};

const TenantSubscription = mongoose.model('TenantSubscription', tenantSubscriptionSchema);

export default TenantSubscription;