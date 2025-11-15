/**
 * Ensures that a tenant user only accesses their own data
 * Compare tenantId from JWT vs tenantId in route or body
 */

export const tenantProtect = (req, res, next) => {
  const userTenantId = req.user?.tenantId;
  const requestTenantId =
    req.params.tenantId || req.body.tenantId || req.query.tenantId;

  if (!userTenantId || !requestTenantId) {
    return res.status(400).json({ message: "Tenant information missing" });
  }

  // Normalize role for case-insensitive check (accept SuperAdmin / superadmin)
  const userRole = req.user && req.user.role ? String(req.user.role).toLowerCase() : null;

  if (userTenantId !== requestTenantId && userRole !== "superadmin") {
    return res.status(403).json({
      message: "Access denied: You can only access your own tenant’s data",
    });
  }

  next();
};
