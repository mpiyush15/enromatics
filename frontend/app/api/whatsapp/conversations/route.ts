/**
 * BFF Route: WhatsApp Conversations (Live Chat)
 * Proxies calls to external WhatsApp Platform
 * Handles cookie forwarding and authentication
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

export async function GET(req: NextRequest) {
  try {
    // Call WhatsApp Platform
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/conversations`,
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
