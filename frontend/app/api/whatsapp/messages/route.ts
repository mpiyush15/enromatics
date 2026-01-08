import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * GET /api/whatsapp/messages
 * Fetch messages for a specific conversation
 * Forwards to backend which proxies to WhatsApp Platform API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const tenantId = searchParams.get('tenantId');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    if (!conversationId || !tenantId) {
      return NextResponse.json(
        { error: 'conversationId and tenantId are required' },
        { status: 400 }
      );
    }

    // Forward to backend which will fetch from WhatsApp Platform
    const backendUrl = getApiUrl(`/api/whatsapp/conversation/${conversationId}/messages`);
    const response = await fetch(
      `${backendUrl}?tenantId=${tenantId}&limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch messages:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch messages from server', details: await response.text() },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return messages in the format expected by frontend
    return NextResponse.json({
      success: true,
      data: {
        messages: data.data?.messages || data.messages || [],
        pagination: data.pagination || { total: 0, limit: parseInt(limit), offset: parseInt(offset), hasMore: false }
      }
    });
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
