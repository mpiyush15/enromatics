import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

// In-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes (attendance changes frequently)

/**
 * BFF Route: /api/academics/attendance
 * 
 * POST /api/academics/tests/:id/attendance - Mark attendance
 * GET /api/academics/tests/:id/attendance - Get attendance data
 * 
 * Features:
 * - ✅ 3-minute caching (attendance changes frequently)
 * - ✅ Cache invalidation on mutations
 * - ✅ Secure cookie forwarding
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
    const testId = url.searchParams.get('testId');
    
    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'Test ID required' },
        { status: 400 }
      );
    }

    const endpoint = `/api/academics/tests/${testId}/attendance`;
    const cacheKey = `attendance:${testId}`;

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Attendance Cache HIT (age:', Date.now() - cachedEntry.timestamp, 'ms)');
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=180',
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
        { success: false, message: data.message || 'Failed to fetch attendance' },
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

    console.log('[BFF] Attendance Cache MISS (fresh data)');
    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=180',
      },
    });
  } catch (error) {
    console.error('❌ BFF Attendance GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const testId = body.testId;

    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'Test ID required' },
        { status: 400 }
      );
    }

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
      body: JSON.stringify(body),
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to mark attendance' },
        { status: expressResponse.status }
      );
    }

    // Invalidate cache for this test
    cache.delete(`attendance:${testId}`);
    console.log('✅ Attendance marked, cache cleared for test:', testId);

    return NextResponse.json({ success: true, ...data }, { status: 201 });
  } catch (error) {
    console.error('❌ BFF Attendance POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
