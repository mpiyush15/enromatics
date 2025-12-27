/**
 * BFF Lead Log Call Route
 * 
 * POST /api/leads/[id]/log-call - Log a call for a lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log('📤 Logging call via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/leads/${id}/log-call`,
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
        { success: false, message: data.message || 'Failed to log call' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Log Call error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
