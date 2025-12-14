/**
 * BFF Students Data Route
 * 
 * GET /api/students - List all students
 * GET /api/students/:id - Get single student
 * POST /api/students - Create student
 * PUT /api/students/:id - Update student
 * 
 * This route:
 * 1. Receives requests from frontend
 * 2. Forwards cookies to Express backend
 * 3. Calls Express /api/students endpoints
 * 4. Caches GET responses with Redis (5 minute TTL)
 * 5. Invalidates cache on POST/PUT/DELETE
 * 6. Filters sensitive data
 * 7. Returns cleaned response
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { redisCache, CACHE_TTL, invalidateStudentCache } from '@/lib/redis';
import type { StudentDTO, StudentListResponse, StudentMutationResponse } from '@/types/student';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;
function getCacheKey(search: string): string {
  return `students:list:${search}`;
}

// GET /api/students or /api/students/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {

    const url = new URL(request.url);
    const studentId = params?.id;
    const endpoint = studentId 
      ? `/api/students/${studentId}`
      : `/api/students${url.search}`; // Preserve query params (pagination, filters)

    // 🔥 Check if this is a cache-busting request (has _ts parameter)
    const hasCacheBuster = url.searchParams.has('_ts');

    // Check Redis cache for list requests (not single student by ID, and not cache-busting)
    if (!studentId && !hasCacheBuster) {
      const cacheKey = getCacheKey(url.search);
      const cachedData = await redisCache.get<any>(cacheKey);
      
      if (cachedData) {
        const cacheType = redisCache.isConnected() ? 'REDIS' : 'MEMORY';
        console.log(`[BFF] Students Cache HIT (${cacheType})`);
        return NextResponse.json(cachedData, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Type': cacheType,
            'Cache-Control': 'public, max-age=300',
          },
        });
      }
      
      if (hasCacheBuster) {
        console.log('🔄 Cache MISS (cache buster active - _ts parameter present)');
      } else {
        console.log('🔄 Cache MISS (not in cache)');
      }
    }

    console.log('📤 Calling Backend:', `${BACKEND_URL}${endpoint}`);

    const backendResponse = await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch students', status: backendResponse.status },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Backend returned students data');

    // Clean response - remove sensitive fields
    const cleanData: StudentListResponse | { success: boolean; student: StudentDTO | null } = {
      success: true,
      ...data,
      // If it's a list, clean each student
      students: Array.isArray(data.students)
        ? data.students.map((student: any) => cleanStudent(student))
        : undefined,
      // If it's a single student
      student: data.student ? cleanStudent(data.student) : undefined,
    };

    // Cache list requests only with Redis
    if (!studentId) {
      const cacheKey = getCacheKey(url.search);
      await redisCache.set(cacheKey, cleanData, CACHE_TTL.MEDIUM);

      const cacheType = redisCache.isConnected() ? 'REDIS' : 'MEMORY';
      console.log(`[BFF] Students Cache MISS (stored in ${cacheType})`);
      return NextResponse.json(cleanData, {
        headers: {
          'X-Cache': 'MISS',
          'X-Cache-Type': cacheType,
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return NextResponse.json(cleanData);
  } catch (error) {
    console.error('❌ BFF Students GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📤 Creating student via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/students`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend POST error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create student' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on create using Redis pattern
    const tenantId = body.tenantId || 'default';
    await invalidateStudentCache(); // wildcard / pattern based
    console.log('[BFF] Students cache invalidated due to mutation');

    console.log('✅ Student created successfully');

    const cleanData: StudentMutationResponse = {
      success: true,
      student: data.student ? cleanStudent(data.student) : undefined,
      message: data.message,
    };

    return NextResponse.json(cleanData, { status: 201 });
  } catch (error) {
    console.error('❌ BFF Students POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/students/:id - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    
    // Handle reset-password endpoint
    if (url.pathname.endsWith('/reset-password')) {
      console.log('📤 Resetting student password via Backend');

      const backendResponse = await fetch(
        `${BACKEND_URL}/api/students/${params.id}/reset-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': extractCookies(request),
            'X-Tenant-Guard': 'true',
          },
        }
      );

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        console.error('❌ Backend reset-password error:', backendResponse.status, data);
        return NextResponse.json(
          { success: false, message: data.message || 'Failed to reset password' },
          { status: backendResponse.status }
        );
      }

      // Invalidate cache on password reset
      await invalidateStudentCache();
      console.log('[BFF] Students cache invalidated due to password reset');

      return NextResponse.json({ success: true, ...data });
    }

    // Handle regular student update
    const body = await request.json();

    console.log('📤 Updating student via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/students/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend PUT error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update student' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on update using Redis pattern
    await invalidateStudentCache();
    console.log('[BFF] Students cache invalidated due to update');

    console.log('✅ Student updated successfully');

    const cleanData: StudentMutationResponse = {
      success: true,
      student: data.student ? cleanStudent(data.student) : undefined,
      message: data.message,
    };

    return NextResponse.json(cleanData);
  } catch (error) {
    console.error('❌ BFF Students PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    console.log('📤 Deleting student via Backend');

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/students/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend DELETE error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete student' },
        { status: backendResponse.status }
      );
    }

    // Invalidate cache on delete using Redis pattern
    await invalidateStudentCache();
    console.log('[BFF] Students cache invalidated due to delete');

    console.log('✅ Student deleted successfully');

    return NextResponse.json({
      success: true,
      message: data.message || 'Student deleted',
    });
  } catch (error) {
    console.error('❌ BFF Students DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Clean student data - remove sensitive fields
 * Maps backend response to StudentDTO
 */
function cleanStudent(student: any): StudentDTO | null {
  if (!student) return null;

  return {
    // ✅ ALWAYS include both id and _id
    _id: student._id,
    id: student.id || student._id,
    
    tenantId: student.tenantId,
    name: student.name,
    email: student.email,
    phone: student.phone,
    gender: student.gender,
    course: student.course,
    
    // 🔑 BATCH HANDLING - normalize both fields
    batchId: student.batchId,
    batchName: student.batch || student.batchName,  // Handle both 'batch' and 'batchName'
    
    rollNumber: student.rollNumber,
    enrollmentNumber: student.enrollmentNumber,
    fees: student.fees,
    balance: student.balance,
    status: student.status,
    address: student.address,
    city: student.city,
    state: student.state,
    pincode: student.pincode,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    
    // Never expose
    // password: ❌
    // refreshToken: ❌
    // otp: ❌
  };
}
