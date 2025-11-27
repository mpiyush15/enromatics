/**
 * BFF Route: /api/accounts/overview
 * Proxies to Express backend: GET /api/accounts/overview
 * 
 * Purpose: Fetch accounts/financial overview with caching
 * Cache TTL: 5 minutes (financial data updates less frequently)
 * 
 * Features:
 * - In-memory caching for 5 minutes
 * - Smart cache invalidation on mutations
 * - X-Cache header (HIT/MISS)
 * - Query parameter support (date filtering)
 * - Cookie forwarding for authentication
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://enromatics.com";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 50;

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
}, 60000); // Cleanup every minute

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const params = url.searchParams.toString();
  return `accounts:overview:${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);
    const now = Date.now();

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Accounts Overview Cache HIT (age:', now - cachedEntry.timestamp, 'ms)');
      
      const response = NextResponse.json(cachedEntry.data);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', 'public, max-age=300');
      response.headers.set('Age', Math.floor((now - cachedEntry.timestamp) / 1000).toString());
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
      cache.set(cacheKey, { data, timestamp: now });
      
      // Cleanup cache if too large
      if (cache.size > MAX_CACHE_ENTRIES) {
        const firstKey = cache.keys().next().value as string;
        if (firstKey) cache.delete(firstKey);
      }
      
      console.log('[BFF] Accounts Overview Cache MISS (fresh data from backend)');
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

/**
 * Invalidate cache for accounts overview
 * Called internally when mutations occur
 */
export function invalidateAccountsOverviewCache() {
  cache.clear();
  console.log('[BFF] Accounts Overview cache cleared due to mutation');
}
