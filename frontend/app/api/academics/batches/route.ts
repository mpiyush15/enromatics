import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

// In-memory cache for batches
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * BFF Route: /api/academics/batches
 * 
 * GET /api/academics/batches - List all batches
 * GET /api/academics/batches/:id - Get single batch
 * POST /api/academics/batches - Create batch
 * PUT /api/academics/batches/:id - Update batch
 * DELETE /api/academics/batches/:id - Delete batch
 * 
 * Features:
 * - ✅ 5-minute caching for list requests
 * - ✅ Cache invalidation on mutations
 * - ✅ Secure cookie forwarding
 * - ✅ Automatic cache cleanup
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
    const batchId = params?.id;
    const endpoint = batchId ? `/api/batches/${batchId}` : `/api/batches${url.search}`;

    // Check cache for list requests
    if (!batchId) {
      const cacheKey = `batches:${url.search}`;
      const cachedEntry = cache.get(cacheKey);
      
      if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        console.log('[BFF] Batches Cache HIT (age:', Date.now() - cachedEntry.timestamp, 'ms)');
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
        { success: false, message: data.message || 'Failed to fetch batches' },
        { status: expressResponse.status }
      );
    }

    const cleanData = {
      success: true,
      ...data,
      batches: Array.isArray(data.batches) ? data.batches : undefined,
      batch: data.batch || undefined,
    };

    // Cache list requests
    if (!batchId) {
      const cacheKey = `batches:${url.search}`;
      cache.set(cacheKey, { data: cleanData, timestamp: Date.now() });

      if (cache.size > 50) {
        const now = Date.now();
        for (const [key, entry] of cache.entries()) {
          if (now - entry.timestamp > CACHE_TTL * 2) {
            cache.delete(key);
          }
        }
      }

      console.log('[BFF] Batches Cache MISS (fresh data)');
      return NextResponse.json(cleanData, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return NextResponse.json(cleanData);
  } catch (error) {
    console.error('❌ BFF Batches GET error:', error);
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

    const expressResponse = await fetch(`${EXPRESS_URL}/api/batches`, {
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
        { success: false, message: data.message || 'Failed to create batch' },
        { status: expressResponse.status }
      );
    }

    cache.clear();
    console.log('✅ Batch created, cache cleared');

    return NextResponse.json({ success: true, batch: data.batch || data }, { status: 201 });
  } catch (error) {
    console.error('❌ BFF Batches POST error:', error);
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
        { success: false, message: 'Batch ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const expressResponse = await fetch(`${EXPRESS_URL}/api/batches/${params.id}`, {
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
        { success: false, message: data.message || 'Failed to update batch' },
        { status: expressResponse.status }
      );
    }

    cache.clear();
    console.log('✅ Batch updated, cache cleared');

    return NextResponse.json({ success: true, batch: data.batch || data });
  } catch (error) {
    console.error('❌ BFF Batches PUT error:', error);
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
        { success: false, message: 'Batch ID required' },
        { status: 400 }
      );
    }

    const expressResponse = await fetch(`${EXPRESS_URL}/api/batches/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete batch' },
        { status: expressResponse.status }
      );
    }

    cache.clear();
    console.log('✅ Batch deleted, cache cleared');

    return NextResponse.json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    console.error('❌ BFF Batches DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
