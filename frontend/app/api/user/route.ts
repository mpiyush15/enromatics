import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// In-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint: string, search: string): string {
  return `${endpoint}:${search}`;
}

function invalidateCache(): void {
  cache.clear();
  console.log('[BFF] Users cache cleared due to mutation');
}

// GET /api/user - List users (tenant-scoped)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'tenantId parameter is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey('users', url.search);
    const cachedEntry = cache.get(cacheKey);
    
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log('[BFF] Users Cache HIT');
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    console.log('📤 Calling Backend:', `${BACKEND_URL}/api/user${url.search}`);

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/user${url.search}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch users', status: backendResponse.status },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Backend returned users data');

    // Clean response - remove sensitive fields
    const cleanData = Array.isArray(data)
      ? data.map((user: any) => cleanUser(user))
      : data;

    // Cache the response
    cache.set(cacheKey, {
      data: cleanData,
      timestamp: Date.now(),
    });

    // Cleanup old entries
    if (cache.size > 50) {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL * 2) {
          cache.delete(key);
        }
      }
    }

    console.log('[BFF] Users Cache MISS (fresh data)');
    return NextResponse.json(cleanData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    console.error('❌ BFF Users GET error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/user - Create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📤 Creating user via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend POST error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create user' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on create
    invalidateCache();

    console.log('✅ User created successfully');

    const cleanData = {
      success: true,
      user: data.user ? cleanUser(data.user) : data,
      message: data.message,
    };

    return NextResponse.json(cleanData, { status: 201 });
  } catch (error: any) {
    console.error('❌ BFF Users POST error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/:id - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    console.log('📤 Updating user via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/user/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend PUT error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update user' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on update
    invalidateCache();

    console.log('✅ User updated successfully');

    const cleanData = {
      success: true,
      user: data.user ? cleanUser(data.user) : data,
      message: data.message,
    };

    return NextResponse.json(cleanData);
  } catch (error: any) {
    console.error('❌ BFF Users PUT error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    console.log('📤 Deleting user via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/user/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend DELETE error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete user' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on delete
    invalidateCache();

    console.log('✅ User deleted successfully');

    return NextResponse.json({
      success: true,
      message: data.message || 'User deleted',
    });
  } catch (error: any) {
    console.error('❌ BFF Users DELETE error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Clean user data - remove sensitive fields
 */
function cleanUser(user: any): any {
  if (!user) return null;

  return {
    _id: user._id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    department: user.department,
    designation: user.designation,
    profilePicture: user.profilePicture,
    tenantId: user.tenantId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Include additional fields but exclude password/sensitive data
    ...(user.permissions && { permissions: user.permissions }),
    // Never expose
    // password: ❌
    // refreshToken: ❌
    // otp: ❌
    // internalNotes: ❌
  };
}
