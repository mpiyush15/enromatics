/**
 * BFF Staff Data Route
 * 
 * GET /api/staff - List all staff
 * POST /api/staff - Create staff
 * 
 * Features:
 * - Redis caching with in-memory fallback (5 min TTL)
 * - Cache invalidation on mutations
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL, invalidateStaffCache } from '@/lib/redis';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(tenantId: string, search: string): string {
  return `staff:list:${tenantId}:${search}`;
}

// GET /api/staff
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const endpoint = `/api/staff${url.search}`;

    // Check Redis cache first
    const tenantId = url.searchParams.get('tenantId') || 'default';
    const cacheKey = getCacheKey(tenantId, url.search);
    const cachedData = await redisCache.get<any>(cacheKey);

    if (cachedData) {
      const cacheType = redisCache.isConnected() ? 'REDIS' : 'MEMORY';
      console.log(`[BFF] Staff Cache HIT (${cacheType})`);
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': cacheType,
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    const fetchOptions = buildBackendFetchOptions(request, 'GET');

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, fetchOptions);

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch staff' },
        { status: backendResponse.status }
      );
    }

    const cleanData = { success: true, ...data };

    // Cache the response in Redis
    await redisCache.set(cacheKey, cleanData, CACHE_TTL.MEDIUM);
    const cacheType = redisCache.isConnected() ? 'REDIS' : 'MEMORY';
    console.log(`[BFF] Staff Cache MISS (stored in ${cacheType})`);

    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Type': cacheType,
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('❌ Staff BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create staff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = `/api/staff`;

    const fetchOptions = buildBackendFetchOptions(request, 'POST', body);

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, fetchOptions);

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, ...data },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on create
    const tenantId = body.tenantId || 'default';
    await invalidateStaffCache(tenantId);
    console.log('[BFF] Staff cache invalidated due to create');

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ Staff Create BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
