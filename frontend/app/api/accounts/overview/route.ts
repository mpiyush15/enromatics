/**
 * BFF Route: /api/accounts/overview
 * Proxies to Express backend: GET /api/accounts/overview
 * 
 * Purpose: Fetch accounts/financial overview with Redis caching
 * Cache TTL: 5 minutes (financial data updates less frequently)
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_KEYS, CACHE_TTL, invalidateAccountsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return CACHE_KEYS.ACCOUNTS_OVERVIEW(tenantId, params);
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Accounts Overview Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }

    // Cache miss - fetch from backend
    const url = new URL(request.url);
    const backendUrl = new URL("/api/accounts/overview", BACKEND_URL);
    
    // Forward query parameters
    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // Get cookies from request
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
      console.error('❌ BFF Accounts Overview GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch accounts overview' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
      console.log('[BFF] Accounts Overview Cache MISS - cached for 5 min');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Accounts Overview GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Re-export for backwards compatibility
export { invalidateAccountsCache as invalidateAccountsOverviewCache } from '@/lib/redis';
