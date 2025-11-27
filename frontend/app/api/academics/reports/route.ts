import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

// In-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (reports don't change often)

/**
 * BFF Route: /api/academics/reports
 * 
 * GET /api/academics/reports - Get test reports and analytics
 * 
 * Features:
 * - ✅ 10-minute caching (reports are static)
 * - ✅ Secure cookie forwarding
 * - ✅ Query parameter support (filters, date range)
 */

export async function GET(request: NextRequest) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const queryString = url.search;
    const endpoint = `/api/academics/reports${queryString}`;
    const cacheKey = `reports:${queryString}`;

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Reports Cache HIT (age:', Date.now() - cachedEntry.timestamp, 'ms)');
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=600',
        },
      });
    }

    console.log('📤 Calling Express:', `${EXPRESS_URL}${endpoint}`);

    const expressResponse = await fetch(`${EXPRESS_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch reports' },
        { status: expressResponse.status }
      );
    }

    const cleanData = { success: true, ...data };

    // Cache the response
    cache.set(cacheKey, { data: cleanData, timestamp: Date.now() });

    if (cache.size > 50) {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL * 2) {
          cache.delete(key);
        }
      }
    }

    console.log('[BFF] Reports Cache MISS (fresh data)');
    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (error) {
    console.error('❌ BFF Reports GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
