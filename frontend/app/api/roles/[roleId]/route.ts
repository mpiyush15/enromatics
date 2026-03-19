import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(
  req: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    const tenantId = req.headers.get('X-Tenant-ID');
    const roleId = params.roleId;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID missing' },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/roles/${roleId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error fetching role:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch role', error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    const tenantId = req.headers.get('X-Tenant-ID');
    const roleId = params.roleId;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID missing' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/roles/${roleId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error updating role:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to update role', error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    const tenantId = req.headers.get('X-Tenant-ID');
    const roleId = params.roleId;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID missing' },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error deleting role:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to delete role', error: errorMsg },
      { status: 500 }
    );
  }
}
