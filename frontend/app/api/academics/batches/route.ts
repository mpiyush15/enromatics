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

    console.log('[BFF] Batch POST request:', { body });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('[BFF] Backend response status:', res.status, res.statusText);

    // Get response as text first to handle empty responses
    const responseText = await res.text();
    console.log('[BFF] Backend response text:', responseText);

    if (!responseText) {
      console.error('❌ Empty response from backend');
      return NextResponse.json(
        { success: false, message: 'Empty response from backend' },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse backend response:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON from backend' },
        { status: 500 }
      );
    }

    if (!data.success) {
      console.log('[BFF] Backend returned error:', data.message);
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

    console.log('[BFF] Batch created successfully:', data.batch?._id);
    return NextResponse.json({
      success: true,
      batch: data.batch,
      message: 'Batch created successfully',
    });
  } catch (error) {
    console.error('❌ BFF Batches POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
