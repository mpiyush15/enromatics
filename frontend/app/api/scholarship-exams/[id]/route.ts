/**
 * BFF Route: /api/scholarship-exams/[id]
 * Proxies to Express backend: GET/PUT/DELETE /api/scholarship-exams/:id
 * 
 * Purpose: Handle individual scholarship exam operations
 * Cache TTL: 5 minutes for GET, no cache for mutations
 * 
 * Supported operations:
 * - GET /api/scholarship-exams/[id] - Get single exam (cached)
 * - PUT /api/scholarship-exams/[id] - Update exam (not cached)
 * - DELETE /api/scholarship-exams/[id] - Delete exam (not cached)
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
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
  return `scholarship-exam:${examId}`;
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
      console.log('[BFF] Scholarship Exam Cache HIT (age:', now - cachedEntry.timestamp, 'ms)');
      
      const response = NextResponse.json(cachedEntry.data);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }

    // Cache miss - fetch from backend
    const backendUrl = new URL(`/api/scholarship-exams/${examId}`, BACKEND_URL);
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
      console.error('❌ BFF Scholarship Exam GET error:', backendResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch exam' },
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
      
      console.log('[BFF] Scholarship Exam Cache MISS (fresh data from backend)');
    }

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;

  } catch (error: any) {
    console.error('❌ BFF Scholarship Exam GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    
    // Invalidate cache for this exam
    cache.delete(getCacheKey(examId));
    cache.delete('scholarship-exams:list'); // Clear list cache too
    console.log('[BFF] Scholarship exam cache cleared due to mutation (PUT)');

    const backendUrl = new URL(`/api/scholarship-exams/${examId}`, BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Scholarship Exam PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    
    // Invalidate cache
    cache.delete(getCacheKey(examId));
    cache.delete('scholarship-exams:list');
    console.log('[BFF] Scholarship exam cache cleared due to mutation (DELETE)');

    const backendUrl = new URL(`/api/scholarship-exams/${examId}`, BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Scholarship Exam DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export function invalidateExamCache(examId: string) {
  cache.delete(getCacheKey(examId));
  cache.delete('scholarship-exams:list');
}
