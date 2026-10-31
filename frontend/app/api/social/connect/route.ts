import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5055';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    console.log('🔵 BFF Connect - Received cookies:', cookies ? 'yes' : 'no');

    // Build backend URL
    const backendUrl = `${BACKEND_URL}/api/facebook/connect`;
    console.log('🔵 Calling backend:', backendUrl);

    // Fetch from backend (will return a redirect)
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'User-Agent': request.headers.get('user-agent') || 'axios',
      },
      redirect: 'manual',  // Don't follow redirects, we want to capture them
    });

    console.log('🔵 Backend response status:', response.status);

    // If backend returns a redirect (3xx), extract the Location header
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      console.log('🔵 Got redirect URL from backend');
      if (redirectUrl) {
        // Return the OAuth URL to frontend
        return NextResponse.json({ 
          authUrl: redirectUrl,
          status: 'redirect'
        }, { status: 200 });
      }
    }

    // If we got a 401, it means auth failed
    if (response.status === 401) {
      console.error('🔴 Unauthorized - user not authenticated');
      return NextResponse.json(
        { error: 'Not authorized. Please log in first.' },
        { status: 401 }
      );
    }

    // Try to parse response as JSON
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Invalid response from backend' };
    }

    if (!response.ok) {
      console.error('🔴 Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    // If response is OK and has authUrl, return it
    if (data.authUrl) {
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('🔴 Connect Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
