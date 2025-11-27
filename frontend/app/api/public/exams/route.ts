import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - exam info cache (stable data)

const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(examCode: string): string {
  return `public-exam-${examCode}`;
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
    const now = Date.now();

    // Check cache (10 min TTL)
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.data, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/scholarship-exams/public/${examCode}`,
      { method: 'GET' }
    );

    const data = await backendResponse.json();

    // Cache the response
    if (backendResponse.ok) {
      cache.set(cacheKey, { data, timestamp: now });

      // Cache cleanup
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value as string;
        if (firstKey) cache.delete(firstKey);
      }
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'MISS' },
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
    cache.delete(cacheKey);

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
