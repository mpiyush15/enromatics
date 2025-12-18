/**
 * BFF Attendance Mark Route
 * 
 * POST /api/attendance/mark
 * Body: { records: [...] }
 * 
 * This route:
 * 1. Receives attendance marking request from frontend
 * 2. Forwards cookies to Express backend
 * 3. Calls Express /api/attendance/mark endpoint
 * 4. Saves attendance records
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to Express backend with cookies
    const backendUrl = `${BACKEND_URL}/api/attendance/mark`;
    const cookies = extractCookies(request);

    console.log('🔍 [BFF] Marking attendance for', body.records?.length || 0, 'students');

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [BFF] Backend error:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to mark attendance' },
        { status: response.status }
      );
    }

    console.log('✅ [BFF] Attendance marked successfully');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ [BFF] Attendance mark error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
