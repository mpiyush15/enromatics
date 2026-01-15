/**
 * BFF Route: /api/batches/[id]/students
 * Purpose: Get students in a specific batch using BatchStudent relationship
 * Proxies to: GET /api/batches/:batchId/students
 */

import { NextRequest, NextResponse } from 'next/server';

function extractCookies(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';
  return cookies;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookies = extractCookies(request);
    const { id } = params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '100';
    const status = searchParams.get('status') || 'active';

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/batch-students/${id}/students?page=${page}&limit=${limit}&status=${status}`;
    
    console.log('[BFF] Fetching batch students from backend:', backendUrl);

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!data.success) {
      console.log('[BFF] Backend response not successful:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch batch students' },
        { status: res.status }
      );
    }

    console.log(`[BFF] Found ${data.students?.length || 0} students in batch`);

    return NextResponse.json({
      success: true,
      batch: data.batch,
      students: data.students || [],
      page: data.page,
      pages: data.pages,
      total: data.total,
    });
  } catch (error) {
    console.error('❌ BFF batch students error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
