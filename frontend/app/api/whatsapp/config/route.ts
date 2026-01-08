/**
 * BFF Route: WhatsApp Config/Settings
 * Handles tenant WhatsApp account configuration
 * Reads platform URL + API key from backend env
 * Stores tenant-specific account details in MongoDB (via backend)
 */

import { NextRequest, NextResponse } from 'next/server';

// Platform credentials (from env vars)
const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

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

    // Get tenant config from backend
    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/config?tenantId=${tenantId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch config from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Wrap response to ensure consistent structure
    return NextResponse.json({
      success: true,
      config: data,
      connectionStatus: data.connectionStatus || 'disconnected'
    });
  } catch (error) {
    console.error('❌ Config GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, businessAccountId, phoneNumberId, phoneNumber, apiKey } = body;

    // Validate required fields
    if (!tenantId || !businessAccountId || !phoneNumberId || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: tenantId, businessAccountId, phoneNumberId, phoneNumber' },
        { status: 400 }
      );
    }

    // Call backend to save config and verify API key if provided
    const saveResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/config`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          businessAccountId,
          phoneNumberId,
          phoneNumber,
          apiKey: apiKey || null,
        }),
      }
    );

    if (saveResponse.ok) {
      const data = await saveResponse.json();
      return NextResponse.json({
        success: true,
        message: data.message || 'Configuration saved',
        config: data.config,
        connectionStatus: data.connectionStatus,
      });
    } else {
      const errorData = await saveResponse.json();
      return NextResponse.json(
        { success: false, message: errorData.message || errorData.error || 'Failed to save configuration' },
        { status: saveResponse.status }
      );
    }
  } catch (error) {
    console.error('❌ Config POST error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to save config' },
      { status: 500 }
    );
  }
}
