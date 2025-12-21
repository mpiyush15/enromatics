/**
 * BFF Route: Student Attendance History
 * 
 * GET /api/attendance/student/[studentId]?startDate=...&endDate=...&page=1&limit=30
 * 
 * 1. Retrieves auth cookies from request
 * 2. Forwards to Express backend with cookies
 * 3. Calls Express /api/attendance/student/:studentId endpoint
 * 4. Returns attendance history with summary
 */

import { NextRequest, NextResponse } from "next/server";
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const url = new URL(request.url);
    const searchParams = url.search;

    const backendUrl = `${BACKEND_URL}/api/attendance/student/${studentId}${searchParams}`;
    const cookies = extractCookies(request);

    console.log('🔍 [BFF] Fetching student attendance:', backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookies,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [BFF] Backend error:', data);
      return NextResponse.json(
        { message: data.message || "Failed to fetch attendance" },
        { status: response.status }
      );
    }

    console.log('✅ [BFF] Student attendance fetched successfully');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ [BFF] Student attendance error:", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
