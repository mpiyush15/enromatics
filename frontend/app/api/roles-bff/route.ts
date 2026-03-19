/**
 * Role Management BFF Routes
 * 
 * Proxy routes for frontend to manage tenant roles and user assignments
 * These endpoints handle the complexity of role creation and assignment
 * 
 * POST   /api/roles-bff/create-with-users - Create role and assign to multiple users
 * POST   /api/roles-bff/bulk-assign - Bulk assign existing role to users
 * POST   /api/roles-bff/sync-user-permissions - Sync user permissions from tenant roles
 * GET    /api/roles-bff/available-permissions - Get all available permission types
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    if (pathname.includes('create-with-users')) {
      return createRoleWithUsers(req);
    } else if (pathname.includes('bulk-assign')) {
      return bulkAssignRole(req);
    } else if (pathname.includes('sync-user-permissions')) {
      return syncUserPermissions(req);
    }

    return NextResponse.json({ success: false, message: 'Invalid endpoint' }, { status: 400 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ BFF error:', errorMsg);
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    if (pathname.includes('available-permissions')) {
      return getAvailablePermissions();
    }

    return NextResponse.json({ success: false, message: 'Invalid endpoint' }, { status: 400 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

async function createRoleWithUsers(req: NextRequest) {
  try {
    const body = await req.json();
    const { roleName, description, permissions, userIds = [] } = body;
    const tenantId = req.headers.get('X-Tenant-ID');
    const authToken = req.cookies.get('token')?.value;

    // Step 1: Create the role via backend API
    const roleRes = await fetch(`${BACKEND_URL}/api/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': tenantId || '',
      },
      body: JSON.stringify({
        roleName,
        description,
        permissions,
      }),
    });

    if (!roleRes.ok) {
      const error = await roleRes.json();
      return NextResponse.json(error, { status: roleRes.status });
    }

    const roleData = await roleRes.json();
    const newRole = roleData.data;

    // Step 2: Assign role to users
    const assignments = [];
    for (const userId of userIds) {
      try {
        const assignRes = await fetch(`${BACKEND_URL}/api/user-roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-Tenant-ID': tenantId || '',
          },
          body: JSON.stringify({
            userId,
            tenantRoleId: newRole._id,
            notes: `Assigned during role creation`,
          }),
        });

        if (assignRes.ok) {
          const assignData = await assignRes.json();
          assignments.push(assignData.data);
        }
      } catch (err) {
        console.error(`Failed to assign role to user ${userId}`);
      }
    }

    console.log(`✅ Role created with ${assignments.length} user assignments`);

    return NextResponse.json({
      success: true,
      message: `Role "${roleName}" created and assigned to ${assignments.length} users`,
      data: {
        role: newRole,
        assignments,
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error in createRoleWithUsers:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to create role with users', error: errorMsg },
      { status: 500 }
    );
  }
}

async function bulkAssignRole(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantRoleId, userIds } = body;
    const tenantId = req.headers.get('X-Tenant-ID');
    const authToken = req.cookies.get('token')?.value;

    if (!tenantRoleId || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'tenantRoleId and userIds array are required' },
        { status: 400 }
      );
    }

    // Bulk assign role to users
    const results = {
      success: [] as string[],
      failed: [] as { userId: string; error: string }[],
    };

    for (const userId of userIds) {
      try {
        const assignRes = await fetch(`${BACKEND_URL}/api/user-roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-Tenant-ID': tenantId || '',
          },
          body: JSON.stringify({
            userId,
            tenantRoleId,
            notes: `Bulk assignment`,
          }),
        });

        if (assignRes.ok) {
          results.success.push(userId);
        } else {
          const error = await assignRes.json();
          results.failed.push({ userId, error: error.message });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        results.failed.push({ userId, error: errorMsg });
      }
    }

    console.log(`✅ Bulk assignment: ${results.success.length} success, ${results.failed.length} failed`);

    return NextResponse.json({
      success: true,
      message: `Assigned to ${results.success.length} users${results.failed.length > 0 ? `, ${results.failed.length} failed` : ''}`,
      data: results,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error in bulkAssignRole:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Bulk assignment failed', error: errorMsg },
      { status: 500 }
    );
  }
}

async function syncUserPermissions(req: NextRequest) {
  try {
    const tenantId = req.headers.get('X-Tenant-ID');
    const userId = req.headers.get('X-User-ID');
    const authToken = req.cookies.get('token')?.value;

    // Get current user's roles and permissions
    const rolesRes = await fetch(`${BACKEND_URL}/api/user-roles/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!rolesRes.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch user roles' },
        { status: rolesRes.status }
      );
    }

    const roleData = await rolesRes.json();
    const roleAssignments = roleData.data || [];

    // Aggregate permissions from all roles
    const allPermissions = new Set<string>();
    roleAssignments.forEach((assignment: any) => {
      if (assignment.tenantRoleId?.permissions) {
        assignment.tenantRoleId.permissions.forEach((p: string) => allPermissions.add(p));
      }
    });

    console.log(`✅ Synced permissions for user ${userId}: ${allPermissions.size} total`);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        roleCount: roleAssignments.length,
        roles: roleAssignments.map((a: any) => ({
          roleId: a.tenantRoleId?._id,
          roleName: a.tenantRoleId?.roleName,
          permissions: a.tenantRoleId?.permissions || [],
        })),
        allPermissions: Array.from(allPermissions),
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error in syncUserPermissions:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Failed to sync permissions', error: errorMsg },
      { status: 500 }
    );
  }
}

function getAvailablePermissions() {
  // Standard permission types available in the system
  const availablePermissions: Record<string, string[]> = {
    academics: [
      'academics:read',
      'academics:create',
      'academics:update',
      'academics:delete',
    ],
    students: [
      'students:read',
      'students:create',
      'students:update',
      'students:delete',
      'students:view-progress',
    ],
    tests: [
      'tests:read',
      'tests:create',
      'tests:update',
      'tests:delete',
      'tests:manage',
    ],
    attendance: [
      'attendance:read',
      'attendance:manage',
    ],
    payments: [
      'payments:read',
      'payments:manage',
    ],
    invoices: [
      'invoices:read',
      'invoices:create',
      'invoices:manage',
    ],
    reports: [
      'reports:read',
      'reports:create',
    ],
    staff: [
      'staff:read',
      'staff:create',
      'staff:update',
      'staff:delete',
    ],
    admissions: [
      'admissions:read',
      'admissions:manage',
    ],
  };

  // Flatten for easier consumption
  const flattened = Object.values(availablePermissions).flat();
  const categories = Object.keys(availablePermissions);

  console.log(`✅ Retrieved ${flattened.length} available permissions`);

  return NextResponse.json({
    success: true,
    data: {
      byCategory: availablePermissions,
      all: flattened,
      categories,
    },
  });
}

