/**
 * BFF Auth Login Route
 * 
 * This route:
 * 1. Receives login request from frontend
 * 2. Forwards to Express backend
 * 3. Express sets httpOnly cookie on response
 * 4. We forward the Set-Cookie header to browser
 * 5. Returns cleaned user data
 */

import { NextRequest, NextResponse } from 'next/server';
import { callExpressBackend, extractCookies } from '@/lib/bff-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call Express backend
    const expressResponse = await fetch(
      `${process.env.EXPRESS_BACKEND_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: expressResponse.status }
      );
    }

    // Create BFF response with cleaned user data
    const bffResponse = NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.name,
        role: data.user?.role,
        tenantId: data.user?.tenantId,
      },
      message: data.message || 'Login successful',
    });

    // Forward Set-Cookie header from Express to browser
    // This is crucial - Express sets httpOnly JWT cookie
    const setCookieHeader = expressResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      bffResponse.headers.set('set-cookie', setCookieHeader);
    }

    return bffResponse;
  } catch (error) {
    console.error('❌ BFF Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
