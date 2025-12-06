import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    // Get cookie header from request (same pattern as working routes)
    const cookieHeader = request.headers.get('cookie');

    if (!cookieHeader || !cookieHeader.includes('token=')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/payments/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
