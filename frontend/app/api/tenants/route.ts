import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for tenants list
const cache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes - tenants list changes infrequently

export async function GET(req: NextRequest) {
  try {
    const cacheKey = 'tenants:list';
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_TTL) {
        // Return cached response
        const response = NextResponse.json(cached.data);
        response.headers.set('X-Cache', 'HIT');
        return response;
      } else {
        // Cache expired, remove it
        cache.delete(cacheKey);
      }
    }

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Fetch from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/tenants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`❌ Backend tenants API error: ${response.status}`);
      return NextResponse.json(
        { message: 'Failed to fetch tenants from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Cache the response
    cache.set(cacheKey, { data, timestamp: now });

    // Cleanup cache if it gets too large
    if (cache.size > 200) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    const result = NextResponse.json(data);
    result.headers.set('X-Cache', 'MISS');
    return result;
  } catch (error: any) {
    console.error('❌ Tenants BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch tenants', error: error.message },
      { status: 500 }
    );
  }
}
