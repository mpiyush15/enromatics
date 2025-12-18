/**
 * BFF Attendance by Date Route
 * 
 * GET /api/attendance/date?date=YYYY-MM-DD&batch=...&course=...
 * 
 * This route:
 * 1. Receives attendance fetch request from frontend
 * 2. Forwards cookies to Express backend
 * 3. Calls Express /api/attendance/date endpoint
 * 4. Returns attendance records for specified date
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.search; // Preserve all query params (date, batch, course)

    // Forward request to Express backend with cookies
    const backendUrl = `${BACKEND_URL}/api/attendance/date${searchParams}`;
    const cookies = extractCookies(request);

    console.log('🔍 [BFF] Fetching attendance:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [BFF] Backend error:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to fetch attendance' },
        { status: response.status }
      );
    }

    console.log('✅ [BFF] Attendance fetched successfully');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ [BFF] Attendance fetch error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
