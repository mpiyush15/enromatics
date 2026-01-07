/**
 * BFF Route: WhatsApp Messages
 * Proxies to: POST /api/messages/send, GET /api/messages
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/messages`,
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
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/messages/send`,
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
