/**
 * BFF Route: /api/academics/tests/[id]/attendance
 * 
 * GET /api/academics/tests/:id/attendance - Get attendance for a test
 * POST /api/academics/tests/:id/attendance - Mark attendance
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

    console.log('📤 Fetching attendance:', `${EXPRESS_URL}/api/academics/tests/${testId}/attendance`);

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}/attendance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      console.log('⚠️ No attendance found or error:', expressResponse.status);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch attendance', attendance: [] },
        { status: 200 } // Return 200 even if no data, frontend will handle empty array
      );
    }

    console.log('✅ Attendance fetched:', data.attendance?.length || 0, 'records');

    return NextResponse.json({
      success: true,
      attendance: data.attendance || [],
      test: data.test,
    });
  } catch (error) {
    console.error('❌ BFF Attendance GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', attendance: [] },
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

    console.log('📤 Saving attendance:', `${EXPRESS_URL}/api/academics/tests/${testId}/attendance`);

    const expressResponse = await fetch(`${EXPRESS_URL}/api/academics/tests/${testId}/attendance`, {
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
        { success: false, message: data.message || 'Failed to save attendance' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Attendance saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Attendance saved successfully',
    });
  } catch (error) {
    console.error('❌ BFF Attendance POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
