import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/payments/admin/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin subscriptions API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
