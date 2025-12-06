import { NextRequest, NextResponse } from 'next/server';

// Use BACKEND_API_URL for server-side, fallback to NEXT_PUBLIC_API_URL
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Calling backend:', `${BACKEND_URL}/api/payments/initiate-subscription`);
    
    const response = await fetch(`${BACKEND_URL}/api/payments/initiate-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Backend response status:', response.status);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
