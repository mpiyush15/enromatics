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

    // Fetch all subjects for this tenant from backend
    const response = await fetch(
      `${BACKEND_URL}/api/academics/subjects?tenantId=${tenantId}`,
      {
        method: 'GET',
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
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { message: 'Error fetching subjects', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, description } = body;

    if (!tenantId || !name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = {
      tenantId,
      name,
      description: description || '',
    };

    console.log('Creating subject via BFF:', payload);

    const response = await fetch(
      `${BACKEND_URL}/api/academics/subjects`,
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
    console.log('Subject created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { message: 'Error creating subject', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, name, description, status } = body;

    if (!subjectId) {
      return NextResponse.json(
        { message: 'Missing subjectId' },
        { status: 400 }
      );
    }

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;

    console.log('Updating subject via BFF:', { subjectId, payload });

    const response = await fetch(
      `${BACKEND_URL}/api/academics/subjects/${subjectId}`,
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
      const error = await response.text();
      console.error('Backend error:', error);
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Subject updated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { message: 'Error updating subject', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId } = body;

    if (!subjectId) {
      return NextResponse.json(
        { message: 'Missing subjectId' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/academics/subjects/${subjectId}`,
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
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { message: 'Error deleting subject', error: String(error) },
      { status: 500 }
    );
  }
}
