import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for dashboard overview

const cache = new Map<string, { data: any; timestamp: number }>();

const CACHE_KEY = 'social-dashboard';

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 BFF: Fetching social media dashboard data');
    
    const now = Date.now();

    // Check cache (5 min TTL)
    const cachedEntry = cache.get(CACHE_KEY);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      console.log('✅ BFF: Using cached dashboard data');
      return NextResponse.json(cachedEntry.data, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    console.log('🔵 BFF: Forwarding request with cookies, cookie length:', cookies.length);

    // Fetch from backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/facebook/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    console.log('🔵 BFF: Backend response status:', backendResponse.status);
    const data = await backendResponse.json();
    console.log('🔵 BFF: Backend response data:', {
      success: data.success,
      hasAdAccounts: !!data.dashboard?.adAccounts,
      adAccountsCount: data.dashboard?.adAccounts?.length,
      hasPagesData: !!data.dashboard?.pages,
      pagesCount: data.dashboard?.pages?.length
    });

    // Cache the response
    if (backendResponse.ok) {
      cache.set(CACHE_KEY, { data, timestamp: now });
      console.log('✅ BFF: Cached dashboard response');
    } else {
      console.error('❌ BFF: Backend returned error:', data);
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('❌ Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
