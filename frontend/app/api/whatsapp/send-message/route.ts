import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * POST /api/whatsapp/send-message
 * Send a message to a WhatsApp conversation
 * Forwards to backend which proxies to WhatsApp Platform API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      conversationId,
      messageText,
    } = body;

    if (!tenantId || !conversationId || !messageText) {
      return NextResponse.json(
        { error: 'tenantId, conversationId, and messageText are required' },
        { status: 400 }
      );
    }

    // Forward to backend which will send via WhatsApp Platform
    const backendUrl = getApiUrl(`/api/whatsapp/conversation/${conversationId}/reply?tenantId=${tenantId}`);
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to send message', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
