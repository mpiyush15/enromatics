# Role-Based Access Control (RBAC) Documentation

## Overview
The system implements comprehensive role-based access control to manage sidebar navigation and API endpoint access. Each role has specific permissions and can only access designated features.

---

## Roles & Permissions

### 1. **TenantAdmin** (Institute Administrator)
- **Full Access**: Can access all dashboard features for their institute
- **No Permission Checks**: Bypasses all permission middleware checks
- **Sidebar Access**: All sections including settings, staff management, and billing

### 2. **Manager**
- **Sidebar Access**:
  - 🏠 Home
  - 🎓 Students (View all, Add student, Attendance, Analytics)
  - 📚 Academics (Lessons, Batches, Tests)
  - 📊 CRM / Leads
- **Permissions**:
  - `canAccessStudents`
  - `canAccessTests`
  - `canCreateFees`
- **Restrictions**: Cannot access Accounts section

### 3. **Accountant** (NEW - Finance Role)
- **Sidebar Access**:
  - 🏠 Home
  - 🎓 Students (View all students ONLY, no add)
  - 💰 Accounts (Full access to all financial features)
    - 📊 Overview
    - 💳 All Transactions
    - 🧾 Fee Receipts
    - 💸 Expenses
    - ↩️ Refunds
    - 💼 Student Details (View student financial info)
  
- **Permissions** (Auto-granted):
  - `canAccessAccounts` ✅ Auto-granted
  - `canViewTransactions` ✅ Auto-granted
  - `canViewStudentDetails` ✅ Auto-granted
  - `canManageFees` ✅ Auto-granted
  - `canAccessStudents` (Limited - view only)

- **What They CAN Do**:
  - ✅ View all students and their details
  - ✅ View all transactions and receipts
  - ✅ Access account overviews and reports
  - ✅ Manage fees and refunds
  - ✅ View student financial details

- **What They CANNOT Do**:
  - ❌ Add or delete students
  - ❌ Access academics/tests
  - ❌ Access CRM/leads
  - ❌ Create new batches
  - ❌ Access WhatsApp or other communication

### 4. **Counsellor**
- **Sidebar Access**:
  - 🏠 Home
  - 📊 CRM / Leads
  - 🎓 Exams & Scholarships
- **Permissions**: As configured per employee record

### 5. **Teacher**
- **Sidebar Access**:
  - 🏠 Home
  - 🎓 Exams & Scholarships
  - 📚 Academics (Limited)
- **Permissions**: As configured per employee record

### 6. **Staff**
- **Sidebar Access**:
  - 🏠 Home
  - 🎓 Exams & Scholarships
- **Permissions**: Can only access features explicitly granted
- **Restrictions**: Completely blocked from Accounts section (even if permission is granted)

### 7. **Marketing**
- **Sidebar Access**:
  - 🏠 Home
- **Permissions**: As configured per employee record

### 8. **Student**
- **Sidebar Access**:
  - 🏠 Home
  - 🎓 Students (My Profile only)
  - 📚 Academics (My Tests only)
- **Permissions**: None (read-only student portal)

### 9. **SuperAdmin**
- **Full Access**: All system features
- **Sidebar Access**: Super admin dashboard, plans, billing, tenants, SuperCRM
- **No Restrictions**: Bypass all permission checks

---

## Permission Definitions

### Available Permissions (in Employee Model)

```javascript
permissions: {
  canAccessStudents: Boolean,      // Can view students list
  canAccessTests: Boolean,         // Can create/manage tests
  canCreateFees: Boolean,          // Can create fee receipts
  canAccessAccounts: Boolean,      // Can access accounts section
  canViewStudentDetails: Boolean,  // Can view student financial details
  canViewTransactions: Boolean,    // Can view all transactions
  canManageFees: Boolean,          // Can manage fees and refunds
}
```

---

## How It Works

### Frontend: Sidebar Generation
1. **User logs in** → Gets auth token with role info
2. **Sidebar loads** → Calls `GET /api/ui/sidebar`
3. **Backend filters links** based on:
   - User's role
   - Tenant modules (if applicable)
4. **Sidebar displays** only allowed navigation links

### Backend: Permission Middleware

#### `requirePermission(permission)` Middleware
- Checks if user has specific permission
- Allows `tenantAdmin` full access
- For other roles:
  - Accountant: Auto-grants all account-related permissions
  - Others: Check Employee record for permission

