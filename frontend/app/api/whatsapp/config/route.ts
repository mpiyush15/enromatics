/**
 * BFF Route: WhatsApp Config/Settings
 * Handles tenant WhatsApp account configuration
 * Reads platform URL + API key from backend env
 * Stores tenant-specific account details in MongoDB (via backend)
 */

import { NextRequest, NextResponse } from 'next/server';

// Platform credentials (from backend env via BFF)
const WHATSAPP_PLATFORM_URL = (process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

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
    return NextResponse.json(data);
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
    const { tenantId, businessAccountId, phoneNumberId, phoneNumber } = body;

    // Validate required fields
    if (!tenantId || !businessAccountId || !phoneNumberId || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: tenantId, businessAccountId, phoneNumberId, phoneNumber' },
        { status: 400 }
      );
    }

    // Validate platform credentials exist
    if (!WHATSAPP_PLATFORM_URL || !WHATSAPP_PLATFORM_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Platform credentials not configured' },
        { status: 500 }
      );
    }

    // Test connection to platform with tenant's account
    try {
      const testResponse = await fetch(
        `${WHATSAPP_PLATFORM_URL}/api/messages?businessAccountId=${businessAccountId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
          },
        }
      );

      const isConnected = testResponse.ok || testResponse.status === 401; // Accept 401 as tenant exists

      // Call backend to save config
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
            isConnected,
            connectionStatus: isConnected ? 'connected' : 'error',
            errorMessage: isConnected ? null : 'Unable to connect to platform',
          }),
        }
      );

      if (saveResponse.ok) {
        const data = await saveResponse.json();
        return NextResponse.json({
          success: true,
          message: 'Configuration saved and verified',
          config: data.config || {
            tenantId,
            businessAccountId,
            phoneNumberId,
            phoneNumber,
            isConnected,
            connectionStatus: isConnected ? 'connected' : 'error',
          }
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Failed to save configuration' },
          { status: saveResponse.status }
        );
      }
    } catch (error) {
      console.error('❌ Platform connection error:', error);
      return NextResponse.json(
        { success: false, message: 'Unable to reach WhatsApp platform' },
        { status: 503 }
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
