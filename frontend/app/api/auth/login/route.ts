/**
 * BFF Auth Login Route
 * 
 * This route:
 * 1. Receives login request from frontend
 * 2. Forwards to Express backend with subdomain type for role validation
 * 3. Express sets httpOnly cookie on response
 * 4. We forward the Set-Cookie header to browser
 * 5. Returns cleaned user data
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
    const expressUrl = (process as any).env?.EXPRESS_BACKEND_URL;
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

    // Get subdomain type from cookie (set by middleware)
    const cookieStore = await cookies();
    const subdomainType = cookieStore.get('subdomain-type')?.value;
    console.log('🌐 Subdomain type from cookie:', subdomainType);

    // Call Express backend (no subdomain header needed for public login)
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(extractCookies(request) && { 'Cookie': extractCookies(request) }), // Forward existing cookies
          ...(subdomainType && { 'X-Subdomain-Type': subdomainType }), // Pass subdomain type for role validation
        },
        credentials: 'include', // ✅ CRITICAL: Ensure cookies are sent
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
      token: data.token, // ✅ Include JWT token in response for client storage
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.name,
        role: data.user?.role,
        tenantId: data.user?.tenantId,
        tenant: data.user?.tenant, // Include tenant info
      },
      message: data.message || 'Login successful',
    });

    // Forward Set-Cookie header from Express to browser (for BFF routes)
    const setCookieHeader = expressResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🍪 Forwarding Set-Cookie header to browser');
      bffResponse.headers.set('set-cookie', setCookieHeader);
    }

    console.log('📤 Returning login response with token and user:', data.user?.email);
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
