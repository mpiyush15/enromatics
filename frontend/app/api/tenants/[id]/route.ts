import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      console.error('❌ Missing tenant ID in request');
      return NextResponse.json(
        { message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Extract cookies from request
    const cookieHeader = req.headers.get('cookie');

    console.log(`📍 Fetching tenant detail for ID: ${id}`);

    // Fetch from backend
    const response = await fetch(`${BACKEND_URL}/api/tenants/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    // Log the response status
    console.log(`📍 Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend tenant detail error: ${response.status}`, errorText);
      
      // Return the backend error response
      return NextResponse.json(
        { message: 'Failed to fetch tenant from backend', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate data
    if (!data || typeof data !== 'object') {
      console.error('❌ Invalid tenant data from backend');
      return NextResponse.json(
        { message: 'Invalid tenant data received from backend' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully fetched tenant: ${data.name || data._id}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Tenant Detail BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch tenant', error: error.message },
      { status: 500 }
    );
  }
}

// ✅ UPDATE tenant
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get('cookie');
    const body = await req.json();

    console.log(`📍 Updating tenant: ${id}`, body);

    const response = await fetch(`${BACKEND_URL}/api/tenants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Backend tenant update error: ${response.status}`, errorData);
      
      return NextResponse.json(
        errorData || { message: 'Failed to update tenant' },
        { status: response.status }
      );
    }

    const updated = await response.json();
    console.log(`✅ Successfully updated tenant: ${updated.name || updated._id}`);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('❌ Tenant Update BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to update tenant', error: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE tenant (move to trash)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get('cookie');

    console.log(`📍 Moving tenant to trash: ${id}`);

    const response = await fetch(`${BACKEND_URL}/api/tenants/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Backend tenant delete error: ${response.status}`, errorData);
      
      return NextResponse.json(
        errorData || { message: 'Failed to move tenant to trash' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`✅ Successfully moved tenant to trash: ${id}`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Tenant Delete BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Failed to move tenant to trash', error: error.message },
      { status: 500 }
    );
  }
}
