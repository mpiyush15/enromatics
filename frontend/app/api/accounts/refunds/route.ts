/**
 * BFF Route: /api/accounts/refunds
 * Purpose: Handle refund management with Redis caching
 * Cache TTL: 3 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_TTL, invalidateAccountsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return `refunds:list:${tenantId}:${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Refunds List Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=180');
      return response;
    }

    // Cache miss - fetch from backend
    const url = new URL(request.url);
    const backendUrl = new URL("/api/accounts/refunds", BACKEND_URL);
    
    // Forward query parameters
    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const cookies = request.headers.get('cookie') || '';

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      console.error('❌ BFF Refunds GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch refunds' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      await redisCache.set(cacheKey, data, CACHE_TTL.SHORT);
      console.log('[BFF] Refunds List Cache MISS - cached for 2 min');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=180');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Refunds GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
    
    const backendUrl = new URL("/api/accounts/refunds", BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await backendResponse.json();
    
    // Invalidate cache after mutation
    if (tenantId) {
      await invalidateAccountsCache(tenantId);
      console.log('[BFF] Refunds cache invalidated after POST');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Refunds POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const refundId = pathname.split('/').pop();
    const tenantId = url.searchParams.get('tenantId') || '';

    const backendUrl = new URL(`/api/accounts/refunds/${refundId}`, BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await backendResponse.json();
    
    // Invalidate cache after mutation
    if (tenantId) {
      await invalidateAccountsCache(tenantId);
      console.log('[BFF] Refunds cache invalidated after PATCH');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Refunds PATCH error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Re-export for backwards compatibility
export { invalidateAccountsCache as invalidateRefundsCache } from '@/lib/redis';
