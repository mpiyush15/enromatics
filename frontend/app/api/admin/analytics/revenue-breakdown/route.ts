import { NextRequest, NextResponse } from 'next/server';

/**
 * BFF Endpoint: Get Revenue Breakdown
 * 
 * Forwards requests to backend /api/analytics/revenue-breakdown
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

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.enromatics.com'}/api/analytics/revenue-breakdown`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend revenue breakdown error:', response.status, response.statusText);
      return NextResponse.json(
        { message: 'Failed to fetch revenue breakdown from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Revenue breakdown BFF error:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
