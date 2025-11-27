/**
 * BFF Route: /api/accounts/expenses
 * Proxies to Express backend: GET/POST /api/accounts/expenses
 * 
 * Purpose: Handle expense management
 * Cache TTL: 5 minutes (expenses don't change frequently)
 * 
 * Supported operations:
 * - GET /api/accounts/expenses - List expenses with filters (cached)
 * - POST /api/accounts/expenses - Create expense (not cached)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

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
}, 60000);

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const params = url.searchParams.toString();
  return `expenses:list:${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);
    const now = Date.now();

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Expenses List Cache HIT (age:', now - cachedEntry.timestamp, 'ms)');
      
      const response = NextResponse.json(cachedEntry.data);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', 'public, max-age=300');
      response.headers.set('Age', Math.floor((now - cachedEntry.timestamp) / 1000).toString());
      return response;
    }

    // Cache miss - fetch from backend
    const url = new URL(request.url);
    const backendUrl = new URL("/api/accounts/expenses", BACKEND_URL);
    
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
      console.error('❌ BFF Expenses GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch expenses' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      cache.set(cacheKey, { data, timestamp: now });
      
      if (cache.size > MAX_CACHE_ENTRIES) {
        const firstKey = cache.keys().next().value as string;
        if (firstKey) cache.delete(firstKey);
      }
      
      console.log('[BFF] Expenses List Cache MISS (fresh data from backend)');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Expenses GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Invalidate cache for any POST operations
    cache.clear();
    console.log('[BFF] Expenses cache cleared due to mutation (POST)');

    const backendUrl = new URL("/api/accounts/expenses", BACKEND_URL);
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
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Expenses POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export function invalidateExpensesCache() {
  cache.clear();
  console.log('[BFF] Expenses cache cleared due to mutation');
}
