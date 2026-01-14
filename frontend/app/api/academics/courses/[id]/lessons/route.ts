import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params;
    const body = await request.json();
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(
      `${BACKEND_URL}/api/academics/courses/${courseId}/lessons`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ BFF Lesson creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params;
    const { lessonId } = await request.json();
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(
      `${BACKEND_URL}/api/academics/courses/${courseId}/lessons/${lessonId}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: cookieHeader,
        },
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ BFF Lesson deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
