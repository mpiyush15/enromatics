import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for demo requests
const cache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes - demo list changes infrequently
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query string
    const queryString = new URLSearchParams();
    queryString.append('page', page);
    queryString.append('limit', limit);
    if (status) queryString.append('status', status);
    if (search) queryString.append('search', search);

    const cacheKey = `demo-requests:${queryString.toString()}`;
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_TTL) {
        const response = NextResponse.json(cached.data);
        response.headers.set('X-Cache', 'HIT');
        return response;
      } else {
        cache.delete(cacheKey);
      }
    }

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Fetch from backend
    const response = await fetch(
      `${BACKEND_URL}/api/demo-requests?${queryString.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error(`❌ Backend demo requests API error: ${response.status}`);
      return NextResponse.json(
        { message: 'Failed to fetch demo requests from backend' },
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
    console.error('❌ Demo Requests BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch demo requests', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/demo-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Backend demo request creation error: ${response.status}`);
      return NextResponse.json(data, { status: response.status });
    }

    // Invalidate cache on new demo request
    cache.clear();

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('❌ Demo Request Creation Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to create demo request', error: error.message },
      { status: 500 }
    );
  }
}
