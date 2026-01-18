/**
 * BFF Students Data Route (STABILIZED - NO CACHING)
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
 * 4. Filters sensitive data
 * 5. Returns cleaned response
 * 
 * NO Redis caching during stabilization phase.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import type { StudentDTO, StudentListResponse, StudentMutationResponse } from '@/types/student';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

/**
 * Extract tenantId from JWT token
 * Tries multiple sources:
 * 1. Authorization header (Bearer token)
 * 2. jwt cookie (httpOnly, set by login)
 * 3. auth_token or token cookies
 */
function extractTenantIdFromToken(request: NextRequest): string | null {
  try {
    let tokenValue: string | null = null;

    // 1️⃣ Try Authorization header first (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      tokenValue = authHeader.substring(7);
      console.log('✅ Found token in Authorization header');
    }

    // 2️⃣ Try cookies
    if (!tokenValue) {
      const cookieString = extractCookies(request);
      console.log('🔍 Cookie string for token extraction:', cookieString ? `${cookieString.substring(0, 50)}...` : 'NONE');
      
      if (cookieString) {
        // Try jwt first (primary), then auth_token, then token
        const jwtMatch = cookieString.match(/jwt=([^;]+)/);
        const authTokenMatch = cookieString.match(/auth_token=([^;]+)/);
        const tokenMatch = cookieString.match(/token=([^;]+)/);
        tokenValue = jwtMatch?.[1] || authTokenMatch?.[1] || tokenMatch?.[1];
        
        if (tokenValue) {
          console.log('✅ Found token in cookies (jwt/auth_token/token)');
        }
      }
    }

    if (!tokenValue) {
      console.log('⚠️  No token found in Authorization header or cookies');
      return null;
    }

    console.log('✅ Found token:', tokenValue.substring(0, 30) + '...');

    // Decode JWT (simple base64, not verifying signature since we trust our own cookies)
    const parts = tokenValue.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format (expected 3 parts, got', parts.length + ')');
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    console.log('✅ Decoded JWT payload:', { tenantId: payload.tenantId, email: payload.email, role: payload.role });
    return payload.tenantId || null;
  } catch (error) {
    console.log('⚠️  Failed to extract tenantId from token:', error);
    return null;
  }
}

/**
 * Extract subdomain from hostname
 * localhost:3000 → null
 * prasamagar.lvh.me:3000 → 'prasamagar'
 * admin.prasamagar.lvh.me → 'prasamagar'
 * prasamagar.enromatics.com → 'prasamagar'
 * admin.prasamagar.enromatics.com → 'prasamagar'
 */
function extractSubdomainFromHostname(hostname: string | null): string | null {
  if (!hostname) return null;

  // Remove port if present
  const cleanHostname = hostname.split(':')[0];

  // For localhost/lvh.me testing
  if (cleanHostname.includes('lvh.me')) {
    const parts = cleanHostname.split('.');
    if (parts.length >= 3) {
      return parts[parts.length - 3];
    }
    return null;
  }

  // Production: enromatics.com
  if (cleanHostname.includes('enromatics.com')) {
    const parts = cleanHostname.split('.');
    
    // prasamagar.enromatics.com (3 parts)
    if (parts.length === 3) {
      return parts[0];
    }
    
    // admin.prasamagar.enromatics.com (4 parts)
    if (parts.length === 4) {
      return parts[1];
    }
    
    // Just enromatics.com (no subdomain)
    if (parts.length === 2) {
      return null;
    }
  }

  // Localhost without subdomain
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
    return null;
  }

  return null;
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

    console.log('📤 Calling Backend:', `${BACKEND_URL}${endpoint}`);

    // Get Authorization header from request (contains the JWT token)
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Authorization header present:', !!authHeader);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': extractCookies(request),
      'X-Tenant-Guard': 'true',
    };

    // Forward Authorization header if present (CRITICAL - backend needs this to decode JWT)
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('✅ Forwarding Authorization header to backend');
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        method: 'GET',
        headers,
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

    // Get Authorization header from request (contains the JWT token)
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Authorization header present:', !!authHeader);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': extractCookies(request),
      'X-Tenant-Guard': 'true',
    };

    // Forward Authorization header if present (CRITICAL - backend needs this to decode JWT)
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('✅ Forwarding Authorization header to backend');
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/students`,
      {
        method: 'POST',
        headers,
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
    //Removed as duiplicate route exists

    // Handle regular student update
    const body = await request.json();

    console.log('📤 Updating student via Backend');

    // Get Authorization header from request (contains the JWT token)
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Authorization header present:', !!authHeader);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': extractCookies(request),
      'X-Tenant-Guard': 'true',
    };

    // Forward Authorization header if present (CRITICAL - backend needs this to decode JWT)
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('✅ Forwarding Authorization header to backend');
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/students/${params.id}`,
      {
        method: 'PUT',
        headers,
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

    // Get Authorization header from request (contains the JWT token)
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Authorization header present:', !!authHeader);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': extractCookies(request),
      'X-Tenant-Guard': 'true',
    };

    // Forward Authorization header if present (CRITICAL - backend needs this to decode JWT)
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('✅ Forwarding Authorization header to backend');
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/students/${params.id}`,
      {
        method: 'DELETE',
        headers,
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
