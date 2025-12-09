import { NextRequest, NextResponse } from "next/server";
import { redisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ message: "Tenant ID is required" }, { status: 400 });
    }

    // Check Redis cache
    const cacheKey = CACHE_KEYS.BATCHES_LIST(tenantId);
    const cached = await redisCache.get<any>(cacheKey);
    
    if (cached) {
      console.log('[BFF] Batches Cache HIT');
      const response = NextResponse.json(cached, { status: 200 });
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Type', redisCache.isConnected() ? 'REDIS' : 'MEMORY');
      return response;
    }

    const cookie = request.cookies.get("token");

    const response = await fetch(`${BACKEND_URL}/api/batches?tenantId=${tenantId}`, {
      method: "GET",
      headers: {
        Cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Cache successful response
    await redisCache.set(cacheKey, data, CACHE_TTL.LONG);
    console.log('[BFF] Batches Cache MISS - cached for 10 min');

    const res = NextResponse.json(data, { status: 200 });
    res.headers.set('X-Cache', 'MISS');
    return res;
  } catch (error: any) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
