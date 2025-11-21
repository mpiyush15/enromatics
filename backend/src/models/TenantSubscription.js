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
    enum: ['basic', 'premium'],
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
      default: 29
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
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
    transactionId: String
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

// Update the updatedAt field before saving
tenantSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if premium features are available
tenantSubscriptionSchema.virtual('isPremium').get(function() {
  return this.planType === 'premium' && this.subscription.status === 'active';
});

// Method to upgrade subscription
tenantSubscriptionSchema.methods.upgradeToPremium = function() {
  this.planType = 'premium';
  this.features.mobileApp = true;
  this.features.prioritySupport = true;
  this.features.offlineAccess = true;
  this.pricing.monthlyPrice = 49;
  
  // Add payment record
  this.paymentHistory.push({
    amount: 49,
    planType: 'premium',
    status: 'completed'
  });
  
  return this.save();
};

// Method to check if mobile app access is allowed
tenantSubscriptionSchema.methods.canAccessMobileApp = function() {
  return this.features.mobileApp && this.subscription.status === 'active';
};

// Static method to find active premium subscriptions
tenantSubscriptionSchema.statics.findPremiumTenants = function() {
  return this.find({
    planType: 'premium',
    'subscription.status': 'active',
    'features.mobileApp': true
  });
};

const TenantSubscription = mongoose.model('TenantSubscription', tenantSubscriptionSchema);

export default TenantSubscription;