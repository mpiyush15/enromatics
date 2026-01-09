/**
 * BFF Route: WhatsApp Stats
 * Proxies stats API calls to external WhatsApp Platform
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:5050';
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const phoneNumberId = searchParams.get('phoneNumberId');
    const type = searchParams.get('type') || 'overview'; // 'overview' or 'daily'

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Missing accountId parameter' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({ accountId });
    if (phoneNumberId) params.append('phoneNumberId', phoneNumberId);

    const endpoint = type === 'daily' ? '/stats/daily' : '/stats';

    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api${endpoint}?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(WHATSAPP_PLATFORM_API_KEY && { 'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}` }),
        },
      }
    );

    const data = await response.json();

    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=120'); // 2 min cache for stats (frequently accessed)

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('❌ WhatsApp stats error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
