import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params;
    const cookieHeader = request.headers.get('cookie') || '';

    // Fetch course details
    const courseRes = await fetch(
      `${BACKEND_URL}/api/academics/courses/${courseId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
      }
    );

    if (!courseRes.ok) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: courseRes.status }
      );
    }

    const courseData = await courseRes.json();

    // Fetch lessons for this course
    const lessonsRes = await fetch(
      `${BACKEND_URL}/api/academics/courses/${courseId}/lessons`,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
      }
    );

    const lessonsData = lessonsRes.ok ? await lessonsRes.json() : { lessons: [] };

    return NextResponse.json({
      success: true,
      course: courseData.course,
      lessons: lessonsData.lessons || [],
    });
  } catch (error) {
    console.error('❌ BFF Course Detail error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
