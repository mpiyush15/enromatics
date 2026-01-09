import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';
import { getApiUrl } from '@/lib/apiConfig';

function getCacheKey(role: string, tenantId?: string): string {
  return `sidebar:${role}:${tenantId || 'global'}`;
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';
    let authorization = request.headers.get('authorization') || '';

    console.log('🔍 Sidebar BFF - Received request');
    console.log('   Has cookie:', !!cookies);
    console.log('   Has auth:', !!authorization);

    // Fetch from backend with cookies to get authenticated user's role
    // 🔥 FIX: Use getApiUrl() so it respects environment (localhost vs production)
    const backendUrl = getApiUrl('/api/ui/sidebar');
    console.log('   Backend URL:', backendUrl);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookies,
    };

    // Pass Authorization header if it exists
    if (authorization) {
      headers['Authorization'] = authorization;
    } else if (process.env.NODE_ENV === 'development') {
      // 🟡 DEV MODE: If no auth header, pass a dev token for testing
      console.warn('⚠️  DEV MODE: No Authorization header, using dev token');
      headers['X-User-Id'] = 'dev-user';
    }

    console.log('   Sending headers:', Object.keys(headers));

    const backendResponse = await fetch(
      backendUrl,
      {
        method: 'GET',
        headers,
        credentials: 'include',
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

    // Cache the response based on role and tenantId (30 minutes - sidebar rarely changes)
    const cacheKey = getCacheKey(data.role, data.tenantId);
    
    // Check if we already have this cached
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('   📦 Returning from cache');
      return NextResponse.json(cached, {
        headers: { 
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
      });
    }

    // Cache for 30 minutes
    await redisCache.set(cacheKey, data, CACHE_TTL.VERY_LONG);

    return NextResponse.json(data, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
    });
  } catch (error: any) {
    console.error('❌ Sidebar error:', error.message);
    console.error('   Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sidebar', status: 'error' },
      { status: 500 }
    );
  }
}
