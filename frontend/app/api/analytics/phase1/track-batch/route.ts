/**
 * BFF Route: POST /api/analytics/phase1/track-batch
 * 
 * Forwards batched analytics events from frontend tracking script
 * to the backend analytics service
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'http://localhost:5050';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📊 BFF Track Batch - Received', body.batchSize, 'events');
    
    // Forward to backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/analytics/phase1/track-batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(data, { status: backendResponse.status });
    }

    console.log('✅ Batch processed successfully:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ BFF Track Batch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process batch' },
      { status: 500 }
    );
  }
}
