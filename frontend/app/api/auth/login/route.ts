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

    // Check if EXPRESS_BACKEND_URL is configured
    const expressUrl = process.env['EXPRESS_BACKEND_URL'] || process.env.EXPRESS_BACKEND_URL;
    if (!expressUrl) {
      console.error('❌ EXPRESS_BACKEND_URL not configured in environment');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend configuration error. Please contact support.',
          error: 'EXPRESS_BACKEND_URL not set' 
        },
        { status: 500 }
      );
    }

    console.log('📤 Calling Express backend:', `${expressUrl}/api/auth/login`);

    // Call Express backend
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/login`,
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
      console.error('❌ Express returned error:', expressResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Express login successful');

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
      console.log('🍪 Forwarding Set-Cookie header to browser');
      bffResponse.headers.set('set-cookie', setCookieHeader);
    }

    return bffResponse;
  } catch (error) {
    console.error('❌ BFF Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
