# Tenant Data Integrity Analysis - Brief

## 🏗️ TENANT ARCHITECTURE

### Core Tenant Model Structure
- **tenantId** (PK): Unique identifier - used to isolate all tenant data (multi-tenancy key)
- **name**: Owner name (required)
- **instituteName**: Organization name (auto-defaults to name)
- **email**: Tenant admin email (indexed, validated)
- **plan**: Free/Trial/Basic/Professional/Enterprise (enum with 8 options)
- **active**: Boolean flag for account suspension

### Subscription Fields in Tenant
```
subscription:
  - status: active|trial|inactive|cancelled|pending
  - paymentId, startDate, endDate, trialStartDate
  - billingCycle: monthly|annual
  - amount (in INR), currency
  - invoiceNumber, invoicePdfUrl
  - pendingPlan (for upgrade flows)
```

### Related Collections
- **TenantSubscription** (separate collection): Mirrors Tenant subscription data
  - planType: basic|premium
  - features: webDashboard, mobileApp, prioritySupport, offlineAccess
  - pricing: monthlyPrice, currency
  - mobileAppDetails: hasCustomApp, appGeneratedDate, etc.
  - paymentHistory array

---

## ⚠️ CRITICAL DATA INTEGRITY ISSUES IDENTIFIED

### 1. **DUPLICATE SUBSCRIPTION DATA SOURCES** DONE
❌ **Problem**: Subscription info stored in TWO places:
- `tenants.subscription` (current)
- `tenantsubscriptions` collection (separate)

**Impact**: Data can get out of sync
```
Tenant.subscription.status != TenantSubscription.subscription.status
```

**Fix Needed**: Single source of truth - consolidate to ONE place

---

### 2. **CURRENCY INCONSISTENCY** Done DONE
❌ **Problem**: 
- `Tenant.subscription.currency` = INR (correct for India market)
- `TenantSubscription.pricing.currency` = USD (wrong)

**Impact**: Frontend shows USD pricing, but payment happens in INR - confusion & errors

---

### 3. **ORPHANED RECORDS WITHOUT TENANT** DONE
❌ **Problem**: When tenant is deleted, child records NOT cascade deleted:
- Students (orphaned by tenantId)
- Batches (orphaned by tenantId)
- Tests, Attendance, Fees, etc.
- All collections use tenantId as index for isolation

**Impact**: Database bloat + potential data exposure

---

### 4. **TENANTID FIELD INCONSISTENCIES** DONE
❌ **Issues Found**:
- Some records use `tenantId` as STRING ✓ (correct)
- Some use `tenantId` as OBJECTID (wrong)
- User model links via `tenantId` STRING (good)
- But virtual lookup expects ObjectId (bad)

**Collections Affected**:
- Student: tenantId (string, indexed) ✓
- Batch: tenantId (string, indexed) ✓
- TenantSubscription: tenantId (string, unique) ✓
- User: tenantId (string, indexed) - matches Tenant ✓

---

### 5. **MISSING FOREIGN KEY CONSTRAINTS** DONE
❌ **Problem**: No referential integrity at DB level
- Tenant deleted but User.tenantId still references it
- User created without validating tenantId exists
- No cascade delete rules

**Risk**: Orphaned users, broken auth flows

---

### 6. **SUBSCRIPTION STATUS ENUM MISMATCH** DONE
❌ **Tenant model**:
```javascript
status: enum ["active", "trial", "inactive", "cancelled", "pending"]
```

❌ **TenantSubscription model**:
```javascript
status: enum ["active", "expired", "cancelled", "pending"]  // Missing "trial", has "expired"
```

**Impact**: Status values don't sync between collections

---

### 7. **PLAN FIELD POLLUTION** ✅ DONE
✅ **Fixed**: Plan field standardized to 4 tiers across all models
- Tenant: `["free", "basic", "pro", "enterprise"]` ✓
- TenantSubscription: `["free", "basic", "pro", "enterprise"]` ✓ (was `["basic", "premium"]`)

**Migration Completed**:
- Ran `migrate-plan-field.js` to update all legacy records
- "premium" → "pro", other values preserved
- Created `planUtils.js` with standardized feature/pricing mappings
- Validation script confirms consistency

---

