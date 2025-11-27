import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes - exam results cache

const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(registrationNumber: string): string {
  return `public-result-${registrationNumber}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const registrationNumber = searchParams.get('registrationNumber');
    const action = searchParams.get('action'); // 'result' or 'admit-card' or 'enrollment'

    if (!registrationNumber) {
      return NextResponse.json(
        { error: 'registrationNumber is required' },
        { status: 400 }
      );
    }

    if (action === 'admit-card') {
      // Admit card is always fetched fresh (no caching for PDFs)
      const backendResponse = await fetch(
        `${BACKEND_URL}/api/scholarship-exams/public/admit-card/${registrationNumber}`,
        { method: 'GET' }
      );

      if (!backendResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to generate admit card' },
          { status: backendResponse.status }
        );
      }

      const blob = await backendResponse.blob();
      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="admit_card_${registrationNumber}.pdf"`,
        },
      });
    }

    // For result data - cache it (5 min TTL)
    const cacheKey = getCacheKey(registrationNumber);
    const now = Date.now();

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.data, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/scholarship-exams/public/result/${registrationNumber}`,
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
    console.error('Results error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.registrationNumber) {
      return NextResponse.json(
        { error: 'registrationNumber is required' },
        { status: 400 }
      );
    }

    // Enrollment interest submission (no cache)
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/scholarship-exams/public/enrollment-interest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    // Invalidate cache after submission
    const cacheKey = getCacheKey(body.registrationNumber);
    cache.delete(cacheKey);

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit enrollment' },
      { status: 500 }
    );
  }
}
