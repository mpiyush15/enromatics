import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Fetch from backend
    const response = await fetch(`${BACKEND_URL}/api/demo-requests/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Backend demo request detail error: ${response.status}`);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Demo Request Detail Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch demo request', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const payload = await req.json();

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/demo-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Backend demo request update error: ${response.status}`);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Demo Request Update Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to update demo request', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/demo-requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Backend demo request delete error: ${response.status}`);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Demo Request Delete Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to delete demo request', error: error.message },
      { status: 500 }
    );
  }
}
