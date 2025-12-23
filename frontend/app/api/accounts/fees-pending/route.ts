/**
 * BFF Route: /api/accounts/fees-pending
 * Proxies to Express backend: GET /api/accounts/fees-pending
 * 
 * Purpose: Get students with pending fees
 * Cache TTL: 3 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return `${CACHE_KEYS.ACCOUNTS_OVERVIEW(tenantId, '')}_fees_pending_${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Fees Pending Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=180');
      return response;
    }

    // Cache miss - fetch from backend
    const backendUrl = new URL("/api/accounts/fees-pending", BACKEND_URL);
    
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
      console.error('❌ BFF Fees Pending GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch fees pending students' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      await redisCache.set(cacheKey, data, CACHE_TTL.SHORT);
      console.log('[BFF] Fees Pending Cache MISS - cached for 3 min');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=180');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Fees Pending GET error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
