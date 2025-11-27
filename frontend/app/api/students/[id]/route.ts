/**
 * BFF Students Dynamic Route
 * Handles: /api/students/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const { id } = params;

    console.log('📤 Fetching student:', id);

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students/${id}`,
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
        { success: false, message: data.message || 'Student not found' },
        { status: expressResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      student: cleanStudent(data.student || data),
    });
  } catch (error) {
    console.error('❌ BFF Student GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const { id } = params;
    const body = await request.json();

    console.log('📤 Updating student:', id);

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students/${id}`,
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
        { success: false, message: data.message || 'Failed to update' },
        { status: expressResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      student: cleanStudent(data.student || data),
    });
  } catch (error) {
    console.error('❌ BFF Student PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const { id } = params;

    console.log('📤 Deleting student:', id);

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students/${id}`,
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
        { success: false, message: data.message || 'Failed to delete' },
        { status: expressResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted',
    });
  } catch (error) {
    console.error('❌ BFF Student DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    ...(student.fees && { fees: student.fees }),
    ...(student.attendance && { attendance: student.attendance }),
  };
}
