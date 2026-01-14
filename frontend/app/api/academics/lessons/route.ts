import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Missing tenantId' },
        { status: 400 }
      );
    }

    console.log('🔄 BFF: Fetching lessons for tenantId:', tenantId);

    // Fetch all lessons for this tenant from backend
    const response = await fetch(
      `${BACKEND_URL}/api/academics/lessons?tenantId=${tenantId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    );

    console.log('📩 Backend response status:', response.status);
    const data = await response.json();
    console.log('📦 Backend response data:', data);

    if (!response.ok) {
      console.error('❌ Backend error:', data);
      throw new Error(`Backend error: ${response.statusText}`);
    }

    // Ensure we return data in consistent format
    const lessons = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    console.log('✅ BFF returning lessons:', lessons.length);
    
    return NextResponse.json({
      data: lessons,
      success: true,
    });
  } catch (error) {
    console.error('❌ BFF Error fetching lessons:', error);
    return NextResponse.json(
      { message: 'Error fetching lessons', error: String(error), data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, subject, description, duration, addToCourses } = body;

    if (!tenantId || !name || !subject) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = {
      name,
      subject,
      description: description || '',
      duration: duration || 0,
      courseIds: addToCourses || [],
      tenantId,
    };

    console.log('Creating lesson via BFF:', payload);

    const response = await fetch(
      `${BACKEND_URL}/api/academics/lessons`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Backend error:', error);
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Lesson created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { message: 'Error creating lesson', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { message: 'Missing lessonId' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/academics/lessons/${lessonId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { message: 'Error deleting lesson', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, name, description, duration, subject, courseIds, status } = body;

    if (!lessonId) {
      return NextResponse.json(
        { message: 'Missing lessonId' },
        { status: 400 }
      );
    }

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (duration !== undefined) payload.duration = duration;
    if (subject !== undefined) payload.subject = subject;
    if (courseIds !== undefined) payload.courseIds = courseIds;
    if (status !== undefined) payload.status = status;

    console.log('Updating lesson:', { lessonId, payload });

    const response = await fetch(
      `${BACKEND_URL}/api/academics/lessons/${lessonId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Lesson updated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { message: 'Error updating lesson', error: String(error) },
      { status: 500 }
    );
  }
}
