import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    const tenantId = req.headers.get('X-Tenant-ID');

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

    // Forward query parameters
    const searchParams = req.nextUrl.searchParams;
    const backendRes = await fetch(`${BACKEND_URL}/api/user-roles?${searchParams.toString()}`, {
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
    console.error('❌ Error proxying user-roles:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user roles', error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    let tenantId = req.headers.get('X-Tenant-ID');

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Fallback: if tenantId not in header, try to get from body
    if (!tenantId) {
      tenantId = body.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID missing. Please ensure X-Tenant-ID header is set.' },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/user-roles`, {
      method: 'POST',
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
    console.error('❌ Error assigning role:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to assign role', error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    const tenantId = req.headers.get('X-Tenant-ID');
    const pathname = req.nextUrl.pathname;
    const userRoleId = pathname.split('/').pop();

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

    const backendRes = await fetch(`${BACKEND_URL}/api/user-roles/${userRoleId}`, {
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
    console.error('❌ Error updating user role:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to update user role', error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authToken = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    const tenantId = req.headers.get('X-Tenant-ID');
    const pathname = req.nextUrl.pathname;
    const userRoleId = pathname.split('/').pop();

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

    const backendRes = await fetch(`${BACKEND_URL}/api/user-roles/${userRoleId}`, {
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
    console.error('❌ Error deleting user role:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user role', error: errorMsg },
      { status: 500 }
    );
  }
}
