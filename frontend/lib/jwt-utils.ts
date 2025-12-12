import { NextRequest } from 'next/server';

/**
 * Extract JWT token from request
 * Tries multiple sources in order:
 * 1. Authorization header (Bearer token)
 * 2. jwt cookie (for backward compatibility)
 */
export function extractJWT(request: NextRequest): string | null {
  // Try Authorization header first (primary method for scalability)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('✅ JWT extracted from Authorization header');
    return token;
  }

  // Fallback to jwt cookie (for backward compatibility)
  const cookieToken = request.cookies.get('jwt')?.value;
  if (cookieToken) {
    console.log('⚠️ JWT extracted from cookie (fallback)');
    return cookieToken;
  }

  console.log('❌ No JWT found in Authorization header or cookies');
  return null;
}

/**
 * Log JWT extraction attempt (for debugging)
 */
export function logJWTExtraction(request: NextRequest, token: string | null) {
  if (token) {
    const tokenPreview = token.substring(0, 20) + '...';
    console.log(`🔐 JWT: ${tokenPreview}`);
  }
}
