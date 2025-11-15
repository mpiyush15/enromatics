/**
 * Middleware to allow only specific roles to access a route
 * Example: authorizeRoles("superadmin", "tenantAdmin")
 */

export const authorizeRoles = (...allowedRoles) => {
  // Normalize allowed roles to lowercase for case-insensitive comparison
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    const userRole = req.user && req.user.role ? String(req.user.role).toLowerCase() : null;

    if (!userRole || !allowed.includes(userRole)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
