import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(examCode: string): string {
  return `public:exam:${examCode}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const examCode = searchParams.get('examCode');

    if (!examCode) {
      return NextResponse.json(
        { error: 'examCode is required' },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(examCode);

    // Check Redis cache (10 min TTL - stable data)
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
      });
    }

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/scholarship-exams/public/${examCode}`,
      { method: 'GET' }
    );

    const data = await backendResponse.json();

    // Cache the response (10 min)
    if (backendResponse.ok) {
      await redisCache.set(cacheKey, data, CACHE_TTL.LONG);
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
    });
  } catch (error: any) {
    console.error('Exam info error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch exam' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = request.nextUrl;
    const examCode = searchParams.get('examCode');

    if (!examCode) {
      return NextResponse.json(
        { error: 'examCode is required' },
        { status: 400 }
      );
    }

    // Registration submission (no cache)
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/scholarship-exams/public/${examCode}/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    // Invalidate cache after registration
    const cacheKey = getCacheKey(examCode);
    await redisCache.del(cacheKey);

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Exam registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register for exam' },
      { status: 500 }
    );
  }
}
