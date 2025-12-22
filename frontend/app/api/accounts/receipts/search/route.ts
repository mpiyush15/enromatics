/**
 * BFF Route: /api/accounts/receipts/search
 * Proxies to Express backend: GET /api/accounts/receipts/search
 * 
 * Purpose: Search students for receipt generation with Redis caching
 * Cache TTL: 2 minutes (search results change frequently)
 */

import { NextRequest, NextResponse } from "next/server";
import { redisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return `${CACHE_KEYS.RECEIPTS_LIST(tenantId, '')}_search_${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cacheKey = getCacheKey(request);

    console.log('[BFF] Receipts Search - Request URL:', url.toString());

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Receipts Search Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=120');
      return response;
    }

    // Cache miss - fetch from backend
    const backendUrl = new URL("/api/accounts/receipts/search", BACKEND_URL);
    
    // Forward query parameters
    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('[BFF] Receipts Search - Backend URL:', backendUrl.toString());

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

    console.log('[BFF] Receipts Search - Backend status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ BFF Receipts Search error:', backendResponse.status, errorText);
      return NextResponse.json(
        { success: false, message: 'Failed to search students' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('[BFF] Receipts Search - Found students:', data.students?.length || 0);

    // Cache the response
    if (data.success) {
      await redisCache.set(cacheKey, data, CACHE_TTL.SHORT);
      console.log('[BFF] Receipts Search Cache MISS - cached for 2 min');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=120');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Receipts Search error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