#### `checkPermission(permission)` Middleware
- Similar to `requirePermission` but used differently

#### Special Rule for Accountant
```javascript
if (userRole === "accountant" && 
    ["canAccessAccounts", "canViewTransactions", 
     "canViewStudentDetails", "canManageFees"].includes(requiredPermission)) {
  return next(); // Auto-grant
}
```

---

## Setting Up Accountant Role

### Step 1: Create Employee Record
```javascript
const employee = await Employee.create({
  tenantId: "tenant123",
  name: "Rajesh Kumar",
  email: "rajesh@institute.com",
  role: "accountant",
  salary: 50000,
  joiningDate: new Date(),
  status: "active",
  permissions: {
    canAccessStudents: true,
    canAccessAccounts: true,
    // Other permissions can be false - accountant bypasses them
  }
});
```

### Step 2: Create User Account
Create a login user with:
- Email: rajesh@institute.com
- Role: accountant
- TenantId: tenant123

### Step 3: User Login
- Accountant logs in
- Sidebar shows: Home, Students, Accounts (with all sub-pages)
- Can access student list and all financial pages

---

## Routes & Permission Requirements

### Students Routes
```javascript
GET /api/students              // tenantAdmin, manager, accountant
POST /api/students/add         // tenantAdmin, manager (NOT accountant)
GET /api/students/:id          // canAccessStudents permission
```

### Accounts Routes
```javascript
GET /api/accounts/overview     // tenantAdmin, accountant
GET /api/accounts/transactions // tenantAdmin, accountant
GET /api/accounts/receipts     // tenantAdmin, accountant
GET /api/accounts/expenses     // tenantAdmin, accountant
GET /api/accounts/refunds      // tenantAdmin, accountant
GET /api/accounts/student-details // tenantAdmin, accountant (NEW)
```

---

## Testing the Setup

### 1. Login as Accountant
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh@institute.com","password":"password123"}'
```

### 2. Fetch Sidebar
```bash
curl http://localhost:3000/api/ui/sidebar \
  -H "Authorization: Bearer <token>"
```

**Expected Response**: Should include Students and Accounts sections

### 3. Access Student List
```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer <token>"
```

**Expected**: 200 OK with student list

### 4. Try to Add Student (Should Fail)
```bash
curl -X POST http://localhost:3000/api/students/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com"}'
```

**Expected**: 403 Forbidden (accountant cannot create students)

---

## Adding New Permissions

### Step 1: Add to Employee Model
```javascript
permissions: {
  yourNewPermission: { type: Boolean, default: false }
}
```

### Step 2: Add to Permission Middleware
```javascript
if (userRole === "accountant" && 
    ["canAccessAccounts", ..., "yourNewPermission"].includes(requiredPermission)) {
  return next();
}
```

### Step 3: Use in Routes
```javascript
router.get("/path", protect, requirePermission("yourNewPermission"), controller);
```

---

## Troubleshooting

### Accountant Cannot See Accounts Section
- ✅ Check if Employee record has `role: "accountant"`
- ✅ Verify user has same role in JWT
- ✅ Check sidebarConfig includes accountant in Accounts section

### "Access denied" Error
- ✅ Verify user role matches route requirement
- ✅ Check Employee record exists for the user
- ✅ Verify permission is set to `true` (if required by role)

### Sidebar Not Loading
- ✅ Check user is authenticated
- ✅ Verify `/api/ui/sidebar` is accessible
- ✅ Check browser console for errors

---

## Summary

| Role | Students | Accounts | CRM | Tests | Settings |
|------|----------|----------|-----|-------|----------|
| TenantAdmin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Manager | ✅ Full | ❌ None | ✅ Full | ✅ Full | ❌ None |
| **Accountant** | ✅ View Only | ✅ Full | ❌ None | ❌ None | ❌ None |
| Counsellor | ❌ Limited | ❌ None | ✅ Full | ✅ Limited | ❌ None |
| Teacher | ❌ Limited | ❌ None | ❌ None | ✅ Full | ❌ None |
| Staff | ❌ None | ❌ Blocked | ❌ None | ❌ Limited | ❌ None |
| Student | 👤 Self | ❌ None | ❌ None | ✅ Self | ❌ None |

---

**Last Updated**: January 19, 2026
**Version**: 1.0 - Initial Release with Accountant Role
