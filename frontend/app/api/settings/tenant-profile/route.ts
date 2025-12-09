/**
 * BFF Route: /api/settings/tenant-profile
 * Purpose: Tenant profile settings with Redis caching
 * Cache TTL: 10 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_KEYS, CACHE_TTL, invalidateSettingsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(tenantId: string): string {
  return CACHE_KEYS.TENANT_PROFILE(tenantId);
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

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Tenant Profile Cache HIT');
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
      `${BACKEND_URL}/api/tenants/${tenantId}`,
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
      await redisCache.set(cacheKey, data, CACHE_TTL.LONG);
      console.log('[BFF] Tenant Profile Cache MISS - cached for 10 min');
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('Tenant profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenant profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // PUT - update tenant (no caching)
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/tenants/${tenantId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    // Invalidate cache on update
    await invalidateSettingsCache(tenantId);
    console.log('[BFF] Tenant Profile cache invalidated after PUT');

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Update tenant profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update tenant profile' },
      { status: 500 }
    );
  }
}
