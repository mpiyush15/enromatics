/**
 * BFF Route: /api/academics/batches (STABILIZED)
 * Purpose: Handle batch management with SSOT pattern
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_KEYS } from '@/lib/redis';

// Helper to extract cookies
function extractCookies(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';
  return cookies;
}

export async function GET(request: NextRequest) {
  try {
    const cookies = extractCookies(request);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    console.log('[BFF] Academics Batches Response:', {
      success: data.success,
      batchCount: data.batches?.length || 0,
      firstBatch: data.batches?.[0] || null,
    });

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch batches' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      batches: data.batches || [],
    });
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
    const cookies = extractCookies(request);
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create batch' },
        { status: res.status }
      );
    }

    // Invalidate batches cache after creation
    if (data.batch?.tenantId) {
      const cacheKey = CACHE_KEYS.BATCHES_LIST(data.batch.tenantId);
      await redisCache.del(cacheKey);
      console.log('[BFF] Invalidated batches cache after creation for tenant:', data.batch.tenantId);
    }

    return NextResponse.json({
      success: true,
      batch: data.batch,
      message: 'Batch created successfully',
    });
  } catch (error) {
    console.error('❌ BFF Batches POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
