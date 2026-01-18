import { resolveTenantFromSubdomain } from "../utils/subdomainResolver.js";

/**
 * Ensures that a tenant user only accesses their own data
 * Supports both legacy path-based (/client/[tenantId]) and new subdomain-based routing
 * 
 * Resolution Priority:
 * 1. X-Tenant-Subdomain header (from BFF) - NEW subdomain approach
 * 2. Host header subdomain parsing (prasamagar.lvh.me → prasamagar)
 * 3. Path params/body/query (legacy path-based approach)
 */

export const tenantProtect = async (req, res, next) => {
  const userTenantId = req.user?.tenantId;
  let requestTenantId = null;

  // Priority 1: X-Tenant-Subdomain header (from BFF)
  let subdomainHeader = req.headers["x-tenant-subdomain"];
  
  // Priority 2: Extract subdomain from Host header if not in headers
  // e.g., "prasamagar.lvh.me:3000" → "prasamagar" or "prasamagar.enromatics.com" → "prasamagar"
  if (!subdomainHeader) {
    const host = req.headers.host || '';
    const hostParts = host.split(':')[0].split('.');
    
    // Check if this is a subdomain-based request (more than 1 part and not localhost)
    if (hostParts.length > 2 || (hostParts.length === 2 && hostParts[0] !== 'localhost')) {
      subdomainHeader = hostParts[0];
    }
  }

  // Try to resolve subdomain to tenantId
  if (subdomainHeader) {
    requestTenantId = await resolveTenantFromSubdomain(subdomainHeader);
    
    if (!requestTenantId) {
      return res.status(404).json({ 
        message: "Invalid subdomain or tenant not found",
        subdomain: subdomainHeader 
      });
    }
  }
  
  // Priority 3: Legacy path-based routing (fallback for backward compatibility)
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
