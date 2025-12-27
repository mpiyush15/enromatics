/**
 * BFF Leads Route
 * 
 * GET /api/leads - List all leads with filters
 * POST /api/leads - Create new lead
 * 
 * Handles CRM lead management with tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

// GET /api/leads - Get all leads with filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const endpoint = `/api/leads${url.search}`;

    console.log('📤 Calling Backend:', `${BACKEND_URL}${endpoint}`);

    const backendResponse = await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch leads', status: backendResponse.status },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Backend returned leads data');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Leads GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📤 Creating lead via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/leads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create lead' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Lead created successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Leads POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
