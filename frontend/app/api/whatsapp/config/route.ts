import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * GET /api/whatsapp/config
 * Fetch WhatsApp configuration for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const backendUrl = getApiUrl('/api/whatsapp/config');
    const response = await fetch(`${backendUrl}?tenantId=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      console.error('Backend error:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch config from backend', config: null },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Backend returns the config directly, wrap it in the format settings page expects
    return NextResponse.json({
      success: true,
      config: data
    });
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    return NextResponse.json(
      { error: 'Internal server error', config: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/config
 * Save or update WhatsApp configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...configData } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const backendUrl = getApiUrl('/api/whatsapp/config');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        tenantId,
        ...configData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to save config', message: error.message },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Wrap response in the format settings page expects
    return NextResponse.json({
      success: true,
      config: data,
      connectionStatus: data.connectionStatus
    });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
