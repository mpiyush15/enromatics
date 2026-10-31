import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5055';

export async function POST(request: NextRequest) {
  try {
    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    const tenantId = request.nextUrl.searchParams.get('tenantId');

    // Build backend URL
    let backendUrl = `${BACKEND_URL}/api/facebook/disconnect`;
    if (tenantId) {
      backendUrl += `?tenantId=${tenantId}`;
    }

    console.log('🔵 Facebook Disconnect - URL:', backendUrl);

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('🔴 Facebook Disconnect Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect Facebook' },
      { status: 500 }
    );
  }
}
