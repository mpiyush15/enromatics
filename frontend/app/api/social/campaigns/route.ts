import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(request: NextRequest): string {
  const adAccountId = request.nextUrl.searchParams.get('adAccountId') || '';
  const searchParams = new URLSearchParams(request.nextUrl.search);
  searchParams.delete('adAccountId');
  return `social:campaigns:${adAccountId}:${JSON.stringify(Object.fromEntries(searchParams))}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);
    const adAccountId = request.nextUrl.searchParams.get('adAccountId') || '';

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

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
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/facebook/ad-accounts/${adAccountId}/campaigns`,
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
    console.error('Campaigns error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    // POST requests bypass cache
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/facebook/campaigns/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    // Invalidate campaign caches on create
    await redisCache.delPattern('social:campaigns:*');

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
