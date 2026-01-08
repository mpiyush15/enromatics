import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * GET /api/whatsapp/conversations
 * Fetch WhatsApp conversations for a tenant
 * Forwards to backend which proxies to WhatsApp Platform API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Forward to backend which will fetch from WhatsApp Platform
    const backendUrl = getApiUrl('/api/whatsapp/conversations');
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
      console.error('Failed to fetch conversations:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch conversations from server', details: await response.text() },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return conversations in the format expected by frontend
    return NextResponse.json({
      success: true,
      data: {
        conversations: data.data?.conversations || [],
        pagination: data.data?.pagination || { total: 0, limit: parseInt(limit), offset: parseInt(offset), hasMore: false }
      }
    });
  } catch (error) {
    console.error('Error fetching WhatsApp conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

