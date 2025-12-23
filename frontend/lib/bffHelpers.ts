/**
 * BFF Helper Utilities for Subdomain-Based Multi-Tenancy
 * 
 * These helpers extract subdomain from the request and build headers
 * for backend API calls. Use in all BFF routes to support subdomain architecture.
 */

import { cookies } from "next/headers";
import { headers } from "next/headers";

/**
 * Extract tenant subdomain from the current request
 * 
 * Extraction Logic:
 * - admin.prasamagar.enromatics.com → 'prasamagar'
 * - staff.prasamagar.enromatics.com → 'prasamagar'
 * - prasamagar.enromatics.com → 'prasamagar'
 * - admin.prasamagar.lvh.me → 'prasamagar' (local testing)
 * - localhost:3000 → null (fallback to path-based)
 * 
 * @returns {Promise<string | null>} Extracted subdomain or null
 */
export async function extractTenantSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";

  if (!hostname) {
    return null;
  }

  // Remove port if present
  const cleanHostname = hostname.split(":")[0];

  // Local testing with lvh.me: admin.prasamagar.lvh.me → 'prasamagar'
  if (cleanHostname.includes("lvh.me")) {
    const parts = cleanHostname.split(".");
    if (parts.length >= 3) {
      const subdomain = parts[parts.length - 3];
      return subdomain;
    }
    return null;
  }

  // Production: admin.prasamagar.enromatics.com → 'prasamagar'
  if (cleanHostname.includes("enromatics.com")) {
    const parts = cleanHostname.split(".");

    // prasamagar.enromatics.com (3 parts)
    if (parts.length === 3) {
      const subdomain = parts[0];
      return subdomain;
    }

    // admin.prasamagar.enromatics.com (4 parts)
    if (parts.length === 4) {
      const subdomain = parts[1];
      return subdomain;
    }

    // Just enromatics.com (no subdomain)
    if (parts.length === 2) {
      return null;
    }
  }

  // Localhost or other (no subdomain)
  return null;
}

/**
 * Build headers for backend API calls with subdomain support
 * 
 * Includes:
 * - Cookie forwarding (authentication)
 * - X-Tenant-Subdomain header (if subdomain detected)
 * - Content-Type (application/json)
 * 
 * @returns {Promise<HeadersInit>} Headers object ready for fetch()
 */
export async function buildBFFHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Forward authentication cookie
  if (authToken) {
    headers["Cookie"] = `auth_token=${authToken}`;
  }

  // Add subdomain header if present
  const subdomain = await extractTenantSubdomain();
  if (subdomain) {
    headers["X-Tenant-Subdomain"] = subdomain;
  }

  return headers;
}

/**
 * Build headers for backend API calls with custom additions
 * Extends buildBFFHeaders() with additional custom headers
 * 
 * @param customHeaders - Additional headers to merge
 * @returns {Promise<HeadersInit>} Merged headers object
 */
export async function buildBFFHeadersWithCustom(customHeaders: HeadersInit = {}): Promise<HeadersInit> {
  const baseHeaders = await buildBFFHeaders();
  return {
    ...baseHeaders,
    ...customHeaders,
  };
}

/**
 * Check if request is subdomain-based or path-based
 * Useful for conditional logic during migration period
 * 
 * @returns {Promise<boolean>} true if subdomain detected
 */
export async function isSubdomainRequest(): Promise<boolean> {
  const subdomain = await extractTenantSubdomain();
  return subdomain !== null;
}

/**
 * Get tenant identifier (subdomain or tenantId from path)
 * Priority: subdomain > path parameter
 * 
 * @param pathTenantId - TenantId from URL path (fallback)
 * @returns {Promise<string | null>} Tenant identifier
 */
export async function getTenantIdentifier(pathTenantId?: string): Promise<string | null> {
  const subdomain = await extractTenantSubdomain();
  
  if (subdomain) {
    return subdomain;
  }
  
  if (pathTenantId) {
    return pathTenantId;
  }
  
  return null;
}

export default {
  extractTenantSubdomain,
  buildBFFHeaders,
  buildBFFHeadersWithCustom,
  isSubdomainRequest,
  getTenantIdentifier,
};
