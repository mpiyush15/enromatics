/**
 * BFF Payments Route (STABILIZED - NO CACHING)
 * 
 * POST /api/payments - Log a payment
 * 
 * This route:
 * 1. Receives payment data from frontend
 * 2. Forwards cookies to Express backend
 * 3. Calls Express /api/payments endpoint
 * 4. Returns response
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    console.log('📤 Creating payment via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/payments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend POST error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to log payment' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Payment logged successfully');

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('❌ BFF Payments POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
