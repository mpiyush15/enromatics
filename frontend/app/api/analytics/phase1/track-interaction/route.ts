import { NextRequest, NextResponse } from 'next/server';
import { extractJwtToken, getBackendUrl, createBackendHeaders } from '@/lib/bff-jwt-helper';

const BACKEND_URL = getBackendUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
