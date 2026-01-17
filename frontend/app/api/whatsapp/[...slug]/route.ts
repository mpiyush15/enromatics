import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

/**
 * BFF (Backend For Frontend) proxy for all WhatsApp endpoints
 * Routes: /api/whatsapp/config, /api/whatsapp/events/*, etc.
 * Proxies to: http://localhost:5050/api/whatsapp/...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug: slugArray } = await params;
    const slug = slugArray.join('/');
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const url = `${BACKEND_URL}/api/whatsapp/${slug}${queryString ? `?${queryString}` : ''}`;

    const cookieHeader = request.headers.get('cookie');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`⚠️ WhatsApp BFF Error: ${response.status}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ WhatsApp BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Route not found' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug: slugArray } = await params;
    const slug = slugArray.join('/');
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const url = `${BACKEND_URL}/api/whatsapp/${slug}${queryString ? `?${queryString}` : ''}`;

    const cookieHeader = request.headers.get('cookie');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`⚠️ WhatsApp BFF Error: ${response.status}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ WhatsApp BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug: slugArray } = await params;
    const slug = slugArray.join('/');
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const url = `${BACKEND_URL}/api/whatsapp/${slug}${queryString ? `?${queryString}` : ''}`;

    const cookieHeader = request.headers.get('cookie');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`⚠️ WhatsApp BFF Error: ${response.status}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ WhatsApp BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
