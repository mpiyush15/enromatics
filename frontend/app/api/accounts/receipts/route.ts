/**
 * BFF Route: /api/accounts/receipts
 * Proxies to Express backend: GET/POST /api/accounts/receipts/*
 * 
 * Purpose: Handle fee receipt operations with Redis caching
 * Cache TTL: 3 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { redisCache, CACHE_KEYS, CACHE_TTL, invalidateAccountsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return CACHE_KEYS.RECEIPTS_LIST(tenantId, params);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const cacheKey = getCacheKey(request);

    // Check Redis cache for search operations
    if (pathname.includes('/search')) {
      const cached = await redisCache.get<any>(cacheKey);
      if (cached) {
        console.log('[BFF] Receipts Search Cache HIT');
        
        const response = NextResponse.json(cached);
        response.headers.set('X-Cache', 'HIT');
        response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
        response.headers.set('Cache-Control', 'public, max-age=180');
        return response;
      }

      // Cache miss - fetch from backend
      const backendUrl = new URL("/api/accounts/receipts/search", BACKEND_URL);
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
        console.error('❌ BFF Receipts Search GET error:', backendResponse.status);
        return NextResponse.json(
          { success: false, message: 'Failed to search students' },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();

      // Cache the response
      if (data.success) {
        await redisCache.set(cacheKey, data, CACHE_TTL.SHORT);
        console.log('[BFF] Receipts Search Cache MISS - cached for 2 min');
      }

      const response = NextResponse.json(data);
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('Cache-Control', 'public, max-age=180');
      return response;
    }

    // For other GET requests, just forward without caching
    const backendUrl = new URL(pathname.replace('/api/accounts', '/api/accounts'), BACKEND_URL);
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

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Receipts GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const tenantId = url.searchParams.get('tenantId') || '';

    // Determine backend endpoint
    let backendEndpoint = "/api/accounts/receipts/create";
    
    if (pathname.includes('/generate/')) {
      const paymentId = pathname.split('/').pop();
      backendEndpoint = `/api/accounts/receipts/generate/${paymentId}`;
    }

    const backendUrl = new URL(backendEndpoint, BACKEND_URL);
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
    if (backendResponse.ok && tenantId) {
      await invalidateAccountsCache(tenantId);
      console.log('[BFF] Receipts cache invalidated after POST');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Receipts POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Re-export for backwards compatibility
export { invalidateAccountsCache as invalidateReceiptsCache } from '@/lib/redis';
