/**
 * BFF Route: WhatsApp Messages
 * Proxies to: POST /api/messages/send, GET /api/messages
 * Gets tenant config from backend, uses to call platform
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
      `${WHATSAPP_PLATFORM_URL}/api/messages?businessAccountId=${config.businessAccountId}`,
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
    headers.set('Cache-Control', 'public, max-age=180'); // 3 min

    return NextResponse.json({ messages: data }, { headers });
  } catch (error) {
    console.error('❌ Messages GET error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, to, message } = body;

    if (!tenantId || !to || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: tenantId, to, message' },
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

    // Send message from tenant's account
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/messages/send?businessAccountId=${config.businessAccountId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
        },
        body: JSON.stringify({ to, message }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || `Platform error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Messages POST error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
