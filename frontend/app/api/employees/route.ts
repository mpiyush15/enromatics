/**
 * BFF Employees Data Route with Redis Caching
 * 
 * GET /api/employees - List all employees
 * POST /api/employees - Create employee
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// Extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function getCacheKey(tenantId: string): string {
  return `employees:list:${tenantId}`;
}

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || 'default';
    const cacheKey = getCacheKey(tenantId);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] Employees Cache HIT');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    const endpoint = `/api/employees`;

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch employees' },
        { status: backendResponse.status }
      );
    }

    const cleanData = { success: true, ...data };

    // Cache the response
    await redisCache.set(cacheKey, cleanData, CACHE_TTL.MEDIUM);
    console.log('[BFF] Employees Cache MISS - cached for 5 min');

    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('❌ Employees BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create employee
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
    const body = await request.json();
    const endpoint = `/api/employees`;

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, ...data },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache after mutation
    if (tenantId) {
      await redisCache.delPattern(`employees:*:${tenantId}*`);
      console.log('[BFF] Employees cache invalidated after POST');
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ Employee Create BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
