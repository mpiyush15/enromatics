import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(request: NextRequest): string {
  const searchParams = request.nextUrl.searchParams;
  return `whatsapp-contacts-${JSON.stringify(Object.fromEntries(searchParams))}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);
    const now = Date.now();

    // Check cache (5 min TTL)
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.data, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';

    // Fetch from backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/whatsapp/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();

    // Cache the response
    if (backendResponse.ok) {
      cache.set(cacheKey, { data, timestamp: now });

      // Cache cleanup - remove oldest if exceeds 50 entries
      if (cache.size > 50) {
        const firstKey = cache.keys().next().value as string;
        if (firstKey) cache.delete(firstKey);
      }
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('Contacts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    // POST requests bypass cache
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    // Invalidate contacts caches on create
    Array.from(cache.keys()).forEach((key) => {
      if (key.startsWith('whatsapp-contacts-')) {
        cache.delete(key);
      }
    });

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 500 }
    );
  }
}
