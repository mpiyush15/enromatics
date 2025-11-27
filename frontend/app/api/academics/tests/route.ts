import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

// In-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
 * - ✅ 5-minute caching for list requests
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

    // Check cache for list requests
    if (!testId) {
      const cacheKey = `tests:${url.search}`;
      const cachedEntry = cache.get(cacheKey);
      
      if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        console.log('[BFF] Tests Cache HIT (age:', Date.now() - cachedEntry.timestamp, 'ms)');
        return NextResponse.json(cachedEntry.data, {
          headers: {
            'X-Cache': 'HIT',
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
      cache.set(cacheKey, { data: cleanData, timestamp: Date.now() });

      if (cache.size > 50) {
        const now = Date.now();
        for (const [key, entry] of cache.entries()) {
          if (now - entry.timestamp > CACHE_TTL * 2) {
            cache.delete(key);
          }
        }
      }

      console.log('[BFF] Tests Cache MISS (fresh data)');
      return NextResponse.json(cleanData, {
        headers: {
          'X-Cache': 'MISS',
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

    cache.clear();
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

export async function PUT(
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

    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Test ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
      body: JSON.stringify(body),
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update test' },
        { status: expressResponse.status }
      );
    }

    cache.clear();
    console.log('✅ Test updated, cache cleared');

    return NextResponse.json({ success: true, test: data.test || data });
  } catch (error) {
    console.error('❌ BFF Tests PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Test ID required' },
        { status: 400 }
      );
    }

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete test' },
        { status: expressResponse.status }
      );
    }

    cache.clear();
    console.log('✅ Test deleted, cache cleared');

    return NextResponse.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    console.error('❌ BFF Tests DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
