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
