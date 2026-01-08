import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * PATCH /api/whatsapp/conversation/[conversationId]/read
 * Mark a WhatsApp conversation as read
 * Forwards to backend which proxies to WhatsApp Platform API
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const { conversationId } = params;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Forward to backend which will mark as read on WhatsApp Platform
    const backendUrl = getApiUrl(`/api/whatsapp/conversation/${conversationId}/read`);
    const response = await fetch(
      `${backendUrl}?tenantId=${tenantId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to mark conversation as read:', response.status);
      const errorData = await response.text();
      return NextResponse.json(
        { error: 'Failed to mark conversation as read', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
