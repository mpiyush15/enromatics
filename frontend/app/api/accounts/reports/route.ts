/**
 * BFF Route: /api/accounts/reports
 * Proxies to Express backend: GET /api/accounts/reports
 * 
 * Purpose: Fetch financial reports (profit & loss analysis) with Redis caching
 * Cache TTL: 5 minutes (financial reports don't change frequently)
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return `${CACHE_KEYS.ACCOUNTS_OVERVIEW(tenantId, '')}_reports_${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Accounts Reports Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }

    // Cache miss - fetch from backend
    const url = new URL(request.url);
    const backendUrl = new URL("/api/accounts/reports", BACKEND_URL);
    
    // Forward query parameters (startDate, endDate, etc.)
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
      console.error('❌ BFF Accounts Reports GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch financial reports' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
      console.log('[BFF] Accounts Reports Cache MISS - cached for 5 min');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Accounts Reports GET error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
