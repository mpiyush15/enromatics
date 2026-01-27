/**
 * BFF Route: /api/academics/tests/[id]/marks
 * 
 * GET /api/academics/tests/:id/marks - Get marks for a test
 * POST /api/academics/tests/:id/marks - Enter marks
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

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

    console.log('📤 Fetching marks:', `${EXPRESS_URL}/api/academics/tests/${testId}/marks`);

    // Get authorization header (Bearer token for student auth)
    const authHeader = request.headers.get('authorization');
    const cookies = extractCookies(request);

    // Build headers with auth (Bearer token takes priority, fallback to cookies)
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('✅ Using Bearer token for marks fetch');
    } else if (cookies) {
      headers['Cookie'] = cookies;
      console.log('✅ Using Cookie for marks fetch');
    }

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}/marks`, {
      method: 'GET',
      headers,
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      console.log('⚠️ No marks found or error:', expressResponse.status);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch marks', marks: [] },
        { status: 200 } // Return 200 even if no data, frontend will handle empty array
      );
    }

    console.log('✅ Marks fetched:', data.marks?.length || 0, 'records');

    return NextResponse.json({
      success: true,
      marks: data.marks || [],
      test: data.test,
      statistics: data.statistics || {},
    });
  } catch (error) {
    console.error('❌ BFF Marks GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', marks: [] },
      { status: 200 } // Return 200 with empty array on error
    );
  }
}

export async function POST(
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

    console.log('📤 Saving marks:', `${EXPRESS_URL}/api/academics/tests/${testId}/marks`);

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}/marks`, {
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
        { success: false, message: data.message || 'Failed to save marks' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Marks saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Marks saved successfully',
      marks: data.marks || [],
    });
  } catch (error) {
    console.error('❌ BFF Marks POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
