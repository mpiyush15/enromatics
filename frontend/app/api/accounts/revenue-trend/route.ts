/**
 * BFF Route: /api/accounts/revenue-trend
 * Proxies to Express backend: GET /api/accounts/revenue-trend
 * 
 * Purpose: Fetch revenue trend data by month with caching
 * Cache TTL: 10 minutes (financial data)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const backendUrl = new URL("/api/accounts/revenue-trend", BACKEND_URL);
    
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
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch revenue trend', status: backendResponse.status },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Set cache headers - NO CACHE for real-time financial data
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('[BFF] Revenue trend fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
