/**
 * BFF Auth Login Route
 * 
 * This route:
 * 1. Receives login request from frontend
 * 2. Forwards to Express backend with tenant subdomain for validation
 * 3. Express validates user belongs to tenant
 * 4. Express sets httpOnly cookie on response
 * 5. We forward the Set-Cookie header to browser
 * 6. Returns cleaned user data
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callExpressBackend, extractCookies } from '@/lib/bff-client';
import { buildBFFHeaders } from '@/lib/bffHelpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, subdomain } = body;

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
    console.log('🌐 Subdomain from request:', subdomain || 'NONE (main domain)');

    // Build headers with tenant subdomain (for tenant ownership validation)
    const headers = await buildBFFHeaders();
    console.log('🌐 Base headers for login:', headers);
    
    // Add subdomain header if provided by frontend
    if (subdomain) {
      (headers as Record<string, string>)['X-Tenant-Subdomain'] = subdomain;
      console.log('🌐 Added X-Tenant-Subdomain header:', subdomain);
    }

    // Create abort controller with 30 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Call Express backend with tenant subdomain header
      const expressResponse = await fetch(
        `${expressUrl}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(extractCookies(request) && { 'Cookie': extractCookies(request) }), // Forward existing cookies
            ...headers, // Include X-Tenant-Subdomain if present
          },
          credentials: 'include', // ✅ CRITICAL: Ensure cookies are sent
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Parse response safely
      let data;
      try {
        data = await expressResponse.json();
      } catch (parseError) {
        console.error('❌ Failed to parse Express response:', parseError);
        console.error('Response status:', expressResponse.status);
        console.error('Response text:', await expressResponse.text());
        return NextResponse.json(
          { 
            success: false, 
            message: 'Backend error - invalid response',
            error: 'Failed to parse backend response'
          },
          { status: 502 }
        );
      }

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
      clearTimeout(timeoutId);

      // Handle timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏱️ Login request timeout (30s)');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Request timeout. Please try again.',
            error: 'Request timed out after 30 seconds'
          },
          { status: 504 }
        );
      }

      // Handle other errors
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
  } catch (outerError) {
    console.error('❌ Outer error in login:', outerError);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: (outerError as Error).message 
      },
      { status: 500 }
    );
  }
}
