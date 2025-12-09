import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(role: string, tenantId?: string): string {
  return `sidebar:${role}:${tenantId || 'global'}`;
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';

    // Fetch from backend with cookies to get authenticated user's role
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/ui/sidebar`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch sidebar' },
        { status: backendResponse.status }
      );
    }

    // Cache the response based on role and tenantId (30 minutes - sidebar rarely changes)
    const cacheKey = getCacheKey(data.role, data.tenantId);
    
    // Check if we already have this cached
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
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
    console.error('Sidebar error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sidebar' },
      { status: 500 }
    );
  }
}
