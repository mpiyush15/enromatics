import Tenant from "../models/Tenant.js";
import redisClient from "../config/redisClient.js";

/**
 * Subdomain Resolver Utility
 * Resolves subdomain → tenantId with Redis caching for performance
 * 
 * Usage:
 * const tenantId = await resolveTenantFromSubdomain('prasamagar');
 * 
 * Cache Strategy:
 * - Cache hit: Returns tenantId instantly (< 1ms)
 * - Cache miss: Query MongoDB + cache result (TTL: 1 hour)
 * - Invalid subdomain: Returns null
 */

const CACHE_PREFIX = "subdomain:";
const CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Resolve subdomain to tenantId
 * @param {string} subdomain - e.g., 'prasamagar', 'shreecc'
 * @returns {Promise<string|null>} tenantId or null if not found
 */
export async function resolveTenantFromSubdomain(subdomain) {
  if (!subdomain || typeof subdomain !== "string") {
    return null;
  }

  // Normalize subdomain (lowercase, trim)
  const normalizedSubdomain = subdomain.toLowerCase().trim();

  // Try cache first
  const cacheKey = `${CACHE_PREFIX}${normalizedSubdomain}`;
  
  try {
    const cachedTenantId = await redisClient.get(cacheKey);
    
    if (cachedTenantId) {
      return cachedTenantId;
    }
  } catch (redisError) {
    // Silent fallback to DB
  }

  // Cache miss - query MongoDB
  
  try {
    const tenant = await Tenant.findOne({ 
      subdomain: normalizedSubdomain,
      isActive: true // Only active tenants
    }).select("tenantId subdomain");

    if (!tenant) {
      return null;
    }

    // Cache the result
    try {
      await redisClient.setex(cacheKey, CACHE_TTL, tenant.tenantId);
    } catch (redisError) {
      // Silent cache failure
    }

    return tenant.tenantId;
  } catch (dbError) {
    console.error("[SubdomainResolver] Database error:", dbError.message);
    return null;
  }
}

/**
 * Invalidate subdomain cache (call when tenant subdomain is updated)
 * @param {string} subdomain - Subdomain to invalidate
 */
export async function invalidateSubdomainCache(subdomain) {
  if (!subdomain) return;

  const normalizedSubdomain = subdomain.toLowerCase().trim();
  const cacheKey = `${CACHE_PREFIX}${normalizedSubdomain}`;

  try {
    await redisClient.del(cacheKey);
  } catch (error) {
    // Silent cache invalidation failure
  }
}

/**
 * Extract subdomain from hostname
 * Handles: admin.prasamagar.enromatics.com → 'prasamagar'
 *          staff.prasamagar.enromatics.com → 'prasamagar'
 *          prasamagar.enromatics.com → 'prasamagar'
 * 
 * @param {string} hostname - Full hostname from request
 * @returns {string|null} Extracted subdomain or null
 */
export function extractSubdomainFromHostname(hostname) {
  if (!hostname) return null;

  // Remove port if present (e.g., localhost:3000)
  const cleanHostname = hostname.split(":")[0];

  // For localhost/lvh.me testing: admin.prasamagar.lvh.me → 'prasamagar'
  if (cleanHostname.includes("lvh.me")) {
    const parts = cleanHostname.split(".");
    if (parts.length >= 3) {
      // admin.prasamagar.lvh.me → return 'prasamagar'
      return parts[parts.length - 3];
    }
    return null;
  }

  // Production: admin.prasamagar.enromatics.com → 'prasamagar'
  if (cleanHostname.includes("enromatics.com")) {
    const parts = cleanHostname.split(".");
    
    // prasamagar.enromatics.com (3 parts)
    if (parts.length === 3) {
      return parts[0]; // 'prasamagar'
    }
    
    // admin.prasamagar.enromatics.com (4 parts)
    if (parts.length === 4) {
      return parts[1]; // 'prasamagar'
    }
    
    // Just enromatics.com (no subdomain)
    if (parts.length === 2) {
      return null;
    }
  }

  // Localhost without subdomain
  if (cleanHostname === "localhost" || cleanHostname === "127.0.0.1") {
    return null;
  }

  return null;
}

export default {
  resolveTenantFromSubdomain,
  invalidateSubdomainCache,
  extractSubdomainFromHostname,
};
