/**
 * Middleware to allow only specific roles to access a route
 * Example: authorizeRoles("superadmin", "tenantAdmin")
 */

export const authorizeRoles = (...allowedRoles) => {
  // Normalize allowed roles to lowercase for case-insensitive comparison
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    const userRole = req.user && req.user.role ? String(req.user.role).toLowerCase() : null;
    
    console.log("🔐 Role check - User role:", userRole, "Allowed roles:", allowed, "Match:", allowed.includes(userRole));

    if (!userRole || !allowed.includes(userRole)) {
      console.log("❌ Access denied for role:", userRole);
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    console.log("✅ Role authorized");
    next();
  };
};
