import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(request: NextRequest): string {
  const searchParams = request.nextUrl.searchParams;
  return `social:instagram-accounts:${JSON.stringify(Object.fromEntries(searchParams))}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache (5 min TTL)
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
      });
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';

    // Fetch from backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/facebook/instagram-accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();

    // Cache the response
    if (backendResponse.ok) {
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    }

    return NextResponse.json(data, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('Instagram accounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Instagram accounts' },
      { status: 500 }
    );
  }
}