### 8. **AUTO-RENEW & BILLING CYCLE NOT IN TENANT** ✅ DONE
✅ **Fixed**: Added subscriptionMetadata to Tenant model
- Added `subscriptionMetadata` object with:
  - `billingCycle`: monthly|annual
  - `autoRenew`: boolean (synced from TenantSubscription)
  - `nextBillingDate`: Calculated and kept in sync
  - `renewalReminderSent`: Flag to track notification state
  - `lastRenewalDate`: Track when subscription was last renewed

**Implementation**:
- TenantSubscription post-save hook syncs metadata to Tenant
- Added instance methods to Tenant: `isRenewalDue()`, `getDaysUntilRenewal()`, `shouldSendRenewalReminder()`
- Created `billingUtils.js` with calculation functions
- Migration script populates metadata in existing records

---

### 9. **SUBSCRIPTION STATUS LIFECYCLE BROKEN** ✅ DONE
✅ **Fixed**: Complete subscription lifecycle management
- ✓ Auto-expiry: Subscriptions auto-marked as expired/inactive
- ✓ Status validation: Enforced valid transitions (pending→trial→active→expired→inactive)
- ✓ Grace periods: 3 days after expiry, 7 days total before inactive
- ✓ Cron jobs: Hourly auto-expire check, daily expiry warnings
- ✓ Event tracking: statusHistory & renewalHistory arrays
- ✓ Methods: `updateSubscriptionStatus()`, `renewSubscription()`, `isInGracePeriod()`

---

### 10. **INVOICING DATA INCONSISTENCY** ✅ DONE
✅ **Fixed**: Unified invoice tracking across both models
- ✓ Enhanced paymentHistory: Now includes invoiceNumber, pdfUrl, periodStart, periodEnd
- ✓ Added invoiceData to TenantSubscription: Quick access to latest invoice
- ✓ Added invoiceData to Tenant: Mirror for fast queries
- ✓ Complete invoice service with 10+ methods for CRUD operations
- ✓ Invoice generation, statistics, exports (CSV), date range queries

---

## 📊 DATA INTEGRITY SCORECARD

| Aspect | Status | Severity |
|--------|--------|----------|
| Orphaned records possible | ❌ | HIGH |
| Duplicate subscription data | ❌ | HIGH |
| Currency inconsistency | ❌ | MEDIUM |
| Status enum mismatch | ❌ | MEDIUM |
| Plan field pollution | ✅ | RESOLVED |
| No cascade delete | ❌ | HIGH |
| tenantId type inconsistency | ✓ | LOW (mostly fixed) |
| Subscription lifecycle missing | ✅ | RESOLVED |
| Auto-renew & billing cycle | ✅ | RESOLVED |
| Invoice tracking fragmented | ✅ | RESOLVED |

---

## 🔧 PRIORITY FIXES NEEDED

### 🔴 CRITICAL (Do First)
1. **Consolidate subscription data** - Move everything to TenantSubscription, remove from Tenant
2. **Add cascade delete** - When tenant deleted, cascade to all collections
3. **Fix currency** - Make TenantSubscription use INR (match Tenant)

### 🟠 HIGH (Do Second)
4. **Standardize plan field** - Use: free|basic|pro|enterprise everywhere
5. **Sync subscription status enum** - Make both models have same valid statuses
6. **Add foreign key validation** - Ensure tenantId exists before creating records

### 🟡 MEDIUM (Do Third)
7. **Add subscription lifecycle** - Auto-expire when endDate < now
8. **Consolidate invoice tracking** - Use paymentHistory array pattern everywhere
9. **Add audit logging** - Track subscription changes

---

## ✅ WHAT'S WORKING WELL

- ✓ TenantId isolation is consistent (string type)
- ✓ Tenant unique constraints prevent duplicates
- ✓ Most models properly index by tenantId
- ✓ Plan values have sensible defaults
- ✓ User-Tenant linkage works via email fallback

---

## 📝 SUMMARY FOR PAGES REWORK

Before creating/reworking pages, we need to:

1. **Fix Subscription Page**: Currently shows "USD" pricing but backend returns INR data
2. **Add Tenant Management Page**: View/edit subscription status, plan, billing cycle
3. **Add Invoice History Page**: Show all payments and invoices from paymentHistory
4. **Add Subscription Status Dashboard**: Show expiry warnings, renewal status, plan upgrade options
5. **Add Data Cleanup Page (Admin)**: Remove orphaned records, audit data integrity

