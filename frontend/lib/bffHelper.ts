/**
 * BFF Helper Utilities
 * 
 * Provides helper functions for BFF routes to call Express backend
 */

import { NextRequest } from 'next/server';

interface BuildFetchOptionsParams {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Build fetch options for calling Express backend from BFF route
 * 
 * Automatically includes:
 * - Cookies from incoming request
 * - X-Tenant-Subdomain header (extracted from Host header)
 * - Proper headers
 * - Request body if provided
 * 
 * @param req - NextRequest from BFF route handler
 * @param method - HTTP method (default: GET)
 * @param body - Optional request body
 * @param customHeaders - Optional custom headers to merge
 * @returns RequestInit object for fetch call
 */
export function buildBackendFetchOptions(
  req: NextRequest,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): RequestInit {
  // Extract cookies from incoming request
  const cookies = req.headers.get('cookie') || '';
  
  // Extract tenant subdomain from Host header
  const host = req.headers.get('host') || '';
  let tenantSubdomain = '';
  
  if (host) {
    const hostname = host.split(':')[0]; // Remove port
    const parts = hostname.split('.');
    
    // For prasamagar.lvh.me (3 parts)
    if (hostname.includes('lvh.me') && parts.length >= 3) {
      tenantSubdomain = parts[0];
    }
    // For prasamagar.enromatics.com (3 parts)
    else if (hostname.includes('enromatics.com') && parts.length >= 3) {
      tenantSubdomain = parts[0];
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };
  
  // Add tenant subdomain header if available
  if (tenantSubdomain) {
    headers['X-Tenant-Subdomain'] = tenantSubdomain;
  }

  // Forward cookies
  if (cookies) {
    headers['Cookie'] = cookies;
  }

  // Build fetch options
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies in request
  };

  // Add body if provided
  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}

/**
 * Extract cookies from a NextRequest
 * 
 * @param request - NextRequest object
 * @returns Cookie string or empty string
 */
export function extractCookies(request: NextRequest): string {
  return request.headers.get('cookie') || '';
}
