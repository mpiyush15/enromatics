import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(tenantId: string): string {
  return `settings:staff-list:${tenantId}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId') || '';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(tenantId);

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
      `${BACKEND_URL}/api/auth/users?tenantId=${tenantId}`,
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
    console.error('Staff list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch staff list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId') || '';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const cookies = request.headers.get('cookie') || '';

    // POST - create staff (no caching)
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/auth/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify({ ...body, tenantId }),
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    // Invalidate cache on create
    const cacheKey = getCacheKey(tenantId);
    await redisCache.del(cacheKey);

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create staff' },
      { status: 500 }
    );
  }
}
