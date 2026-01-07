/**
 * BFF Route: WhatsApp Chatbots
 * Note: Chatbots might be part of the messages/conversations system
 * For now, returns mock data or platform messages
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

export async function GET(req: NextRequest) {
  try {
    // Try to fetch from messages endpoint as fallback
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
        { chatbots: [] },
        { status: 200 }
      );
    }

    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300');
    return NextResponse.json({ chatbots: [] }, { headers });
  } catch (error) {
    console.error('❌ Chatbots error:', error);
    return NextResponse.json(
      { chatbots: [] },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Placeholder for chatbot creation
    return NextResponse.json({ success: true, data: { ...body, _id: Date.now() } });
  } catch (error) {
    console.error('❌ Chatbots POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Chatbot creation not yet implemented' },
      { status: 501 }
    );
  }
}
