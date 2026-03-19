/**
 * Middleware to allow only specific roles to access a route
 * Checks both system base roles and tenant custom roles
 * Example: authorizeRoles("superadmin", "tenantadmin")
 */

import UserRole from '../models/UserRole.js';
import TenantRole from '../models/TenantRole.js';

export const authorizeRoles = (...allowedRoles) => {
  // Normalize allowed roles to lowercase for case-insensitive comparison
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());

  return async (req, res, next) => {
    try {
      const userRole = req.user && req.user.role ? String(req.user.role).toLowerCase() : null;
      
      console.log("🔐 Role check - User role:", userRole, "Allowed roles:", allowed);

      if (!userRole) {
        console.log("❌ Access denied - no user role");
        return res.status(403).json({ message: "Access denied. User role not found." });
      }

      // Check if user's base system role is in allowed list
      if (allowed.includes(userRole)) {
        console.log("✅ Base system role authorized");
        return next();
      }

      // If base role not allowed, check tenant custom roles
      if (req.tenant && req.tenant.tenantId) {
        const userRole = await UserRole.getActiveRole(req.user._id, req.tenant.tenantId);
        
        if (userRole && userRole.tenantRoleId) {
          const customRole = await TenantRole.findById(userRole.tenantRoleId);
          
          if (customRole && allowed.includes(customRole.roleName.toLowerCase())) {
            console.log("✅ Custom tenant role authorized:", customRole.roleName);
            // Attach custom role info to request for later use
            req.customRole = customRole;
            return next();
          }
        }
      }

      console.log("❌ Access denied for role:", userRole);
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
    } catch (err) {
      console.error("❌ Role check error:", err.message);
      res.status(500).json({ message: "Role authorization check failed", error: err.message });
    }
  };
};

/**
 * Middleware to check specific permission within a role
 * Example: requirePermission("academics:create")
 */
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Check if user has custom role with permission
      if (req.customRole) {
        if (req.customRole.hasPermission(requiredPermission)) {
          console.log(`✅ Permission granted: ${requiredPermission}`);
          return next();
        } else {
          console.log(`❌ Permission denied: ${requiredPermission}`);
          return res.status(403).json({ 
            message: `Permission denied: ${requiredPermission}` 
          });
        }
      }

      // System roles (superadmin, tenantadmin) have all permissions by default
      const systemRole = req.user?.role?.toLowerCase();
      if (['superadmin', 'tenantadmin'].includes(systemRole)) {
        console.log(`✅ System role ${systemRole} has all permissions`);
        return next();
      }

      console.log(`❌ No permissions found for user`);
      res.status(403).json({ message: "Insufficient permissions" });
    } catch (err) {
      console.error("❌ Permission check error:", err.message);
      res.status(500).json({ message: "Permission check failed", error: err.message });
    }
  };
};

/**
 * Middleware to attach available permissions to request
 * Useful for showing UI based on actual permissions
 * Usage: app.use(attachUserPermissions)
 */
export const attachUserPermissions = async (req, res, next) => {
  try {
    if (req.user && req.tenant) {
      // Get custom role if exists
      const userRole = await UserRole.getActiveRole(req.user._id, req.tenant.tenantId);
      
      if (userRole && userRole.tenantRoleId) {
        const customRole = await TenantRole.findById(userRole.tenantRoleId);
        req.permissions = customRole?.permissions || [];
        req.customRole = customRole;
      } else {
        // System roles have all permissions
        req.permissions = ['*']; // Wildcard for all permissions
      }
    }

    next();
  } catch (err) {
    console.error("❌ Error attaching permissions:", err.message);
    next(); // Continue even if permission check fails
  }
};

