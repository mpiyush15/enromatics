/**
 * BFF Route: WhatsApp Stats
 * Proxies to: GET /api/stats
 * Gets tenant config from backend
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Get tenant config from backend
    const configResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/config?tenantId=${tenantId}`
    );

    if (!configResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'WhatsApp account not configured for this tenant' },
        { status: 404 }
      );
    }

    const configData = await configResponse.json();
    const config = configData.config;

    if (!config || !config.businessAccountId) {
      return NextResponse.json(
        { success: false, message: 'WhatsApp account not configured for this tenant' },
        { status: 404 }
      );
    }

    // Call platform with tenant's businessAccountId
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/stats?businessAccountId=${config.businessAccountId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Platform error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=120'); // 2 min (frequent access)

    return NextResponse.json({ stats: data }, { headers });
  } catch (error) {
    console.error('❌ Stats error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
