/**
 * BFF Students Dynamic Route
 * Handles: /api/students/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import { invalidateStudentCache } from '@/lib/redis';
import type { StudentDTO, StudentDetailResponse, StudentMutationResponse } from '@/types/student';


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
          'X-Tenant-Guard': 'true',
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
    } as StudentDetailResponse);
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
          'X-Tenant-Guard': 'true',
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

    // 🔥 Invalidate cache on update
    await invalidateStudentCache();
    console.log('[BFF] Students cache invalidated due to update');

    return NextResponse.json({
      success: true,
      student: cleanStudent(data.student || data),
    } as StudentMutationResponse);
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
          'X-Tenant-Guard': 'true',
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

    // 🔥 Invalidate cache on delete
    await invalidateStudentCache();
    console.log('[BFF] Students cache invalidated due to delete');

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
  };
}
