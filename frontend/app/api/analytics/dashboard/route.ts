import { NextRequest, NextResponse } from 'next/server';

/**
 * BFF Route: Forward analytics/dashboard requests to backend
 * 
 * Frontend calls: GET /api/analytics/dashboard
 * This forwards to: GET https://backend/api/analytics/dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.enromatics.com'}/api/analytics/dashboard`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend analytics error:', response.status);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Analytics BFF error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
