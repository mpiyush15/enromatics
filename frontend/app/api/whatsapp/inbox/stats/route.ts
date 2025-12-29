import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

/**
 * GET /api/whatsapp/inbox/stats
 * Get WhatsApp inbox statistics
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      console.warn('❌ No JWT token found');
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    console.log('📊 Fetching inbox stats...');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/inbox/stats`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(data, { status: backendResponse.status });
    }

    console.log('✅ Stats fetched successfully');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Get inbox stats error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch stats', success: false },
      { status: 500 }
    );
  }
}
