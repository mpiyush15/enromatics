import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(request: NextRequest): string {
  const searchParams = request.nextUrl.searchParams;
  return `whatsapp:conversations:${JSON.stringify(Object.fromEntries(searchParams))}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache (2 min TTL - conversations change frequently)
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
    const searchParams = request.nextUrl.searchParams;

    // Build query string
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/inbox/conversations${queryString}`,
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

    // Cache the response (shorter TTL for conversations)
    if (backendResponse.ok) {
      await redisCache.set(cacheKey, data, CACHE_TTL.SHORT);
    }

    return NextResponse.json(data, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('Inbox conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inbox conversations' },
      { status: 500 }
    );
  }
}
