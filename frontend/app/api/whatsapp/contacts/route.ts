import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(request: NextRequest): string {
  const searchParams = request.nextUrl.searchParams;
  return `whatsapp:contacts:${JSON.stringify(Object.fromEntries(searchParams))}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache (5 min TTL)
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
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
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    }

    return NextResponse.json(data, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
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
    await redisCache.delPattern('whatsapp:contacts:*');

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
