/**
 * BFF Courses [ID] Route (STABILIZED)
 * 
 * PUT /api/academics/courses/[id] - Update course
 * DELETE /api/academics/courses/[id] - Delete course
 */

import { NextRequest, NextResponse } from 'next/server';

// Helper to extract cookies
function extractCookies(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';
  return cookies;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookies = extractCookies(request);
    const body = await request.json();
    const { id } = params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academics/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update course' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      course: data.course,
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('❌ BFF Courses PUT error:', error);
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
    const cookies = extractCookies(request);
    const { id } = params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academics/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete course' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('❌ BFF Courses DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