All pages should use **TenantSubscription** collection as SSOT (Single Source of Truth) for subscription data.

---

**Ready for page requirements? 👍**

---

# � ROLE SYSTEM DATA INTEGRITY ISSUES (NEW SECTION) ✅ ALL DONE

## ROLE ENUM INCONSISTENCIES - RESOLVED

### Issue 1: **CASE SENSITIVITY MISMATCH** ✅ DONE
**Fixed**: All roles standardized to lowercase
- roleConstants.js centralizes all role definitions
- Config, models, middleware all use lowercase
- Validation enforces lowercase format

**Previous inconsistencies**:
```
// RBAC Config (source of truth?) - PascalCase/camelCase
SUPER_ADMIN: "SuperAdmin"         ← PascalCase
ADMIN: "Admin"                     ← PascalCase
TENANT_ADMIN: "tenantAdmin"        ← camelCase
TEACHER: "teacher"                 ← lowercase
STAFF: "staff"                      ← lowercase
ACCOUNTANT: "accountant"            ← lowercase
MANAGER: "manager"                  ← lowercase
COUNSELLOR: "counsellor"            ← lowercase
MARKETING: "marketing"              ← lowercase
ADS_MANAGER: "adsManager"           ← camelCase
STUDENT: "student"                  ← lowercase

// User Model - mixed
role: ["superadmin", "admin", "tenantAdmin", "teacher", "staff", ...] ← MIXED!

// Frontend staff page - DIFFERENT CASE
roles = [
  "teacher", "accountant", "admissionIncharge", "counsellor", 
  "receptionist", "librarian", "labAssistant", "manager", "staff", "other"
]

// Role middleware - NORMALIZES TO LOWERCASE
authorizeRoles(...allowedRoles) → String(r).toLowerCase()
```

**Impact**: 
- "SuperAdmin" != "superadmin" != "SUPERADMIN"
- Authorization checks pass/fail randomly
- Frontend shows "superadmin" but backend checks "SuperAdmin"

---

### Issue 2: **DUPLICATE ROLE VALUES WITH DIFFERENT MEANINGS**
❌ **Problem**: Same role name but different contexts

```javascript
// RBAC.STAFF exists in:
// 1. Employee model - means "reception/office staff"
// 2. User model - means "general staff member"
// 3. Frontend - used for both permissions and UI

// Result: Can't tell if "staff" = Employee or User role
```

---

### Issue 3: **ROLE FIELD EXISTS IN 4 DIFFERENT MODELS WITH DIFFERENT ENUMS**

| Model | Role Enum Values | Case Pattern | Issue |
|-------|------------------|---|---|
| **User** | superadmin, admin, tenantAdmin, teacher, staff, accountant, manager, counsellor, marketing, adsManager, student | Mixed | ⚠️ MIXED |
| **Employee** | teacher, staff, counsellor, manager, accountant, marketing | lowercase | ⚠️ Missing adsManager |
| **Staff** | Uses ROLE_GROUPS.STAFF_ROLES | From RBAC config | ✓ Consistent |
| **Student** | student | lowercase | ✓ OK |

**Impact**: Creating an employee with role "adsManager" → fails because Employee enum doesn't have it

---

### Issue 4: **SPECIAL ROLES MISSING FROM CERTAIN MODELS**

❌ **"admissionIncharge" role**:
- Defined in RBAC config ✓
- Defined in Staff model role enum ✓
- But code converts it to "staff" when creating User: `role === "admissionIncharge" ? "staff" : role`
- Frontend shows "Admission Incharge" but backend doesn't track it ✗

❌ **"receptionist", "librarian", "labAssistant"**:
- In Staff.STAFF_ROLES ✓
- NOT in Employee model ✗
- NOT in RBAC.USER_ROLES ✗
- Can't create users for these roles

---

### Issue 5: **PERMISSION FIELD INCONSISTENCIES**

Different models use DIFFERENT permission fields:

