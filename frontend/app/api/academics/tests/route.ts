import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { redisCache, CACHE_TTL } from '@/lib/redis';

/**
 * BFF Route: /api/academics/tests
 * 
 * GET /api/academics/tests - List all tests
 * GET /api/academics/tests/:id - Get single test
 * POST /api/academics/tests - Create test
 * PUT /api/academics/tests/:id - Update test
 * DELETE /api/academics/tests/:id - Delete test
 * 
 * Features:
 * - ✅ Redis caching (5 minutes for list requests)
 * - ✅ Cache invalidation on mutations
 * - ✅ Secure cookie forwarding
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const testId = params?.id;
    const endpoint = testId ? `/api/academics/tests/${testId}` : `/api/academics/tests${url.search}`;

    // Check Redis cache for list requests
    if (!testId) {
      const cacheKey = `tests:${url.search}`;
      const cached = await redisCache.get<any>(cacheKey);
      
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
            'Cache-Control': 'public, max-age=300',
          },
        });
      }
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
        { success: false, message: data.message || 'Failed to fetch tests' },
        { status: expressResponse.status }
      );
    }

    const cleanData = {
      success: true,
      ...data,
    };

    // Cache list requests
    if (!testId) {
      const cacheKey = `tests:${url.search}`;
      await redisCache.set(cacheKey, cleanData, CACHE_TTL.MEDIUM);

      console.log('[BFF] Tests Cache MISS (fresh data)');
      return NextResponse.json(cleanData, {
        headers: {
          'X-Cache': 'MISS',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return NextResponse.json(cleanData);
  } catch (error) {
    console.error('❌ BFF Tests GET error:', error);
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

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests`, {
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
        { success: false, message: data.message || 'Failed to create test' },
        { status: expressResponse.status }
      );
    }

    await redisCache.delPattern('tests:*');
    console.log('✅ Test created, cache cleared');

    return NextResponse.json({ success: true, test: data.test || data }, { status: 201 });
  } catch (error) {
    console.error('❌ BFF Tests POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
