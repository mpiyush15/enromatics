/**
 * BFF Route: /api/whatsapp/config
 * Purpose: Handle WhatsApp configuration with Redis caching
 * Cache TTL: 10 minutes (config changes rarely)
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

function getCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || 'default';
  return `whatsapp:config:${tenantId}`;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);

    // Check Redis cache
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      console.log('[BFF] WhatsApp Config Cache HIT');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
          'Cache-Control': 'public, max-age=600',
        },
      });
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    const url = new URL(request.url);

    console.log('📤 Fetching WhatsApp config from backend');

    // Fetch from backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/whatsapp/config${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
    });

    console.log(`📍 Backend response status: ${backendResponse.status}`);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`❌ Backend WhatsApp config error: ${backendResponse.status}`, errorText);
      
      return NextResponse.json(
        { 
          message: 'Failed to fetch WhatsApp config',
          status: backendResponse.status,
          details: errorText
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Cache the response
    await redisCache.set(cacheKey, data, CACHE_TTL.LONG);
    console.log('[BFF] WhatsApp Config Cache MISS - cached for 10 min');
    
    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (error: any) {
    console.error('❌ WhatsApp Config BFF Error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';

    console.log('📤 Updating WhatsApp config via backend');

    const backendResponse = await fetch(`${BACKEND_URL}/api/whatsapp/config${url.search}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`❌ Backend PUT error: ${backendResponse.status}`, errorText);
      
      return NextResponse.json(
        { 
          message: 'Failed to update WhatsApp config',
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Invalidate cache on update
    if (tenantId) {
      await redisCache.delPattern(`whatsapp:*:${tenantId}*`);
      console.log('[BFF] WhatsApp cache invalidated after PUT');
    }

    console.log('✅ WhatsApp config updated successfully');

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'BYPASS' },
    });
  } catch (error: any) {
    console.error('❌ WhatsApp Config PUT Error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
