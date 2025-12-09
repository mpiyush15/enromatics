/**
 * BFF Route: /api/social/status
 * Purpose: Social media connection status with Redis caching
 * Cache TTL: 3 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(request: NextRequest): string {
  const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default';
  return `social:status:${tenantId}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Social Status Cache HIT');
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
    const backendResponse = await fetch(`${BACKEND_URL}/api/facebook/status`, {
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
      await redisCache.set(cacheKey, data, CACHE_TTL.SHORT);
      console.log('[BFF] Social Status Cache MISS - cached for 2 min');
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('Social status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch social media status' },
      { status: 500 }
    );
  }
}
