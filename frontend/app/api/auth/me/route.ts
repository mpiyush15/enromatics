/**
 * BFF Auth Me Route
 * 
 * GET /api/auth/me
 * Returns current logged-in user from Express backend
 * Uses cookies from browser to authenticate
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

export async function GET(request: NextRequest) {
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

    // Extract cookies from incoming request - try both methods
    let cookies = '';
    
    // Method 1: Try headers
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      cookies = cookieHeader;
      console.log('✅ Auth Me - Got cookies from headers:', cookies.substring(0, 50));
    } else {
      // Method 2: Try request.cookies (Next.js native)
      try {
        const cookieList = request.cookies.getAll();
        if (cookieList.length > 0) {
          cookies = cookieList.map(c => `${c.name}=${c.value}`).join('; ');
          console.log('✅ Auth Me - Got cookies from request.cookies:', cookies.substring(0, 50));
        }
      } catch (e) {
        console.warn('⚠️ Failed to access request.cookies');
      }
    }
    
    if (!cookies) {
      console.warn('⚠️ AUTH ME: No cookies found in request!');
    }

    // Build headers with cookie
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
      console.log('✅ Auth Me - Added Cookie header to backend request');
    }

    // Call Express backend with cookies for authentication
    console.log('📤 Auth Me - Calling backend /api/auth/me...');
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/me`,
      {
        method: 'GET',
        headers,
        // CRITICAL: This ensures cookies are sent by the browser to the backend
        credentials: 'include',
      }
    );
    
    console.log('📥 Auth Me - Backend response status:', expressResponse.status);

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      // If 401 (unauthorized), return null user instead of error status
      // This prevents infinite redirects and lets frontend handle gracefully
      if (expressResponse.status === 401) {
        console.log('⚠️ Auth Me - User not authenticated (401)');
        return NextResponse.json(
          { success: true, user: null },
          { status: 200 } // Return 200 with null user instead of 401
        );
      }
      
      console.error('❌ Auth Me - Backend error:', expressResponse.status, data.message);
      return NextResponse.json(
        { success: false, message: data.message || 'Authentication failed' },
        { status: expressResponse.status }
      );
    }

    // Clean response - only return safe fields
    const cleanUser = {
      success: true,
      user: {
        id: data.user?.id || data.id,
        email: data.user?.email || data.email,
        name: data.user?.name || data.name,
        role: (data.user?.role || data.role)?.toLowerCase(), // ✅ NEW: Normalize to lowercase
        tenantId: data.user?.tenantId || data.tenantId,
        plan: data.user?.plan || data.plan || 'trial', // ✅ Default to 'trial' if missing (for existing users)
        profilePicture: data.user?.profilePicture || data.profilePicture,
        tenant: data.user?.tenant || data.tenant, // Include tenant info
      },
    };

    console.log('✅ Auth Me - User authenticated:', cleanUser.user.email);
    return NextResponse.json(cleanUser);
  } catch (error) {
    console.error('❌ BFF Get User error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
