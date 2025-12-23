/**
 * BFF Route: /api/accounts/expenses
 * Proxies to Express backend: GET/POST /api/accounts/expenses
 * 
 * Purpose: Handle expense management with Redis caching
 * Cache TTL: 5 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_KEYS, CACHE_TTL, invalidateAccountsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return CACHE_KEYS.EXPENSES_LIST(tenantId, params);
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Expenses List Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=300');
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
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
      console.log('[BFF] Expenses List Cache MISS - cached for 5 min');
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
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
    
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
    
    // Invalidate cache after mutation
    if (backendResponse.ok && tenantId) {
      await invalidateAccountsCache(tenantId);
      console.log('[BFF] Expenses cache invalidated after POST');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Expenses POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Re-export for backwards compatibility
export { invalidateAccountsCache as invalidateExpensesCache } from '@/lib/redis';
