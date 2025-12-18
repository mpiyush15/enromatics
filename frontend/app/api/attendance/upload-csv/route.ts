/**
 * BFF Attendance CSV Upload Route
 * 
 * POST /api/attendance/upload-csv
 * Body: FormData with CSV file
 * 
 * This route:
 * 1. Receives CSV upload request from frontend
 * 2. Forwards cookies to Express backend
 * 3. Calls Express /api/attendance/upload-csv endpoint
 * 4. Processes bulk attendance upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    // Get FormData from request
    const formData = await request.formData();

    // Forward request to Express backend with cookies
    const backendUrl = `${BACKEND_URL}/api/attendance/upload-csv`;
    const cookies = extractCookies(request);

    console.log('🔍 [BFF] Uploading attendance CSV');

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        // Don't set Content-Type - let fetch set it with boundary for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [BFF] Backend error:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to upload CSV' },
        { status: response.status }
      );
    }

    console.log('✅ [BFF] CSV uploaded successfully');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ [BFF] CSV upload error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
