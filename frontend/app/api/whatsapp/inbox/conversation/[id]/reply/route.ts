import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

/**
 * POST /api/whatsapp/inbox/conversation/[id]/reply
 * Send reply to conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params;
    const body = await request.json();
    const { message, messageType = 'text', templateName, templateParams } = body;

    if (!message && !templateName) {
      return NextResponse.json(
        { error: 'Message or template name is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`💬 Sending reply to ${conversationId}`, { messageType, templateName });

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/inbox/conversation/${conversationId}/reply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          messageType,
          templateName,
          templateParams: templateParams || [],
        }),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', data);
      return NextResponse.json(data, { status: backendResponse.status });
    }

    console.log(`✅ Reply sent successfully`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Send reply error:', error.message);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
