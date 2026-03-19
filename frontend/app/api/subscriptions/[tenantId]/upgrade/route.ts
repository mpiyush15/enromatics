/**
 * BFF Route: POST /api/subscriptions/[tenantId]/upgrade
 * Proxies subscription upgrade to backend
 * Initiates payment for plan upgrade
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || 'http://localhost:5050';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const cookies = request.headers.get('cookie') || '';
    const headerTenantId = request.headers.get('X-Tenant-ID');
    const body = await request.json();

    if (!tenantId && !headerTenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const finalTenantId = headerTenantId || tenantId;
    console.log('[📡 SUBSCRIPTIONS BFF] POST /api/subscriptions/upgrade for tenant:', finalTenantId);
    console.log('[📡 SUBSCRIPTIONS BFF] Request body:', body);

    const backendUrl = `${BACKEND_URL}/api/tenants/${finalTenantId}/upgrade-plan`;
    console.log('[📡 SUBSCRIPTIONS BFF] Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': finalTenantId,
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('[📡 SUBSCRIPTIONS BFF] Backend response status:', response.status);

    const responseText = await response.text();
    console.log('[📡 SUBSCRIPTIONS BFF] Backend response (first 300 chars):', responseText.substring(0, 300));

    if (!responseText) {
      console.error('[❌ SUBSCRIPTIONS BFF] Empty response from backend');
      return NextResponse.json(
        { success: false, message: 'Empty response from backend' },
        { status: 500 }
      );
    }

    const data = JSON.parse(responseText);

    if (!response.ok) {
      console.error('[❌ SUBSCRIPTIONS BFF] Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('[✅ SUBSCRIPTIONS BFF] Upgrade initiated successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[❌ SUBSCRIPTIONS BFF] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
