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
    const { email, password, subdomain, purpose } = body;

    console.log('🔓 [BFF LOGIN] Request received');
    console.log('  - Email:', email);
    console.log('  - Password length:', password?.length);
    console.log('  - Subdomain:', subdomain || 'NONE (main domain)');
    console.log('  - Purpose:', purpose || 'default');

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if EXPRESS_BACKEND_URL is configured
    const expressUrl = (process as any).env?.EXPRESS_BACKEND_URL;
    console.log('  - EXPRESS_BACKEND_URL:', expressUrl);
    
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
    console.log('🎯 Login purpose:', purpose || 'default');

    // Non-tenant subdomains that should NOT be sent to backend
    const nonTenantSubdomains = ['www', 'app', 'api', 'admin', 'staging', 'dev', 'test'];
    const isValidTenantSubdomain = subdomain && !nonTenantSubdomains.includes(subdomain.toLowerCase());

    // Build headers - but we'll handle subdomain separately to avoid duplicates
    const headers = await buildBFFHeaders();
    // Remove any existing X-Tenant-Subdomain from buildBFFHeaders (we'll set it explicitly)
    delete (headers as Record<string, string>)['X-Tenant-Subdomain'];
    
    console.log('🌐 Base headers for login:', headers);
    
    // Add subdomain header ONLY if it's a valid tenant subdomain
    if (isValidTenantSubdomain) {
      (headers as Record<string, string>)['X-Tenant-Subdomain'] = subdomain;
      console.log('🌐 Added X-Tenant-Subdomain header:', subdomain);
    } else {
      console.log('🌐 No tenant subdomain (main domain login)');
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
          body: JSON.stringify({ email, password, purpose }), // ✅ Pass purpose to backend
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
        console.error('❌ [BFF] Express returned error:', expressResponse.status);
        console.error('   - Data:', data);
        return NextResponse.json(
          { success: false, message: data.message || 'Login failed' },
          { status: expressResponse.status }
        );
      }

      console.log('✅ [BFF] Express login successful');

      // ✅ CRITICAL: Set cookie on Vercel domain using Next.js cookies() API
      // This ensures the cookie is stored for subsequent requests to the BFF
      const cookieStore = await cookies();
      if (data.token) {
        console.log('🍪 Setting JWT cookie on Vercel domain (httpOnly, secure, sameSite=none)');
        cookieStore.set('jwt', data.token, {
          httpOnly: true,
          secure: true, // Always secure on production
          sameSite: 'none', // Allow cross-domain
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          path: '/',
        });
      }

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
          plan: data.user?.plan || 'trial', // ✅ Default to 'trial' if missing (for existing users)
          tenant: data.user?.tenant, // Include tenant info
        },
        message: data.message || 'Login successful',
      });

      // Also forward Set-Cookie header from Express as backup
      const setCookieHeader = expressResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('🍪 Also forwarding Set-Cookie header from Express');
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
