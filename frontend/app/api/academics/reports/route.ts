import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

/**
 * BFF Route: /api/academics/reports
 * 
 * GET /api/academics/reports - Get test reports and analytics
 * 
 * Pattern: SSOT (Single Source of Truth)
 * - Direct forwarding to Express backend
 * - No caching during stabilization phase
 * - Cookie-based authentication
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryString = url.search;
    const endpoint = `/api/academics/reports${queryString}`;

    const cookies = extractCookies(request);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch reports' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ BFF Reports GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
