/**
 * BFF Route: /api/scholarship-exams/[id]/registrations
 * Proxies to Express backend: GET /api/scholarship-exams/:id/registrations
 * 
 * Purpose: Get exam registrations with caching
 * Cache TTL: 3 minutes (registrations update frequently)
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes
const MAX_CACHE_ENTRIES = 50;

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
}, 60000);

function getCacheKey(req: NextRequest, examId: string): string {
  const url = new URL(req.url);
  const params = url.searchParams.toString();
  return `scholarship-exam-registrations:${examId}:${params}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const cacheKey = getCacheKey(request, examId);
    const now = Date.now();

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Exam Registrations Cache HIT (age:', now - cachedEntry.timestamp, 'ms)');
      
      const response = NextResponse.json(cachedEntry.data);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', 'public, max-age=180');
      return response;
    }

    // Cache miss - fetch from backend
    const url = new URL(request.url);
    const backendUrl = new URL(`/api/scholarship-exams/${examId}/registrations`, BACKEND_URL);
    
    // Forward query parameters (status, page, limit, search, etc.)
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
      console.error('❌ BFF Exam Registrations GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch registrations' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    if (data.success) {
      cache.set(cacheKey, { data, timestamp: now });
      
      if (cache.size > MAX_CACHE_ENTRIES) {
        const firstKey = cache.keys().next().value as string;
        if (firstKey) cache.delete(firstKey);
      }
      
      console.log('[BFF] Exam Registrations Cache MISS (fresh data from backend)');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=180');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Exam Registrations GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export function invalidateRegistrationsCache(examId: string) {
  // Clear all registration caches for this exam
  const prefix = `scholarship-exam-registrations:${examId}`;
  cache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  });
  console.log('[BFF] Registrations cache cleared for exam:', examId);
}

// POST - Manual registration by admin
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: examId } = params;
    const body = await request.json();

    // Forward to backend with cookies
    const response = await fetch(
      `${BACKEND_URL}/api/scholarship-exams/${examId}/registrations/manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    
    // Invalidate cache on successful registration
    if (data.success) {
      invalidateRegistrationsCache(examId);
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("BFF Error - Manual Registration:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
