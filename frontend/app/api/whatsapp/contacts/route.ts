/**
 * BFF Route: WhatsApp Contacts
 * Proxies to: GET /api/contacts
 * Uses tenant's businessAccountId
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

const WHATSAPP_PLATFORM_URL = (process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

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

    // Get tenant config from MongoDB
    await connectDB();
    const db = (global as any).mongodb?.db();
    const collection = db?.collection('whatsapp_tenant_configs');
    const config = await collection?.findOne({ tenantId });

    if (!config || !config.businessAccountId) {
      return NextResponse.json(
        { success: false, message: 'WhatsApp account not configured for this tenant' },
        { status: 404 }
      );
    }

    // Call platform with tenant's businessAccountId
    const response = await fetch(
      `${WHATSAPP_PLATFORM_URL}/api/contacts?businessAccountId=${config.businessAccountId}`,
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
