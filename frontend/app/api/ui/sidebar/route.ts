import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

// Simple memory cache for sidebar
const sidebarCache = new Map<string, { data: any; expires: number }>();

function getCacheKey(role: string, tenantId?: string): string {
  return `sidebar:${role}:${tenantId || 'global'}`;
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const authorization = request.headers.get('authorization') || '';

    console.log('🔍 Sidebar BFF - Received request');
    console.log('   Has auth header:', !!authorization);
    console.log('   Cookies available:', cookies.getAll().map(c => c.name).join(', '));

    // Fetch from backend with token
    const backendUrl = getApiUrl('/api/ui/sidebar');
    console.log('   Backend URL:', backendUrl);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get JWT from cookies - IMPORTANT: Must send as Cookie header
    const jwtCookie = cookies.get('jwt');
    const tokenCookie = cookies.get('token'); // Fallback for old cookie name
    let hasToken = false;
    
    if (jwtCookie?.value) {
      // Build cookie string with jwt token
      headers['Cookie'] = `jwt=${jwtCookie.value}`;
      console.log('   ✅ Found JWT cookie, forwarding as Cookie header');
      hasToken = true;
    } else if (tokenCookie?.value) {
      // Fallback for old token cookie name
      headers['Cookie'] = `token=${tokenCookie.value}`;
      console.log('   ✅ Found token cookie (legacy), forwarding as Cookie header');
      hasToken = true;
    } else if (authorization) {
      // Or use Authorization header if provided
      headers['Authorization'] = authorization;
      console.log('   ✅ Using Authorization header');
      hasToken = true;
    } else {
      console.warn('⚠️  No token found in cookies or auth header');
    }

    // Add any other cookies that might be needed
    const cookieHeader = cookies.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('   📦 Forwarding all cookies:', cookies.getAll().map(c => c.name).join(', '));
    }

    const backendResponse = await fetch(
      backendUrl,
      {
        method: 'GET',
        headers,
        // Don't use credentials: 'include' in server-to-server fetch
        // We're manually forwarding cookies via headers instead
      }
    );

    console.log('   Backend response status:', backendResponse.status);

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error(`❌ Sidebar fetch error [${backendResponse.status}]:`, data);
      return NextResponse.json(
        { error: data.message || 'Failed to fetch sidebar', details: data },
        { status: backendResponse.status }
      );
    }

    console.log('   ✅ Got sidebar data, items:', data.sidebar?.length || 0);

    // Cache the response (30 minutes)
    const cacheKey = getCacheKey(data.role, data.tenantId);
    sidebarCache.set(cacheKey, {
      data,
      expires: Date.now() + 30 * 60 * 1000,
    });

    return NextResponse.json(data, {
      headers: { 
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('❌ Sidebar error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sidebar', status: 'error' },
      { status: 500 }
    );
  }
}
