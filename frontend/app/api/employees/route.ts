/**
 * BFF Employees Data Route
 * 
 * GET /api/employees - List all employees
 * POST /api/employees - Create employee
 * 
 * This route:
 * 1. Receives requests from frontend
 * 2. Forwards auth token to Express backend
 * 3. Calls Express /api/employees endpoints
 * 4. Caches GET responses (3 minute TTL)
 * 5. Invalidates cache on POST
 * 6. Returns cleaned response
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
  console.log('[BFF] Employees cache cleared due to mutation');
}

// Extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    const endpoint = `/api/employees`;
    const cacheKey = 'employees:list';

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Employees Cache HIT (age:', Date.now() - cachedEntry.timestamp, 'ms)');
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
        { success: false, message: data.message || 'Failed to fetch employees' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Backend returned employees data');

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

    console.log('[BFF] Employees Cache MISS (fresh data)');
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

// POST /api/employees - Create employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = `/api/employees`;

    console.log('📤 Creating employee via BFF');

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
        { success: false, message: data.message || 'Failed to create employee' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on create
    invalidateCache();

    console.log('✅ Employee created successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
