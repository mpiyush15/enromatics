/**
 * BFF Route: /api/academics/marks (STABILIZED)
 * Purpose: Handle marks entry with SSOT pattern
 */

import { NextRequest, NextResponse } from 'next/server';

// Helper to extract cookies
function extractCookies(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';
  return cookies;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const testId = url.searchParams.get('testId');
    
    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'Test ID required' },
        { status: 400 }
      );
    }

    const cookies = extractCookies(request);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academics/tests/${testId}/marks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch marks' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      marks: data.marks || [],
    });
  } catch (error) {
    console.error('❌ BFF Marks GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, marksData } = body;

    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'Test ID required' },
        { status: 400 }
      );
    }

    const cookies = extractCookies(request);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academics/tests/${testId}/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify({ marksData }),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to save marks' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Marks saved successfully',
    });
  } catch (error) {
    console.error('❌ BFF Marks POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
