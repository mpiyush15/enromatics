/**
 * BFF Courses Route (STABILIZED)
 * 
 * GET /api/academics/courses - Get list of courses
 * POST /api/academics/courses - Create new course
 * 
 * Connects to backend for course management.
 */

import { NextRequest, NextResponse } from 'next/server';

// Helper to extract cookies
function extractCookies(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';
  return cookies;
}

export async function GET(request: NextRequest) {
  try {
    const cookies = extractCookies(request);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academics/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch courses' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      courses: data.courses || [],
    });
  } catch (error) {
    console.error('❌ BFF Courses GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookies = extractCookies(request);
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academics/courses`, {
      method: 'POST',
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
        { success: false, message: data.message || 'Failed to create course' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      course: data.course,
      message: 'Course created successfully',
    });
  } catch (error) {
    console.error('❌ BFF Courses POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
