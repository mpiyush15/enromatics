import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    const tenantId = request.nextUrl.searchParams.get('tenantId');

    // Build backend URL
    let backendUrl = `${BACKEND_URL}/api/facebook/connect`;
    if (tenantId) {
      backendUrl += `?tenantId=${tenantId}`;
    }

    console.log('🔵 Facebook Connect - Redirecting to:', backendUrl);

    // Fetch redirect URL from backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // If backend returns a redirect URL, return it
    if (data.authUrl) {
      return NextResponse.json({ authUrl: data.authUrl }, { status: 200 });
    }

    // Otherwise just return success
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('🔴 Facebook Connect Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Facebook connection' },
      { status: 500 }
    );
  }
}
