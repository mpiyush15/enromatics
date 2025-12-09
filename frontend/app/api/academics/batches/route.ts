/**
 * BFF Route: /api/academics/batches
 * Purpose: Handle batch management with Redis caching
 * Cache TTL: 5 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { redisCache, CACHE_TTL } from '@/lib/redis';

function getCacheKey(query: string, tenantId: string): string {
  return `academics:batches:${tenantId}:${query}`;
}

async function invalidateBatchesCache(tenantId: string): Promise<void> {
  await redisCache.delPattern(`academics:batches:${tenantId}*`);
  await redisCache.delPattern(`batches:*:${tenantId}*`);
  console.log('[BFF] Academics batches cache invalidated');
}

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
    const tenantId = url.searchParams.get('tenantId') || 'default';
    const endpoint = batchId ? `/api/batches/${batchId}` : `/api/batches${url.search}`;

    // Check Redis cache for list requests
    if (!batchId) {
      const cacheKey = getCacheKey(url.search, tenantId);
      const cached = await redisCache.get<any>(cacheKey);
      
      if (cached) {
        console.log('[BFF] Batches Cache HIT');
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
      const cacheKey = getCacheKey(url.search, tenantId);
      await redisCache.set(cacheKey, cleanData, CACHE_TTL.MEDIUM);

      console.log('[BFF] Batches Cache MISS - cached for 5 min');
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

    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
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

    // Invalidate cache
    if (tenantId) {
      await invalidateBatchesCache(tenantId);
    }
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

    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
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

    // Invalidate cache
    if (tenantId) {
      await invalidateBatchesCache(tenantId);
    }
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

    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';

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

    // Invalidate cache
    if (tenantId) {
      await invalidateBatchesCache(tenantId);
    }
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
