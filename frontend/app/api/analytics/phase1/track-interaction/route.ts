import { NextRequest, NextResponse } from 'next/server';
import { extractJwtToken, getBackendUrl, createBackendHeaders } from '@/lib/bff-jwt-helper';

const BACKEND_URL = getBackendUrl();

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Track interaction called without JSON body');
      return NextResponse.json({ 
        success: true, 
        message: 'No data to track' 
      }, { status: 200 });
    }

    // Try to parse JSON body, handle empty body gracefully
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        console.warn('⚠️ Track interaction called with empty body');
        return NextResponse.json({ 
          success: true, 
          message: 'No data to track' 
        }, { status: 200 });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json({ 
        success: true, 
        message: 'Invalid JSON body' 
      }, { status: 200 }); // Return 200 to prevent frontend errors
    }
    
    const response = await fetch(
      `${BACKEND_URL}/api/analytics/phase1/track-interaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Track interaction error:", error);
    return NextResponse.json({ 
      success: true, 
      message: 'Tracking failed silently' 
    }, { status: 200 }); // Return 200 to prevent breaking user experience
  }
}
