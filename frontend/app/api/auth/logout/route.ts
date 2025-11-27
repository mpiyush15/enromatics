/**
 * BFF Auth Logout Route
 * 
 * POST /api/auth/logout
 * Clears JWT cookie and logs out user from Express backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

export async function POST(request: NextRequest) {
  try {
    // Call Express backend to clear session
    const expressResponse = await fetch(
      `${process.env.EXPRESS_BACKEND_URL}/api/auth/logout`,
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

    // Forward Set-Cookie header from Express (to clear cookies)
    const setCookieHeader = expressResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      bffResponse.headers.set('set-cookie', setCookieHeader);
    }

    return bffResponse;
  } catch (error) {
    console.error('❌ BFF Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
