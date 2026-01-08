/**
 * BFF Route: WhatsApp Conversations (Live Chat)
 * Proxies calls to backend WhatsApp API
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Call backend directly - it handles everything
    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/conversations?tenantId=${tenantId}&limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

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

