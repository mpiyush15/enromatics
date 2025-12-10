import { NextRequest, NextResponse } from 'next/server';

/**
 * BFF Endpoint: Get Dashboard Analytics
 * 
 * Forwards requests to backend /api/analytics/dashboard
 * Only SuperAdmin can access
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.enromatics.com'}/api/analytics/dashboard`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend analytics error:', response.status, response.statusText);
      return NextResponse.json(
        { message: 'Failed to fetch analytics from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Analytics BFF error:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
