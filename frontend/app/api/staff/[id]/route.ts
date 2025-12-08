/**
 * BFF Individual Staff Route
 * 
 * PUT /api/staff/:id - Update staff
 * DELETE /api/staff/:id - Delete staff
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// Extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// PUT /api/staff/:id - Update staff
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const endpoint = `/api/staff/${id}`;

    console.log('📤 Updating staff:', id);

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update staff' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Staff updated successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/:id - Delete staff
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const endpoint = `/api/staff/${id}`;

    console.log('📤 Deleting staff:', id);

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete staff' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Staff deleted successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
