/**
 * BFF Auth Logout Route
 * 
 * POST /api/auth/logout
 * Clears JWT cookie, tenant-context cookie, and logs out user from Express backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

// Get cookie domain for cross-subdomain support
function getCookieDomain(host: string | null): string | undefined {
  if (!host) return undefined;
  const hostname = host.split(':')[0];
  
  // Production: .enromatics.com for wildcard subdomain support
  if (process.env.NODE_ENV === 'production' && hostname.includes('enromatics.com')) {
    return '.enromatics.com';
  }
  
  // Local testing with lvh.me
  if (hostname.includes('lvh.me')) {
    return '.lvh.me';
  }
  
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    // Check if EXPRESS_BACKEND_URL is configured
    const expressUrl = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!expressUrl) {
      console.error('❌ EXPRESS_BACKEND_URL not configured');
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    // Call Express backend to clear session
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await expressResponse.json();

    // Create BFF response
    const bffResponse = NextResponse.json({
      success: expressResponse.ok,
      message: data.message || 'Logged out successfully',
    });

    // Forward Set-Cookie header from Express (to clear jwt cookie)
    const setCookieHeader = expressResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      bffResponse.headers.set('set-cookie', setCookieHeader);
    }

    // IMPORTANT: Also clear tenant-context cookie with proper domain
    const host = request.headers.get('host');
    const cookieDomain = getCookieDomain(host);
    const isProduction = process.env.NODE_ENV === 'production';
    
    bffResponse.cookies.set('tenant-context', '', {
      domain: cookieDomain,
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return bffResponse;
  } catch (error) {
    console.error('❌ BFF Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
