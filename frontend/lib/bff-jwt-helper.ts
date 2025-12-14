/**
 * BFF JWT Helper Utilities
 * 
 * Provides functions for extracting and using JWT tokens in BFF routes
 * Supports JWT from both Authorization header (Bearer token) and cookies (httpOnly)
 */

import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Extract JWT token from request
 * 
 * Tries to extract from:
 * 1. Authorization header (Bearer token)
 * 2. Cookies (httpOnly jwt cookie)
 * 
 * @param request - NextRequest object
 * @returns JWT token string or null
 */
export function extractJwtToken(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Try cookies (httpOnly jwt cookie)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('jwt=')) {
        return cookie.slice(4);
      }
    }
  }

  return null;
}

/**
 * Get the backend URL for API calls
 * 
 * @returns Backend URL
 */
export function getBackendUrl(): string {
  return BACKEND_URL;
}

/**
 * Create headers for backend request with JWT token
 * 
 * Includes:
 * - Content-Type: application/json
 * - Authorization: Bearer <token>
 * - X-Tenant-Guard: true (optional)
 * 
 * @param token - JWT token
 * @param includeAuthHeader - Whether to include Authorization header (default: true)
 * @returns Headers object for fetch request
 */
export function createBackendHeaders(
  token: string,
  includeAuthHeader: boolean = true
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuthHeader && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}


