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
