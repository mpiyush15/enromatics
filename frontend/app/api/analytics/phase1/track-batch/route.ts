/**
 * BFF Route: POST /api/analytics/phase1/track-batch
 * * Forwards batched analytics events from frontend tracking script
 * to the backend analytics service with safety guards for empty JSON.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'http://localhost:5050';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse incoming body from the frontend
    const body = await request.json();
    const batchCount = body?.batchSize || (Array.isArray(body) ? body.length : 'unknown');
    
    console.log(`📊 BFF Track Batch - Received ${batchCount} events`);
    
    // 2. Forward the request to the backend service
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

    // 3. GET RAW TEXT FIRST (Crucial: prevents JSON.parse error on empty response)
    const responseText = await backendResponse.text();
    let responseData: any = null;

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // Handle cases where backend sends plain text or HTML instead of JSON
        console.warn('⚠️ Backend sent non-JSON response:', responseText);
        responseData = { message: responseText };
      }
    } else {
      // Backend sent an empty body (e.g., res.sendStatus(200))
      responseData = { success: true, status: 'empty_response' };
    }

    // 4. Handle Backend Errors
    if (!backendResponse.ok) {
      console.error(`❌ Backend error [${backendResponse.status}]:`, responseData);
      return NextResponse.json(
        responseData || { success: false, message: 'Backend request failed' }, 
        { status: backendResponse.status }
      );
    }

    // 5. Successful Processing
    console.log(`✅ Batch processed successfully by backend.`);
    return NextResponse.json(responseData);

  } catch (error: any) {
    // Catch-all for network failures or coding errors
    console.error('❌ BFF Track Batch Critical Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal BFF Error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}