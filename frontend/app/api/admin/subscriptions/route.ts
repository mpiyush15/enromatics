import { NextRequest, NextResponse } from 'next/server';
import { redisCache, CACHE_TTL } from '@/lib/redis';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    // Get Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized - no token' }, { status: 401 });
    }

    // Check Redis cache
    const cacheKey = 'admin:subscriptions';
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { 
        status: 200,
        headers: { 
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        },
      });
    }

    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/payments/admin/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    // Cache successful responses (5 min)
    if (response.ok) {
      await redisCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: { 
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
      },
    });
  } catch (error) {
    console.error('❌ Admin subscriptions API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
