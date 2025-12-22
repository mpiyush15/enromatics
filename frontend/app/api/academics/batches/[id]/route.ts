/**
 * BFF Batches [ID] Route (STABILIZED)
 * 
 * PUT /api/academics/batches/[id] - Update batch
 * DELETE /api/academics/batches/[id] - Delete batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_KEYS } from '@/lib/redis';

// Helper to extract cookies
function extractCookies(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';
  return cookies;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookies = extractCookies(request);
    const body = await request.json();
    const { id } = params;

    console.log('[BFF] Updating batch:', { id, body });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log('[BFF] Batch update response:', {
      success: data.success,
      batch: data.batch,
    });

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update batch' },
        { status: res.status }
      );
    }

    // Invalidate batches cache after update
    // Get tenantId from the updated batch response
    if (data.batch?.tenantId) {
      const cacheKey = CACHE_KEYS.BATCHES_LIST(data.batch.tenantId);
      await redisCache.del(cacheKey);
      console.log('[BFF] Invalidated batches cache for tenant:', data.batch.tenantId);
    }

    return NextResponse.json({
      success: true,
      batch: data.batch,
      message: 'Batch updated successfully',
    });
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
  { params }: { params: { id: string } }
) {
  try {
    const cookies = extractCookies(request);
    const { id } = params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete batch' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    console.error('❌ BFF Batches DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
