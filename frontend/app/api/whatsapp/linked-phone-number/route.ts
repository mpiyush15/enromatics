import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(req: NextRequest) {
  try {
    const cookies = req.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/linked-phone-number`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
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
    console.error('BFF Error fetching linked phone number:', error);
    return NextResponse.json(
      { error: 'Failed to fetch linked phone number' },
      { status: 500 }
    );
  }
}
