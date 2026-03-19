/**
 * BFF Route: /api/subscriptions/[tenantId]
 * Proxies subscription endpoints to Express backend
 * Gets active subscription from TenantSubscription model (single source of truth)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || 'http://localhost:5050';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const cookies = request.headers.get('cookie') || '';
    const headerTenantId = request.headers.get('X-Tenant-ID');

    if (!tenantId && !headerTenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const finalTenantId = headerTenantId || tenantId;
    console.log('[📡 SUBSCRIPTIONS BFF] GET /api/subscriptions for tenant:', finalTenantId);

    const backendUrl = `${BACKEND_URL}/api/subscriptions/${finalTenantId}`;
    console.log('[📡 SUBSCRIPTIONS BFF] Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': finalTenantId,
        Cookie: cookies,
      },
      credentials: 'include',
    });

    console.log('[📡 SUBSCRIPTIONS BFF] Backend response status:', response.status);

    // Get response as text first
    const responseText = await response.text();
    console.log('[📡 SUBSCRIPTIONS BFF] Backend response (first 200 chars):', responseText.substring(0, 200));

    if (!responseText) {
      console.error('[❌ SUBSCRIPTIONS BFF] Empty response from backend');
      return NextResponse.json(
        { success: false, message: 'Empty response from backend' },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[BFF] JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON response from backend' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('[BFF] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch subscription' },
        { status: response.status }
      );
    }

    console.log('[BFF] Successfully fetched subscription:', data.subscription?.planType);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ BFF Subscriptions GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';
    const pathname = request.nextUrl.pathname;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Determine the backend endpoint based on pathname
    let backendEndpoint = `${BACKEND_URL}/api/subscriptions/${tenantId}`;
    if (pathname.includes('/upgrade')) {
      backendEndpoint += '/upgrade';
    } else if (pathname.includes('/mobile-app')) {
      backendEndpoint += '/mobile-app';
    }

    console.log('[BFF] POST to:', backendEndpoint);

    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[BFF] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Operation failed' },
        { status: response.status }
      );
    }

    console.log('[BFF] Operation successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ BFF Subscriptions POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
