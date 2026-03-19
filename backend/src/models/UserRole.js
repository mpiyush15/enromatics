import mongoose from "mongoose";

/**
 * UserRole Model
 * 
 * Maps Users to TenantRoles (many-to-many relationship)
 * A user can have different roles in different tenants
 * 
 * Example:
 * - User 123 has role "teacher" in tenant A
 * - User 123 has role "staff" in tenant B
 * - User 123 has role "student" in tenant C
 */

const userRoleSchema = new mongoose.Schema(
  {
    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Tenant ID
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Reference to TenantRole (custom role for this tenant)
    // For base system roles (superadmin, tenantadmin, student), this can be null
    // and we check user.role directly
    tenantRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantRole",
      default: null,
      index: true,
    },

    // Cached role name for quick lookup (denormalized for performance)
    // Examples: "teacher", "counsellor", "staff", "accountant"
    roleDisplayName: {
      type: String,
      default: null,
    },

    // Whether this assignment is currently active
    isActive: {
      type: Boolean,
      default: true,
    },

    // When this role was assigned to the user
    assignedAt: {
      type: Date,
      default: Date.now,
    },

    // When the role assignment expires (optional - for temporary assignments)
    expiresAt: {
      type: Date,
      default: null,
    },

    // Who assigned this role
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notes about why this role was assigned
    notes: {
      type: String,
      default: "",
    },
  },
  { 
    timestamps: true,
  }
);

// Ensure each user has at most one active custom role per tenant
userRoleSchema.index({ userId: 1, tenantId: 1, isActive: 1 }, { unique: true, sparse: true });

// Pre-save hook to validate expiresAt
userRoleSchema.pre("save", function(next) {
  // If expiresAt is in the past, automatically mark as inactive
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isActive = false;
  }
  next();
});

// Instance method to check if role assignment is still valid
userRoleSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

// Instance method to revoke this role
userRoleSchema.methods.revoke = function() {
  this.isActive = false;
  return this.save();
};

// Static method to get active role for user in tenant
userRoleSchema.statics.getActiveRole = function(userId, tenantId) {
  return this.findOne({
    userId,
    tenantId,
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).populate('tenantRoleId');
};

// Static method to get all active roles for a user
userRoleSchema.statics.getActiveRoles = function(userId) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).populate('tenantRoleId');
};

// Static method to get all users with a specific custom role in a tenant
userRoleSchema.statics.getUsersByRole = function(tenantId, tenantRoleId) {
  return this.find({
    tenantId,
    tenantRoleId,
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).populate('userId');
};

// Static method to assign a role to a user
userRoleSchema.statics.assignRole = function(userId, tenantId, tenantRoleId, assignedBy = null, notes = "") {
  return this.create({
    userId,
    tenantId,
    tenantRoleId,
    assignedBy,
    notes,
    isActive: true,
  });
};

// UserRole model creation
const UserRole = mongoose.models.UserRole || mongoose.model("UserRole", userRoleSchema);

export default UserRole;
