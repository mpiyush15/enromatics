import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { redisCache, CACHE_TTL } from '@/lib/redis';

/**
 * BFF Route: /api/academics/reports
 * 
 * GET /api/academics/reports - Get test reports and analytics
 * 
 * Features:
 * - ✅ Redis caching (10 minutes - reports are static)
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

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
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

    // Cache the response (10 minutes for reports)
    await redisCache.set(cacheKey, cleanData, CACHE_TTL.LONG);

    console.log('[BFF] Reports Cache MISS (fresh data)');
    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
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
