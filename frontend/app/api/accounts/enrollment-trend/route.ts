/**
 * BFF Route: /api/accounts/enrollment-trend
 * Proxies to Express backend: GET /api/accounts/enrollment-trend
 * 
 * Purpose: Fetch enrollment trend data by month with live data
 * Cache: No cache (real-time data)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const backendUrl = new URL("/api/accounts/enrollment-trend", BACKEND_URL);
    
    // Forward query parameters
    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch enrollment trend', status: backendResponse.status },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Set no-cache headers for real-time data
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: any) {
    console.error('❌ BFF Enrollment Trend error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}
