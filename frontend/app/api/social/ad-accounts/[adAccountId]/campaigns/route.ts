import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  request: NextRequest,
  { params }: { params: { adAccountId: string } }
) {
  try {
    const { adAccountId } = params;

    console.log('🔵 BFF: Fetching campaigns for ad account:', adAccountId);

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/facebook/ad-accounts/${adAccountId}/campaigns`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('🔴 Backend error:', data);
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    console.log('✅ Campaigns fetched successfully');
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error: any) {
    console.error('🔴 Error fetching campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
