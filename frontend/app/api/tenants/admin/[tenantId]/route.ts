import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Fetch from backend - superadmin endpoint
    const backendUrl = BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/tenants/admin/${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(
        `❌ Backend tenant admin API error: ${response.status} for tenant ${tenantId}`
      );
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { message: 'Failed to fetch tenant from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Tenant Admin BFF GET Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch tenant', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    // Update tenant via backend - superadmin endpoint
    const backendUrl = BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/tenants/admin/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(
        `❌ Backend tenant admin update API error: ${response.status} for tenant ${tenantId}`
      );
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { message: 'Failed to update tenant' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Tenant Admin BFF PUT Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to update tenant', error: error.message },
      { status: 500 }
    );
  }
}
