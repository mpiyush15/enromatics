/**
 * BFF Route: WhatsApp Contacts
 * Proxies to backend WhatsApp API which transforms Platform data
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const limit = searchParams.get('limit') || '100';
    const offset = searchParams.get('offset') || '0';
    const search = searchParams.get('search') || '';

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Call backend directly - it handles everything including transformation
    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/contacts?tenantId=${tenantId}&limit=${limit}&offset=${offset}${search ? `&search=${search}` : ''}`,
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
    console.error('❌ WhatsApp contacts error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch contacts',
      },
      { status: 500 }
    );
  }
}
