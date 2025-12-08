/**
 * BFF Staff Data Route
 * 
 * GET /api/staff - List all staff
 * POST /api/staff - Create staff
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// In-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function invalidateCache(): void {
  cache.clear();
  console.log('[BFF] Staff cache cleared due to mutation');
}

// Extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// GET /api/staff
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const endpoint = `/api/staff${url.search}`;
    const cacheKey = `staff:list:${url.search}`;

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Staff Cache HIT (age:', Date.now() - cachedEntry.timestamp, 'ms)');
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=180',
        },
      });
    }

    console.log('📤 Calling Backend:', `${BACKEND_URL}${endpoint}`);

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch staff' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Backend returned staff data');

    const cleanData = { success: true, ...data };

    // Cache the response
    cache.set(cacheKey, { data: cleanData, timestamp: Date.now() });

    // Cleanup old entries
    if (cache.size > 20) {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL * 2) {
          cache.delete(key);
        }
      }
    }

    console.log('[BFF] Staff Cache MISS (fresh data)');
    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=180',
      },
    });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create staff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = `/api/staff`;

    console.log('📤 Creating staff via BFF');

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
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create staff' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on create
    invalidateCache();

    console.log('✅ Staff created successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
