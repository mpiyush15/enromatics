import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

const CACHE_KEY = 'social:dashboard';

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 BFF: Fetching social media dashboard data');

    // Check Redis cache (5 min TTL)
    const cached = await redisCache.get<any>(CACHE_KEY);
    if (cached) {
      console.log('✅ BFF: Using cached dashboard data');
      return NextResponse.json(cached, {
        headers: { 
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
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
      await redisCache.set(CACHE_KEY, data, CACHE_TTL.MEDIUM);
      console.log('✅ BFF: Cached dashboard response');
    } else {
      console.error('❌ BFF: Backend returned error:', data);
    }

    return NextResponse.json(data, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
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
