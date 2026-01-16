/**
 * Tenant Context Middleware
 * Detects subdomain and maps to tenant ID
 * Usage: Extract subdomain from request headers
 */

export function extractTenantFromHost(host: string): string | null {
  if (!host) return null;
  
  // Remove port number (localhost:3000 -> localhost)
  const hostWithoutPort = host.split(':')[0];
  
  // Split by dots
  const parts = hostWithoutPort.split('.');
  
  // Local development: prasanagar.lvh.me -> prasanagar
  if (parts.length >= 2 && (hostWithoutPort.includes('lvh.me') || hostWithoutPort.includes('localhost'))) {
    return parts[0]; // Return subdomain as tenant ID
  }
  
  // Production: prasanagar.enromatics.co -> prasanagar
  if (parts.length >= 3 && hostWithoutPort.includes('enromatics.co')) {
    return parts[0]; // Return subdomain as tenant ID
  }
  
  return null;
}

/**
 * Get tenant ID from browser window location
 * For client-side usage
 */
export function getTenantFromBrowser(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const subdomain = extractTenantFromHost(hostname);
  
  // Map URL subdomain to actual tenant subdomain (in case of typos/aliases)
  const subdomainMapping: { [key: string]: string } = {
    'prasanagar': 'prasamagar',  // Common typo
  };
  
  const mappedSubdomain = subdomainMapping[subdomain || ''] || subdomain;
  return mappedSubdomain;
}
