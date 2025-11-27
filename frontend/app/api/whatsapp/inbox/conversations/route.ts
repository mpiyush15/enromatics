import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(request: NextRequest): string {
  const searchParams = request.nextUrl.searchParams;
  return `whatsapp-inbox-conversations-${JSON.stringify(Object.fromEntries(searchParams))}`;
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
    const searchParams = request.nextUrl.searchParams;

    // Build query string
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/inbox/conversations${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

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
    console.error('Inbox conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inbox conversations' },
      { status: 500 }
    );
  }
}
