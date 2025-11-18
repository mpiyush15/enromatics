import Employee from "../models/Employee.js";

/**
 * Middleware to check if an employee has specific permissions
 * Usage: checkPermission("canAccessStudents")
 */
export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role?.toLowerCase();
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;

      // Allow tenantAdmin full access
      if (userRole === "tenantadmin") {
        return next();
      }

      // For staff, teacher, counsellor, manager - check permissions in Employee model
      if (["staff", "teacher", "counsellor", "manager"].includes(userRole)) {
        // Find employee record by userId or email
        const employee = await Employee.findOne({
          tenantId,
          $or: [
            { _id: userId },
            { email: req.user?.email }
          ]
        });

        if (!employee) {
          return res.status(403).json({ 
            message: "Employee record not found. Contact admin to set up permissions." 
          });
        }

        // Block staff from accessing accounts regardless of permission setting
        if (userRole === "staff" && requiredPermission === "canAccessAccounts") {
          return res.status(403).json({ 
            message: "Staff members cannot access Accounts section." 
          });
        }

        // Check if employee has the required permission
        if (!employee.permissions || !employee.permissions[requiredPermission]) {
          return res.status(403).json({ 
            message: `You don't have permission to access this resource. Required: ${requiredPermission}` 
          });
        }

        // Permission granted
        return next();
      }

      // If role doesn't match any known employee role, deny access
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions." 
      });

    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Server error while checking permissions" });
    }
  };
};

/**
 * Middleware to allow access if user is tenantAdmin OR has specific permission
 * Usage: requirePermission("canAccessStudents")
 */
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role?.toLowerCase();
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;

      // Allow tenantAdmin full access
      if (userRole === "tenantadmin") {
        return next();
      }

      // For employee roles, check permissions
      if (["staff", "teacher", "counsellor", "manager"].includes(userRole)) {
        const employee = await Employee.findOne({
          tenantId,
          $or: [
            { _id: userId },
            { email: req.user?.email }
          ]
        });

        if (!employee) {
          return res.status(403).json({ 
            message: "Employee record not found. Contact admin." 
          });
        }

        // Block staff from accounts
        if (userRole === "staff" && requiredPermission === "canAccessAccounts") {
          return res.status(403).json({ 
            message: "Staff members cannot access Accounts section." 
          });
        }

        // Check permission
        if (employee.permissions && employee.permissions[requiredPermission]) {
          return next();
        }

        return res.status(403).json({ 
          message: `Access denied. You need ${requiredPermission} permission.` 
        });
      }

      // Deny access for other roles
      return res.status(403).json({ 
        message: "Access denied." 
      });

    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
