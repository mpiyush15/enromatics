import mongoose from "mongoose";

/**
 * Facebook Business Integration Schema
 * Stores Facebook Business API connection data and access tokens
 * Links to either User (for personal connections) or Tenant (for business connections)
 */

const facebookConnectionSchema = new mongoose.Schema(
  {
    // Link to User or use tenantId for tenant-level connections
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Facebook connection status
    connected: {
      type: Boolean,
      default: false,
    },

    // Facebook user information
    facebookUserId: {
      type: String,
      required: true,
    },

    facebookUserName: {
      type: String,
    },

    facebookUserEmail: {
      type: String,
    },

    // Access tokens
    accessToken: {
      type: String,
      required: true,
    },

    tokenExpiry: {
      type: Date,
    },

    refreshToken: {
      type: String,
    },

    // Permissions granted
    permissions: [{
      type: String,
    }],

    // Connection timestamps
    connectedAt: {
      type: Date,
      default: Date.now,
    },

    lastSyncAt: {
      type: Date,
      default: Date.now,
    },

    // Facebook Business Manager data
    adAccounts: [{
      id: String,
      name: String,
      accountStatus: Number,
      balance: String,
      currency: String,
      timezone: String,
    }],

    // Facebook Pages data
    pages: [{
      id: String,
      name: String,
      category: String,
      followersCount: Number,
      fanCount: Number,
      link: String,
      picture: String,
      accessToken: String, // Page-specific access token
    }],

    // Sync status and errors
    lastSyncError: {
      type: String,
    },

    syncStatus: {
      type: String,
      enum: ["active", "error", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Indexes for performance
facebookConnectionSchema.index({ tenantId: 1, connected: 1 });
facebookConnectionSchema.index({ facebookUserId: 1 });
facebookConnectionSchema.index({ userId: 1 });

// Static method to find connection by tenant
facebookConnectionSchema.statics.findByTenant = function(tenantId) {
  return this.findOne({ tenantId, connected: true }).sort({ connectedAt: -1 });
};

// Static method to find connection by user
facebookConnectionSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId, connected: true }).sort({ connectedAt: -1 });
};

// Instance method to update sync timestamp
facebookConnectionSchema.methods.markSynced = function() {
  this.lastSyncAt = new Date();
  return this.save();
};

// Instance method to validate token (simple check)
facebookConnectionSchema.methods.isTokenValid = function() {
  if (!this.tokenExpiry) return true; // Never-expiring token
  return new Date() < this.tokenExpiry;
};

const FacebookConnection = mongoose.models.FacebookConnection || 
  mongoose.model("FacebookConnection", facebookConnectionSchema);

export default FacebookConnection;