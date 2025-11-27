import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes - sidebar config rarely changes

const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(role: string, tenantId?: string): string {
  return `sidebar-${role}-${tenantId || 'global'}`;
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';

    // Fetch from backend with cookies to get authenticated user's role
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/ui/sidebar`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch sidebar' },
        { status: backendResponse.status }
      );
    }

    // Cache the response based on role and tenantId
    const cacheKey = getCacheKey(data.role, data.tenantId);
    const now = Date.now();
    cache.set(cacheKey, { data, timestamp: now });

    // Cache cleanup
    if (cache.size > 200) {
      const firstKey = cache.keys().next().value as string;
      if (firstKey) cache.delete(firstKey);
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error: any) {
    console.error('Sidebar error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sidebar' },
      { status: 500 }
    );
  }
}
