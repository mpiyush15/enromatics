import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(req: NextRequest) {
  try {
    // Get cookies from the request
    const cookies = req.headers.get('cookie') || '';
    
    // Forward to backend with cookies
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/automation/workflows`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies, // ✅ Forward cookies
      },
      credentials: 'include', // ✅ Allow credentials
    });

    const data = await response.json();

    // Create a new response
    const newResponse = NextResponse.json(data, { status: response.status });
    
    // Forward Set-Cookie headers if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      newResponse.headers.set('set-cookie', setCookieHeader);
    }

    return newResponse;
  } catch (error) {
    console.error('BFF Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/automation/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();
    const newResponse = NextResponse.json(data, { status: response.status });
    
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      newResponse.headers.set('set-cookie', setCookieHeader);
    }

    return newResponse;
  } catch (error) {
    console.error('BFF Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
