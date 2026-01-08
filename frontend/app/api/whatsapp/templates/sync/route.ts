import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId' },
        { status: 400 }
      );
    }

    // Get tenant API key from backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(
      `${backendUrl}/api/whatsapp/templates/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        },
        body: JSON.stringify({ tenantId }),
      }
    );

    if (!response.ok) {
      console.error(`Backend response: ${response.status}`, await response.text());
      return NextResponse.json(
        { error: 'Failed to sync templates from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return sync result in expected format
    return NextResponse.json({
      success: true,
      data: {
        count: data.data?.count || data.count || 0,
        synced: data.data?.synced || data.synced || []
      }
    });
  } catch (error) {
    console.error('Error syncing templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