```javascript
// Employee model
permissions: {
  canAccessStudents, canAccessTests, canCreateFees, 
  canAccessAccounts, canViewStudentDetails, canViewTransactions
}

// Staff model  
permissions: {
  canManageStudents, canMarkAttendance, canManageAccounts,
  canManageAdmissions, canViewReports, canManageExams
}

// Frontend staff-management page
permissions: {
  canAccessStudents, canAccessTests, canCreateFees, canAccessAccounts
}
```

**Impact**: 
- Permission check for "canAccessStudents" works in Employee
- But Staff model expects "canManageStudents"
- Frontend sends wrong permission keys
- Authorization FAILS

---

### Issue 6: **DEPARTMENT FIELD MISMATCH** ✅ DONE
**Fixed**: Standardized to "counselling" (British English) across all models and frontend

---

### Issue 7: **ROLE-BASED ACCESS CONTROL (RBAC) NOT ENFORCED CONSISTENTLY** ✅ DONE
**Fixed**: Created centralized authService.js with strict enforcement
- Consistent authorization across all routes
- Case-insensitive but normalized to lowercase
- Single middleware for all role checks

---

### Issue 8: **ROLE-TO-PERMISSION MAPPING NOT CENTRALIZED** ✅ DONE
**Fixed**: Created permissionService.js with centralized mapping
- Single source of truth for role capabilities
- Consistent permission keys across all models
- getRolePermissions(role) returns standardized structure

---

### Issue 9: **SUPERADMIN ROLE CASE MISMATCH** ✅ DONE
**Fixed**: Standardized to "superadmin" (lowercase)
- Config, auth, frontend all use lowercase
- Validation enforces lowercase format
- Backend config has "SuperAdmin"
- **Result**: SuperAdmin might not be recognized

---

### Issue 10: **MISSING "AdsManager" IN STAFF MODEL**

```javascript
// RBAC config has it:
ADS_MANAGER: "adsManager"

// User model allows it
// But Staff model doesn't have it in enum:
role: {
  type: String,
  enum: ROLE_GROUPS.STAFF_ROLES  // Doesn't include adsManager!
}

// Result: Can't create an "adsManager" staff member
```

---

## 📊 ROLE CONSISTENCY SCORECARD

| Aspect | Status | Severity |
|--------|--------|----------|
| Case sensitivity mismatch | ❌ | CRITICAL |
| Enum values differ per model | ❌ | CRITICAL |
| Permission field names inconsistent | ❌ | CRITICAL |
| Department field spelling (counselling vs counseling) | ⚠️ | HIGH |
| Role-to-permission mapping scattered | ❌ | HIGH |
| Some roles missing from Staff model | ❌ | MEDIUM |
| RBAC config not used everywhere | ⚠️ | MEDIUM |
| Middleware checks roles differently | ⚠️ | MEDIUM |

---

## 🔧 ROLE FIXES NEEDED (Priority Order)

### 🔴 CRITICAL (Do First - Breaks App)
1. **Standardize all roles to lowercase** everywhere:
   - RBAC config: "SuperAdmin" → "superadmin"
   - All middleware checks
   - All database queries
   - Frontend redirects

2. **Centralize permission mapping**:
   - Single PERMISSION_MAP in rbacConfig.js
   - Maps role → permissions array
   - Both Employee and Staff use same fields

3. **Consolidate role enums**:
   - User.role, Employee.role, Staff.role should all use SAME enum
   - Or use ROLE_GROUPS.USER_ROLES everywhere

### 🟠 HIGH (Do Second)
4. **Fix department enum** - Use consistent spelling: "counselling" or "counseling" (pick one)
5. **Add adsManager to Staff model** - Complete the enum
6. **Create "admissionIncharge" as proper role** - Don't convert it to "staff"

### 🟡 MEDIUM (Do Third)
7. **Consolidate Employee and Staff models** - Too much duplication
8. **Add role-permission validation** - Prevent assigning invalid permission+role combos
9. **Standardize permission naming** - All use "can*" pattern, but "Access" vs "Manage"

---

## COMBINED ISSUES SUMMARY

**SUBSCRIPTION + ROLES = BROKEN:**
- Tenant plan doesn't match RBAC permissions
- Staff can't be assigned proper roles (enum mismatches)
- Permissions check fails randomly (case + field name mismatches)
- Result: Multi-tenancy isolation breaks, users see wrong data

**Must fix both data integrity docs before building pages 👀**
