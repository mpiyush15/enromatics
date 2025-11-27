/**
 * BFF Route: /api/scholarship-exams/[id]/stats
 * Proxies to Express backend: GET /api/scholarship-exams/:id/stats
 * 
 * Purpose: Get exam statistics with caching
 * Cache TTL: 2 minutes (stats update frequently)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://enromatics.com";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
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

function getCacheKey(examId: string): string {
  return `scholarship-exam-stats:${examId}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const cacheKey = getCacheKey(examId);
    const now = Date.now();

    // Check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Exam Stats Cache HIT (age:', now - cachedEntry.timestamp, 'ms)');
      
      const response = NextResponse.json(cachedEntry.data);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', 'public, max-age=120');
      return response;
    }

    // Cache miss - fetch from backend
    const backendUrl = new URL(`/api/scholarship-exams/${examId}/stats`, BACKEND_URL);
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
      console.error('❌ BFF Exam Stats GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch stats' },
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
      
      console.log('[BFF] Exam Stats Cache MISS (fresh data from backend)');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=120');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Exam Stats GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export function invalidateStatsCache(examId: string) {
  cache.delete(getCacheKey(examId));
  console.log('[BFF] Stats cache cleared for exam:', examId);
}
