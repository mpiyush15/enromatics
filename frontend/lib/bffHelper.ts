import { NextRequest } from 'next/server';

/**
 * Helper to extract authentication from request
 * Handles both Bearer tokens and cookies
 */
export function extractAuth(request: NextRequest): { headers: HeadersInit; credentials: RequestCredentials } {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  // Try Bearer token first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    headers['Authorization'] = authHeader;
  }

  // Forward cookies (httpOnly auth cookies)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  return {
    headers,
    credentials: 'include' as RequestCredentials, // Always include credentials
  };
}

/**
 * Helper to build backend fetch options with auth
 */
export function buildBackendFetchOptions(
  request: NextRequest,
  method: string = 'GET',
  body?: any
) {
  const { headers, credentials } = extractAuth(request);

  const options: RequestInit = {
    method,
    headers,
    credentials,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}
