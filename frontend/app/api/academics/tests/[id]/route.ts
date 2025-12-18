/**
 * BFF Route: /api/academics/tests/[id]
 * 
 * GET /api/academics/tests/:id - Get single test
 * PUT /api/academics/tests/:id - Update test
 * DELETE /api/academics/tests/:id - Delete test
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { redisCache } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const testId = params.id;

    console.log('📤 Calling Express:', `${EXPRESS_URL}/api/academics/tests/${testId}`);

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch test' },
        { status: expressResponse.status }
      );
    }

    return NextResponse.json({ success: true, test: data.test || data });
  } catch (error) {
    console.error('❌ BFF Test GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const testId = params.id;
    const body = await request.json();

    console.log('📤 Updating test:', `${EXPRESS_URL}/api/academics/tests/${testId}`);

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}`, {
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

    // Clear cache after update
    await redisCache.delPattern('tests:*');
    console.log('✅ Test updated, cache cleared');

    return NextResponse.json({ success: true, test: data.test || data });
  } catch (error) {
    console.error('❌ BFF Test PUT error:', error);
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
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const testId = params.id;

    console.log('📤 Deleting test:', `${EXPRESS_URL}/api/academics/tests/${testId}`);

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}`, {
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

    // Clear cache after deletion
    await redisCache.delPattern('tests:*');
    console.log('✅ Test deleted, cache cleared');

    return NextResponse.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    console.error('❌ BFF Test DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
