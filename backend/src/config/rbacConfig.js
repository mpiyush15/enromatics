/**
 * UNIFIED RBAC CONFIGURATION
 * Single Source of Truth for all roles in the system
 * Used by User, Staff, and Student models
 */

export const RBAC = {
  // ============ SYSTEM ROLES (Fixed - all lowercase) ============
  SUPER_ADMIN: "superadmin",
  TENANT_ADMIN: "tenantadmin",
  STUDENT: "student",
  
  // ============ TENANT CUSTOM ROLES (Deprecated - now created dynamically) ============
  // These are kept for backward compatibility but should be created via TenantRole model
  // Each tenant can now define their own roles: teacher, counsellor, staff, accountant, etc.
};

// ============ ROLE GROUPS ============
export const ROLE_GROUPS = {
  // All roles that can exist in User model
  USER_ROLES: [
    RBAC.SUPER_ADMIN,
    RBAC.ADMIN,
    RBAC.TENANT_ADMIN,
    RBAC.TEACHER,
    RBAC.STAFF,
    RBAC.ACCOUNTANT,
    RBAC.MANAGER,
    RBAC.COUNSELLOR,
    RBAC.MARKETING,
    RBAC.ADS_MANAGER,
    RBAC.STUDENT,
  ],

  // All roles that can exist in Staff model (specific staff positions)
  STAFF_ROLES: [
    RBAC.TEACHER,
    RBAC.STAFF,
    RBAC.ACCOUNTANT,
    RBAC.MANAGER,
    RBAC.COUNSELLOR,
    RBAC.ADMISSION_INCHARGE,
    RBAC.RECEPTIONIST,
    RBAC.LIBRARIAN,
    RBAC.LAB_ASSISTANT,
  ],

  // Roles that are always students
  STUDENT_ROLES: [RBAC.STUDENT],

  // Super admin/global roles (not tenant-specific)
  GLOBAL_ROLES: [RBAC.SUPER_ADMIN, RBAC.ADMIN],

  // Tenant-specific roles
  TENANT_ROLES: [
    RBAC.TENANT_ADMIN,
    RBAC.TEACHER,
    RBAC.STAFF,
    RBAC.ACCOUNTANT,
    RBAC.MANAGER,
    RBAC.COUNSELLOR,
    RBAC.MARKETING,
    RBAC.ADS_MANAGER,
    RBAC.STUDENT,
  ],
};

// ============ ROLE PERMISSIONS (Future use) ============
export const ROLE_PERMISSIONS = {
  [RBAC.SUPER_ADMIN]: ["*"], // All permissions

  [RBAC.ADMIN]: [
    "view_tenants",
    "manage_tenants",
    "view_analytics",
    "view_payments",
  ],

  [RBAC.TENANT_ADMIN]: [
    "view_overview",
    "manage_staff",
    "manage_students",
    "view_finances",
    "manage_settings",
  ],

  [RBAC.TEACHER]: [
    "view_students",
    "create_tests",
    "view_results",
    "manage_lessons",
  ],

  [RBAC.STAFF]: [
    "view_students",
    "view_staff",
  ],

  [RBAC.MANAGER]: [
    "view_students",
    "view_staff",
    "view_finances",
    "manage_academics",
  ],

  [RBAC.ACCOUNTANT]: [
    "view_finances",
    "manage_receipts",
    "view_fees",
    "manage_expenses",
  ],

  [RBAC.COUNSELLOR]: [
    "view_students",
    "manage_enquiries",
    "view_scholarships",
  ],

  [RBAC.STUDENT]: [
    "view_profile",
    "view_results",
    "view_attendance",
    "view_fees",
  ],

  [RBAC.MARKETING]: ["view_leads", "manage_campaigns"],

  [RBAC.ADS_MANAGER]: ["manage_ads", "view_analytics"],
};
