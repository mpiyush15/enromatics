import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { redisCache, CACHE_TTL } from '@/lib/redis';

/**
 * BFF Route: /api/academics/students/[studentId]/tests
 * 
 * GET /api/academics/students/:studentId/tests - Get all tests for a specific student
 * 
 * Features:
 * - ✅ Redis caching (5 minutes)
 * - ✅ Secure cookie forwarding
 * - ✅ Student progress tracking
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const { studentId } = params;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check Redis cache
    const cacheKey = `student-tests:${studentId}`;
    const cached = await redisCache.get<any>(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const endpoint = `/api/academics/students/${studentId}/tests`;
    console.log('📤 Calling Express:', `${EXPRESS_URL}${endpoint}`);

    const expressResponse = await fetch(`${EXPRESS_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch student tests' },
        { status: expressResponse.status }
      );
    }

    const cleanData = {
      success: true,
      ...data,
    };

    // Cache the response
    await redisCache.set(cacheKey, cleanData, CACHE_TTL.MEDIUM);

    console.log('[BFF] Student Tests Cache MISS (fresh data)');
    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('❌ BFF Student Tests GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
