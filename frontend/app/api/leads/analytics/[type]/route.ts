/**
 * BFF Lead Analytics Routes
 * 
 * GET /api/leads/analytics/conversion-funnel - Get conversion funnel data
 * GET /api/leads/analytics/source-performance - Get source performance
 * GET /api/leads/analytics/counsellor-performance - Get counsellor performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    const url = new URL(request.url);
    const endpoint = `/api/leads/analytics/${type}${url.search}`;

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
        { success: false, message: data.message || 'Failed to fetch analytics' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ BFF Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
