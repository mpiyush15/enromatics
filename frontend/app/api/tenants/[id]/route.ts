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
    const response = await fetch(`${BACKEND_URL}/api/tenants/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Backend tenant detail error: ${response.status}`);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Tenant Detail Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch tenant', error: error.message },
      { status: 500 }
    );
  }
}
