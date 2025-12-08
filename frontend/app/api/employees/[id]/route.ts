/**
 * BFF Individual Employee Route
 * 
 * PUT /api/employees/:id - Update employee
 * DELETE /api/employees/:id - Delete employee
 * POST /api/employees/:id/create-login - Create login
 * POST /api/employees/:id/reset-password - Reset password
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

// PUT /api/employees/:id - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const endpoint = `/api/employees/${id}`;

    console.log('📤 Updating employee:', id);

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
        { success: false, message: data.message || 'Failed to update employee' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Employee updated successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/:id - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const endpoint = `/api/employees/${id}`;

    console.log('📤 Deleting employee:', id);

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
        { success: false, message: data.message || 'Failed to delete employee' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Employee deleted successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Handle create-login and reset-password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const url = new URL(request.url);
    
    // Check if it's a special action (create-login or reset-password)
    const action = url.searchParams.get('action');
    
    let endpoint = `/api/employees/${id}`;
    if (action === 'create-login') {
      endpoint = `/api/employees/${id}/create-login`;
    } else if (action === 'reset-password') {
      endpoint = `/api/employees/${id}/reset-password`;
    }

    console.log('📤 Employee action:', action || 'default', 'ID:', id);

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Operation failed' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Employee action completed successfully');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
