import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔒 BFF Route: GET /api/dashboard/overview (STABILIZED)
 * 
 * Part of: stabilization/ssot-bff
 * Date: 21 Dec 2025
 * 
 * Fetches dashboard overview data including:
 * - Student count
 * - Revenue totals
 * - Test statistics
 * - Attendance data
 * - Active batches
 * 
 * Features:
 * - ✅ Forwards cookies to Express backend for auth
 * - ✅ Single source of truth (backend only)
 * - ✅ No caching (per stabilization rules)
 * - ✅ Clean error handling
 */

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://endearing-blessing-production-c61f.up.railway.app";
    
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    // Extract cookies from incoming request
    const cookies = request.headers.get('cookie') || '';
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Build the URL
    const url = `${BACKEND_URL}/api/dashboard/overview${queryString ? '?' + queryString : ''}`;

    // Call Express backend with cookies
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { Cookie: cookies }),
      },
    });

    const data = await response.json();

    // If successful, return the data
    if (response.ok) {
      return NextResponse.json(data);
    }

    // If unauthorized, return 401
    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For other errors
    return NextResponse.json(
      data || { error: 'Failed to fetch overview' },
      { status: response.status }
    );
  } catch (error) {
    console.error('[BFF] Dashboard Overview Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
