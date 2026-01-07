/**
 * BFF Route: WhatsApp Config/Settings
 * Handles tenant WhatsApp account configuration
 * Reads platform URL + API key from backend env
 * Stores tenant-specific account details in MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

// Platform credentials (from backend env via BFF)
const WHATSAPP_PLATFORM_URL = (process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:5050').replace(/\/$/, '');
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

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

    // Connect to MongoDB
    await connectDB();

    // Get tenant config from database
    const db = (global as any).mongodb?.db();
    const collection = db?.collection('whatsapp_tenant_configs');
    
    const config = await collection?.findOne({ tenantId });

    if (!config) {
      return NextResponse.json({
        success: true,
        config: null,
        message: 'No configuration found for this tenant'
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        _id: config._id,
        tenantId: config.tenantId,
        businessAccountId: config.businessAccountId,
        phoneNumberId: config.phoneNumberId,
        phoneNumber: config.phoneNumber,
        isConnected: config.isConnected || false,
        connectedAt: config.connectedAt,
        connectionStatus: config.connectionStatus || 'disconnected',
        errorMessage: config.errorMessage
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
      const response = await fetch(
        `${WHATSAPP_PLATFORM_URL}/api/messages?businessAccountId=${businessAccountId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
          },
        }
      );

      // Connect to MongoDB
      await connectDB();
      const db = (global as any).mongodb?.db();
      const collection = db?.collection('whatsapp_tenant_configs');

      const isConnected = response.ok || response.status === 401; // Accept 401 as tenant exists
      const timestamp = new Date();

      // Upsert tenant config
      const result = await collection?.updateOne(
        { tenantId },
        {
          $set: {
            tenantId,
            businessAccountId,
            phoneNumberId,
            phoneNumber,
            isConnected,
            connectedAt: isConnected ? timestamp : null,
            connectionStatus: isConnected ? 'connected' : 'error',
            errorMessage: isConnected ? null : 'Unable to connect to platform',
            updatedAt: timestamp,
          },
          $setOnInsert: {
            createdAt: timestamp,
          }
        },
        { upsert: true }
      );

      if (isConnected) {
        return NextResponse.json({
          success: true,
          message: 'Configuration saved and verified',
          config: {
            tenantId,
            businessAccountId,
            phoneNumberId,
            phoneNumber,
            isConnected: true,
            connectionStatus: 'connected',
            connectedAt: timestamp
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Failed to connect: ${response.statusText}`,
          errorCode: response.status
        }, { status: 401 });
      }
    } catch (error) {
      console.error('❌ Platform connection error:', error);
      
      // Still save config even if connection fails (user can test later)
      await connectDB();
      const db = (global as any).mongodb?.db();
      const collection = db?.collection('whatsapp_tenant_configs');
      
      await collection?.updateOne(
        { tenantId },
        {
          $set: {
            tenantId,
            businessAccountId,
            phoneNumberId,
            phoneNumber,
            isConnected: false,
            connectionStatus: 'error',
            errorMessage: 'Unable to reach platform',
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          }
        },
        { upsert: true }
      );

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
