import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { redisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error('EXPRESS_BACKEND_URL not configured');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = CACHE_KEYS.BATCHES_LIST(tenantId);
    const cached = await redisCache.get<any>(cacheKey);

    if (cached) {
      console.log('[BFF] Batches Cache HIT');
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
          'Cache-Control': 'public, max-age=600',
        },
      });
    }

    const backendRes = await fetch(
      `${BACKEND_URL}/api/batches?tenantId=${tenantId}`,
      {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const cleanData = {
      success: true,
      batches: data.batches || data || [],
    };

    await redisCache.set(cacheKey, cleanData, CACHE_TTL.LONG);
    console.log('[BFF] Batches Cache MISS - cached');

    return NextResponse.json(cleanData, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600',
      },
    });

  } catch (error: any) {
    console.error("❌ BFF batches error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
