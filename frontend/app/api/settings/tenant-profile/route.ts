import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - tenant profile doesn't change frequently

const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(tenantId: string): string {
  return `settings-tenant-profile-${tenantId}`;
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
    const now = Date.now();

    // Check cache (10 min TTL)
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.data, {
        headers: { 'X-Cache': 'HIT' },
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
      cache.set(cacheKey, { data, timestamp: now });
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
    const cacheKey = getCacheKey(tenantId);
    cache.delete(cacheKey);

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
