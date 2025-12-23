/**
 * BFF Route: /api/scholarship-exams
 * Purpose: Handle scholarship exam management with Redis caching
 * Cache TTL: 5 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  const params = url.searchParams.toString();
  return `scholarship:exams:${tenantId}:${params}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Scholarship Exams List Cache HIT');
      
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }

    // Cache miss - fetch from backend
    const url = new URL(request.url);
    const backendUrl = new URL("/api/scholarship-exams", BACKEND_URL);
    
    // Forward query parameters (status, page, limit, etc.)
    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const cookies = request.headers.get('cookie') || '';

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      console.error('❌ BFF Scholarship Exams GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch exams' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
      console.log('[BFF] Scholarship Exams List Cache MISS - cached for 5 min');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Scholarship Exams GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
    
    const backendUrl = new URL("/api/scholarship-exams", BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await backendResponse.json();
    
    // Invalidate cache after mutation
    if (tenantId) {
      await redisCache.delPattern(`scholarship:*:${tenantId}*`);
      console.log('[BFF] Scholarship Exams cache invalidated after POST');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Scholarship Exams POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Helper for cache invalidation
export async function invalidateScholarshipExamsCache(tenantId: string): Promise<void> {
  await redisCache.delPattern(`scholarship:*:${tenantId}*`);
  console.log('[BFF] Scholarship exams cache invalidated');
}
