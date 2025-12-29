import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

/**
 * GET /api/whatsapp/inbox/conversation/[id]
 * Get conversation messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '100';
    const page = searchParams.get('page') || '1';

    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`💬 Fetching conversation: ${conversationId} (limit: ${limit}, page: ${page})`);

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/inbox/conversation/${conversationId}?limit=${limit}&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status);
      return NextResponse.json(data, { status: backendResponse.status });
    }

    console.log(`✅ Fetched ${data.messages?.length || 0} messages`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Get conversation error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/inbox/conversation/[id]
 * Mark conversation as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params;
    const body = await request.json();
    const action = body.action || 'read';

    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`📌 Marking conversation as ${action}: ${conversationId}`);

    if (action === 'read') {
      const backendResponse = await fetch(
        `${BACKEND_URL}/api/whatsapp/inbox/conversation/${conversationId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
      }

      console.log(`✅ Conversation marked as read`);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Mark conversation read error:', error.message);
    return NextResponse.json(
      { error: 'Failed to mark conversation as read' },
      { status: 500 }
    );
  }
}
