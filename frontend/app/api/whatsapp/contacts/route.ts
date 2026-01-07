/**
 * BFF Route: WhatsApp Contacts
 * Proxies to: GET /api/contacts
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/contacts`,
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
    headers.set('Cache-Control', 'public, max-age=300'); // 5 min

    return NextResponse.json({ contacts: data }, { headers });
  } catch (error) {
    console.error('❌ Contacts error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
