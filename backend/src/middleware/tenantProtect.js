import { resolveTenantFromSubdomain } from "../utils/subdomainResolver.js";

/**
 * Ensures that a tenant user only accesses their own data
 * Supports both legacy path-based (/client/[tenantId]) and new subdomain-based routing
 * 
 * Resolution Priority:
 * 1. X-Tenant-Subdomain header (from BFF) - NEW subdomain approach
 * 2. Path params/body/query (legacy path-based approach)
 */

export const tenantProtect = async (req, res, next) => {
  const userTenantId = req.user?.tenantId;
  let requestTenantId = null;

  // Priority 1: Subdomain-based routing (NEW approach)
  const subdomainHeader = req.headers["x-tenant-subdomain"];
  
  if (subdomainHeader) {
    console.log(`[TenantProtect] Resolving subdomain: ${subdomainHeader}`);
    requestTenantId = await resolveTenantFromSubdomain(subdomainHeader);
    
    if (!requestTenantId) {
      return res.status(404).json({ 
        message: "Invalid subdomain or tenant not found",
        subdomain: subdomainHeader 
      });
    }
    
    console.log(`[TenantProtect] Subdomain ${subdomainHeader} → tenantId: ${requestTenantId}`);
  }
  
  // Priority 2: Legacy path-based routing (fallback for backward compatibility)
  if (!requestTenantId) {
    requestTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  }

  if (!userTenantId || !requestTenantId) {
    return res.status(400).json({ message: "Tenant information missing" });
  }

  // Normalize role for case-insensitive check (accept SuperAdmin / superadmin)
  const userRole = req.user && req.user.role ? String(req.user.role).toLowerCase() : null;

  if (userTenantId !== requestTenantId && userRole !== "superadmin") {
    return res.status(403).json({
      message: "Access denied: You can only access your own tenant's data",
      userTenant: userTenantId,
      requestedTenant: requestTenantId
    });
  }

  // Store resolved tenantId in request for downstream use
  req.tenantId = requestTenantId;

  next();
};
