import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// In-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - config changes rarely

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  return `whatsapp:config:${url.search}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);
    const now = Date.now();

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] WhatsApp Config Cache HIT');
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=600',
        },
      });
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    const url = new URL(request.url);

    console.log('📤 Fetching WhatsApp config from backend');

    // Fetch from backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/whatsapp/config${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    console.log(`📍 Backend response status: ${backendResponse.status}`);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`❌ Backend WhatsApp config error: ${backendResponse.status}`, errorText);
      
      return NextResponse.json(
        { 
          message: 'Failed to fetch WhatsApp config',
          status: backendResponse.status,
          details: errorText
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    cache.set(cacheKey, { data, timestamp: now });

    // Cleanup old cache entries
    if (cache.size > 50) {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL * 2) {
          cache.delete(key);
        }
      }
    }

    console.log('✅ WhatsApp config fetched successfully');
    
    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (error: any) {
    console.error('❌ WhatsApp Config BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';
    const url = new URL(request.url);

    console.log('📤 Updating WhatsApp config via backend');

    const backendResponse = await fetch(`${BACKEND_URL}/api/whatsapp/config${url.search}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`❌ Backend PUT error: ${backendResponse.status}`, errorText);
      
      return NextResponse.json(
        { 
          message: 'Failed to update WhatsApp config',
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Invalidate cache on update
    cache.clear();
    console.log('[BFF] WhatsApp config cache cleared due to mutation');

    console.log('✅ WhatsApp config updated successfully');

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('❌ WhatsApp Config PUT Error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
