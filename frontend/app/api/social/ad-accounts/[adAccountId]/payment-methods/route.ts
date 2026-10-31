import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5055';

export async function GET(
  request: NextRequest,
  { params }: { params: { adAccountId: string } }
) {
  try {
    const { adAccountId } = params;
    const cookies = request.headers.get('cookie') || '';

    console.log('🔵 Fetching payment methods for ad account:', adAccountId);

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/facebook/ad-accounts/${adAccountId}/payment-methods`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('🔴 Backend payment methods error:', data);
      return NextResponse.json(data, { status: backendResponse.status });
    }

    console.log('✅ Got payment methods from backend');
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('🔴 Payment methods error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
