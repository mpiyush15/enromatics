/**
 * BFF Route: WhatsApp Conversations (Live Chat)
 * Proxies calls to external WhatsApp Platform
 * Gets tenant config from backend
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

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

    // Call WhatsApp Platform with tenant's businessAccountId
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/conversations?businessAccountId=${config.businessAccountId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    // Cache for 5 minutes for GET requests
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300');

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('❌ WhatsApp conversations error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch conversations',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Call WhatsApp Platform
    const response = await fetch(`${WHATSAPP_PLATFORM_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WHATSAPP_PLATFORM_API_KEY && { 'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ WhatsApp conversations POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process conversation',
      },
      { status: 500 }
    );
  }
}
