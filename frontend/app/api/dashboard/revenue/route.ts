import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔒 BFF Route: GET /api/dashboard/revenue (STABILIZED)
 * 
 * Part of: stabilization/ssot-bff
 * Forwards to: Backend /api/dashboard/revenue
 * 
 * Features:
 * - ✅ Cookie-based auth forwarding
 * - ✅ Query params support (view=quarterly|annual)
 * - ✅ Error handling
 */
export async function GET(req: NextRequest) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
    
    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const view = searchParams.get('view') || 'quarterly';
    
    // Extract ALL cookies from incoming request (same as overview route)
    const cookies = req.headers.get('cookie') || '';
    
    console.log('🔄 BFF: Forwarding revenue request to backend', { view, hasCookies: !!cookies });
    
    // Forward to backend
    const url = `${BACKEND_URL}/api/dashboard/revenue?view=${view}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { Cookie: cookies }),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend revenue error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch revenue data' },
        { status: response.status }
      );
    }

    console.log('✅ Revenue data fetched successfully');
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('❌ BFF revenue error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
