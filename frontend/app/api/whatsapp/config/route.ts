/**
 * BFF Route: WhatsApp Config/Settings
 * Handles connection testing and configuration
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_PLATFORM_URL = (process.env.NEXT_PUBLIC_WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

export async function GET(req: NextRequest) {
  try {
    // Return basic config info
    return NextResponse.json({
      config: {
        platformUrl: WHATSAPP_PLATFORM_URL,
        isConnected: !!WHATSAPP_PLATFORM_API_KEY,
        connectionStatus: WHATSAPP_PLATFORM_API_KEY ? 'connected' : 'disconnected',
      }
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
    const { platformUrl, platformApiKey } = body;

    // Validate platform connection
    if (platformUrl && platformApiKey) {
      try {
        const response = await fetch(
          `${platformUrl.replace(/\/$/, '')}/api/messages`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${platformApiKey}`,
            },
          }
        );

        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: 'Connection successful',
            config: {
              platformUrl,
              isConnected: true,
              connectionStatus: 'connected',
            }
          });
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid API key or platform URL' },
            { status: 401 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Unable to reach platform URL' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Missing platformUrl or platformApiKey' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Config POST error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to save config' },
      { status: 500 }
    );
  }
}
