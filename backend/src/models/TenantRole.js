import mongoose from "mongoose";

/**
 * TenantRole Model
 * 
 * Allows each tenant to create custom roles beyond the 3 base system roles
 * (superadmin, tenantadmin, student)
 * 
 * Example custom roles per tenant:
 * - teacher, counsellor, staff, accountant, manager, receptionist, etc.
 * 
 * Each role has permissions that control what actions users can perform
 */

const tenantRoleSchema = new mongoose.Schema(
  {
    // Tenant this role belongs to
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Role name (e.g., "teacher", "counsellor", "staff")
    roleName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Human-readable description
    description: {
      type: String,
      default: "",
    },

    // Permission array - stores permission identifiers
    // Format: ["academics:create", "academics:read", "students:manage", etc.]
    permissions: {
      type: [String],
      default: [],
      index: true,
    },

    // Whether this role is system-managed or user-created
    isSystemRole: {
      type: Boolean,
      default: false, // false = tenant-created custom role, true = reserved for future use
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Number of users assigned this role (for analytics)
    userCount: {
      type: Number,
      default: 0,
    },

    // Metadata
    metadata: {
      icon: String, // e.g., "👨‍🏫" for teacher
      color: String, // e.g., "#3b82f6" for blue
      createdBy: mongoose.Schema.Types.ObjectId, // User ID who created this role
    },
  },
  { 
    timestamps: true,
    // Compound unique index: each tenant can only have one role with a given name
    indexes: [
      { tenantId: 1, roleName: 1 }
    ]
  }
);

// Ensure uniqueness of (tenantId, roleName) pair
tenantRoleSchema.index({ tenantId: 1, roleName: 1 }, { unique: true });

// Pre-save validation
tenantRoleSchema.pre("save", function(next) {
  // Ensure roleName is lowercase for consistency
  this.roleName = this.roleName.toLowerCase();
  
  // Validate roleName doesn't conflict with system roles
  const systemRoles = ['superadmin', 'tenantadmin', 'student'];
  if (systemRoles.includes(this.roleName)) {
    return next(new Error(`Cannot create role with system-reserved name: ${this.roleName}`));
  }
  
  next();
});

// Instance method to add permission
tenantRoleSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this;
};

// Instance method to remove permission
tenantRoleSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this;
};

// Instance method to check if role has specific permission
tenantRoleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Instance method to check if role has any of the permissions
tenantRoleSchema.methods.hasAnyPermission = function(permissions) {
  return permissions.some(p => this.permissions.includes(p));
};

// Static method to get all roles for a tenant
tenantRoleSchema.statics.getTenanRoles = function(tenantId) {
  return this.find({ tenantId, isActive: true });
};

// Static method to get a specific role by name for tenant
tenantRoleSchema.statics.getByName = function(tenantId, roleName) {
  return this.findOne({ tenantId, roleName: roleName.toLowerCase(), isActive: true });
};

// TenantRole model creation
const TenantRole = mongoose.models.TenantRole || mongoose.model("TenantRole", tenantRoleSchema);

export default TenantRole;
