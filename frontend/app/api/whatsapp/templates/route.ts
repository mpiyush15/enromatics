/**
 * BFF Route: /api/whatsapp/templates
 * Purpose: WhatsApp templates with Redis caching
 * Cache TTL: 10 minutes (templates rarely change)
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(request: NextRequest): string {
  const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default';
  const status = request.nextUrl.searchParams.get('status') || 'all';
  const useCase = request.nextUrl.searchParams.get('useCase') || 'all';
  return `${CACHE_KEYS.WHATSAPP_TEMPLATES(tenantId)}:${status}:${useCase}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] WhatsApp Templates Cache HIT');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
      });
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    const status = request.nextUrl.searchParams.get('status') || '';
    const useCase = request.nextUrl.searchParams.get('useCase') || '';

    // Build query string
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (useCase) queryParams.append('useCase', useCase);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/templates${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    // Cache the response
    if (backendResponse.ok) {
      await redisCache.set(cacheKey, data, CACHE_TTL.LONG);
      console.log('[BFF] WhatsApp Templates Cache MISS - cached for 10 min');
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
      status: backendResponse.status,
    });
  } catch (error: any) {
    console.error('Templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';
    const tenantId = request.nextUrl.searchParams.get('tenantId') || '';

    // POST requests bypass cache
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/whatsapp/templates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    const data = await backendResponse.json();

    // Invalidate template caches on create
    if (tenantId) {
      await redisCache.delPattern(`whatsapp:templates:${tenantId}*`);
      console.log('[BFF] WhatsApp Templates cache invalidated after POST');
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}
