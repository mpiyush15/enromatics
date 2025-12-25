import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

/**
 * Tenant Dashboard BFF Endpoint
 * GET /api/tenant/dashboard
 * 
 * Fetches tenant-specific dashboard data (students, revenue, batches, payments)
 * Reads JWT from Authorization header and forwards to backend
 * Backend filters data by tenantId from JWT
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Extract JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // ✅ Forward to backend with JWT token
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/tenants/dashboard`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!backendResponse.ok) {
      console.error('Backend error:', backendResponse.status, backendResponse.statusText);
      const data = await backendResponse.json();
      return NextResponse.json(
        { error: data.message || 'Failed to fetch tenant dashboard' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json({
      success: true,
      stats: data.stats,
    });
  } catch (error: any) {
    console.error('Tenant dashboard BFF error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenant dashboard' },
      { status: 500 }
    );
  }
}
