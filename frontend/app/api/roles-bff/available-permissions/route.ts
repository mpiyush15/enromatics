import { NextResponse } from 'next/server';

/**
 * GET /api/roles-bff/available-permissions
 * Returns all available permission types and categories
 */
export async function GET() {
  try {
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
      enquiries: [
        'enquiries:read',
        'enquiries:create',
        'enquiries:update',
        'enquiries:delete',
        'enquiries:manage',
      ],
      roles: [
        'roles:read',
        'roles:create',
        'roles:update',
        'roles:delete',
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
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error fetching permissions:', errorMsg);
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
