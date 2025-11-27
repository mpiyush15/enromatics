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
 * 4. Filters sensitive data
 * 5. Returns cleaned response
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

// GET /api/students or /api/students/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const studentId = params?.id;
    const endpoint = studentId 
      ? `/api/students/${studentId}`
      : `/api/students${url.search}`; // Preserve query params (pagination, filters)

    console.log('📤 Calling Express:', `${EXPRESS_URL}${endpoint}`);

    const expressResponse = await fetch(
      `${EXPRESS_URL}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch students' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Express returned students data');

    // Clean response - remove sensitive fields
    const cleanData = {
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
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();

    console.log('📤 Creating student via Express');

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create student' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Student created successfully');

    const cleanData = {
      success: true,
      student: data.student ? cleanStudent(data.student) : data,
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
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    console.log('📤 Updating student via Express');

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update student' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Student updated successfully');

    const cleanData = {
      success: true,
      student: data.student ? cleanStudent(data.student) : data,
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
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    console.log('📤 Deleting student via Express');

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete student' },
        { status: expressResponse.status }
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
 */
function cleanStudent(student: any): any {
  if (!student) return null;

  return {
    _id: student._id,
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    enrollmentNumber: student.enrollmentNumber,
    status: student.status,
    stream: student.stream,
    class: student.class,
    parentName: student.parentName,
    parentEmail: student.parentEmail,
    parentPhone: student.parentPhone,
    address: student.address,
    city: student.city,
    state: student.state,
    pincode: student.pincode,
    profilePicture: student.profilePicture,
    tenantId: student.tenantId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    // Include additional fields but exclude password/sensitive data
    ...(student.fees && { fees: student.fees }),
    ...(student.attendance && { attendance: student.attendance }),
    // Never expose
    // password: ❌
    // refreshToken: ❌
    // otp: ❌
    // internalNotes: ❌
  };
}
