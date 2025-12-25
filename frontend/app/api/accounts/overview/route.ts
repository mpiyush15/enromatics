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
    // Skip Redis cache - fetch fresh data every time for real-time accuracy
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
      cache: 'no-store', // Force fresh fetch from backend
    });

    if (!backendResponse.ok) {
      console.error('❌ BFF Accounts Overview GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch accounts overview' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Return fresh data without caching
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
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
