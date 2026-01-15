# 🎯 Subdomain Routing Architecture (Route-Based Multi-Tenancy)

## ✅ NEW APPROACH: One Subdomain Per Tenant + Route-Based Role Separation

**Updated: December 23, 2025 - MVP V3.1**

## 🌐 Simplified Subdomain Structure

### Architecture Overview
- **ONE subdomain per tenant**: `tenant.enromatics.com`
- **Role separation via routes**: `/dashboard/admin`, `/dashboard/staff`, `/dashboard/student`
- **Same dashboard layout**: All roles use same UI components, different access levels
- **Security layers**: Middleware + Route guards + Backend validation

---

## 🔐 Domain & Subdomain Mapping

### 1. SuperAdmin Domain (No Subdomain)
```
URL: localhost:3000 or enromatics.com
Role: SuperAdmin
Access: ALL tenants management
Login: enromatics.com/login
```

**Routes**:
- `/dashboard/home` - SuperAdmin overview
- `/dashboard/tenants` - Manage all tenants (✅ SuperAdmin only)
- `/dashboard/subscribers` - View all subscribers
- `/dashboard/payments` - View all payments
- `/dashboard/invoices` - View all invoices

**Backend Validation**:
```javascript
// SuperAdmin can ONLY login on main domain (no subdomain)
if (userRole === 'superadmin' && tenantSubdomain) {
  return 403; // "Please use enromatics.com/login"
}
```

---

### 2. Tenant Subdomain (All Roles Login Here)
```
URL: tenant.enromatics.com (e.g., prasamagar.enromatics.com)
Roles: tenantAdmin, staff, employee, teacher, manager, counsellor, adsManager, student
Access: ONLY their tenant data
Login: tenant.enromatics.com/login (SINGLE login page for all roles)
```

**After Login, Redirect Based on Role**:
- **Admin/TenantAdmin** → `/dashboard/admin` → Redirects to `/dashboard/home`
- **Staff Roles (6 types)** → `/dashboard/staff` → Staff-specific dashboard
- **Student** → `/dashboard/student` → Student portal

**Backend Validation**:
```javascript
// Non-SuperAdmin MUST use tenant subdomain
if (userRole !== 'superadmin' && !tenantSubdomain) {
  return 403; // "Please use your tenant subdomain"
}

// Validate user belongs to this tenant
const resolvedTenant = await resolveTenantFromSubdomain(tenantSubdomain);
if (user.tenantId !== resolvedTenant.tenantId) {
  return 403; // "You don't belong to this tenant"
}
```

---

## 🛣️ Route-Based Role Separation

### Admin Routes (`/dashboard/admin/*`)
**Protected by**: `/app/dashboard/admin/layout.tsx`

**Allowed Roles**: `admin`, `tenantAdmin`, `SuperAdmin`

**Routes**:
- `/dashboard/admin` - Redirects to `/dashboard/home`
- `/dashboard/home` - Admin overview (existing page)
- `/dashboard/students` - Manage students (existing page)
- `/dashboard/staff` - Manage staff (existing page - different from staff role page)
- `/dashboard/batches` - Manage batches (existing page)
- `/dashboard/scholarship-exams` - Manage exams (existing page)
- `/dashboard/accounts` - Financial data (existing page)
- `/dashboard/settings` - Tenant settings (existing page)

**Guard Logic**:
```typescript
useEffect(() => {
  if (!loading && user) {
    const allowedRoles = ['admin', 'tenantAdmin', 'SuperAdmin'];
    if (!allowedRoles.includes(user.role)) {
      router.push('/dashboard'); // Unauthorized redirect
    }
  }
}, [user, loading, router]);
```

---

### Staff Routes (`/dashboard/staff/*`)
**Protected by**: `/app/dashboard/staff/layout.tsx`

**Allowed Roles**: `staff`, `employee`, `teacher`, `manager`, `counsellor`, `adsManager`

**Routes**:
- `/dashboard/staff` - Staff dashboard (NEW)
- `/dashboard/staff/attendance` - Mark attendance (future)
- `/dashboard/staff/classes` - View class schedule (future)
- `/dashboard/staff/students` - View assigned students (future)

**Guard Logic**:
```typescript
useEffect(() => {
  if (!loading && user) {
    const allowedRoles = ['staff', 'employee', 'teacher', 'manager', 'counsellor', 'adsManager'];
    if (!allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }
}, [user, loading, router]);
```

---

### Student Routes (`/dashboard/student/*`)
**Protected by**: `/app/dashboard/student/layout.tsx`

**Allowed Roles**: `student`

**Routes**:
- `/dashboard/student` - Student dashboard (NEW)
- `/dashboard/student/courses` - View enrolled courses (future)
- `/dashboard/student/assignments` - View assignments (future)
- `/dashboard/student/attendance` - View attendance record (future)
- `/dashboard/student/exams` - View exam schedule (future)
- `/dashboard/student/fees` - Check fee status (future)

**Guard Logic**:
```typescript
useEffect(() => {
  if (!loading && user?.role !== 'student') {
    router.push('/dashboard');
  }
}, [user, loading, router]);
```

---

## 🔒 Security Layers (Defense in Depth)

### Layer 1: Frontend Middleware (`/frontend/middleware.ts`)
**Purpose**: Block public pages on tenant subdomains, set cookies

```typescript
// Simplified: Only ONE handler for all tenant subdomains
function handleTenantSubdomain(request, subdomain) {
  // Block public pages
  const publicPages = ['/about', '/contact', '/services', '/privacy', ...];
  if (publicPages.some(page => pathname.startsWith(page))) {
    return NextResponse.redirect('/login');
  }
  
  // Set tenant context cookie
  response.cookies.set('tenant-context', subdomain);
  return response;
}
```

**What it does**:
- ✅ Detects tenant subdomain (e.g., `prasamagar.lvh.me`)
- ✅ Blocks all public/marketing pages on tenant subdomains
- ✅ Sets `tenant-context` cookie for BFF communication
- ✅ Allows `/login` and `/dashboard/*` routes only

---

### Layer 2: Route Guards (`/app/dashboard/{role}/layout.tsx`)
**Purpose**: Prevent unauthorized route access based on user role

```typescript
// Admin Layout Guard
useEffect(() => {
  if (!loading && user) {
    const allowedRoles = ['admin', 'tenantAdmin', 'SuperAdmin'];
    if (!allowedRoles.includes(user.role)) {
      router.push('/dashboard'); // Redirect unauthorized
    }
  }
}, [user, loading, router]);
```

**What it does**:
- ✅ Checks authenticated user's role
- ✅ Redirects if role doesn't match route requirement
- ✅ Shows loading state while checking auth
- ✅ Returns null for unauthorized users (blocks rendering)

---

### Layer 3: Backend Authentication (`/backend/src/controllers/authController.js`)
**Purpose**: Validate user belongs to tenant during login

```javascript
export const loginUser = async (req, res) => {
  const tenantSubdomain = req.headers['x-tenant-subdomain'];
  
  // SuperAdmin: ONLY main domain (no subdomain)
  if (userRole === 'superadmin' && tenantSubdomain) {
    return res.status(403).json({ 
      message: "SuperAdmin can only login on main domain" 
    });
  }
  
  // All other roles: MUST use tenant subdomain
  if (userRole !== 'superadmin') {
    if (!tenantSubdomain) {
      return res.status(403).json({ 
        message: "Please use your tenant subdomain to login" 
      });
    }
    
    // Validate user belongs to this tenant
    const resolvedTenant = await resolveTenantFromSubdomain(tenantSubdomain);
    if (user.tenantId !== resolvedTenant.tenantId) {
      return res.status(403).json({ 
        message: "You don't belong to this tenant" 
      });
    }
  }
};
```

**What it does**:
- ✅ Validates SuperAdmin only on main domain
- ✅ Forces non-SuperAdmin to use tenant subdomain
- ✅ Resolves subdomain to tenantId using Redis cache
- ✅ Validates user.tenantId matches subdomain's tenantId
- ✅ Returns 403 for cross-tenant login attempts

---

### Layer 4: Backend Authorization (`/backend/src/middleware/tenantProtect.js`)
**Purpose**: Filter all data queries by authenticated user's tenantId

```javascript
export const tenantProtect = async (req, res, next) => {
  // Extract subdomain from BFF header
  const subdomain = req.headers['x-tenant-subdomain'];
  
  if (subdomain) {
    // Resolve to tenantId
    const tenant = await resolveTenantFromSubdomain(subdomain);
    req.tenantId = tenant.tenantId;
  }
  
  // All downstream controllers use req.tenantId to filter queries
  next();
};
```

**What it does**:
- ✅ Sets `req.tenantId` for all API requests
- ✅ Controllers filter MongoDB queries by tenantId
- ✅ Ensures data isolation between tenants
- ✅ Works with Redis caching (1hr TTL) with MongoDB fallback

---

## 🎯 User Journey Examples

### Example 1: Admin Login Flow
```
1. User visits: prasamagar.lvh.me:3000
   → Middleware detects subdomain "prasamagar"
   → Redirects to: prasamagar.lvh.me:3000/login

2. Login page shows: "Shree Coaching classes" (custom branding)
   → User enters: mpiyush2727@gmail.com + password
   → Clicks "Sign In"

3. Backend validates:
   ✅ Credentials correct
   ✅ user.tenantId (4b778ad5) matches prasamagar's tenantId
   ✅ Returns role: "tenantAdmin"

4. Frontend redirects: prasamagar.lvh.me:3000/dashboard/admin
   → Admin layout checks role: ✅ "tenantAdmin" allowed
   → Redirects to: prasamagar.lvh.me:3000/dashboard/home
   → Shows admin dashboard with tenant-filtered data

5. User tries: prasamagar.lvh.me:3000/dashboard/student
   → Route guard detects role mismatch
   → Redirects back to: prasamagar.lvh.me:3000/dashboard/admin
```

---

### Example 2: Student Login Flow
```
1. Student visits: prasamagar.lvh.me:3000/login
   → Same login page as admin (same subdomain!)

2. Login page shows: "Shree Coaching classes" (custom branding)
   → Student enters: student@example.com + password
   → Clicks "Sign In"

3. Backend validates:
   ✅ Credentials correct
   ✅ user.tenantId matches prasamagar's tenantId
   ✅ Returns role: "student"

4. Frontend redirects: prasamagar.lvh.me:3000/dashboard/student
   → Student layout checks role: ✅ "student" allowed
   → Shows student dashboard with student-specific UI

5. Student tries: prasamagar.lvh.me:3000/dashboard/admin
   → Route guard detects role mismatch
   → Redirects to: prasamagar.lvh.me:3000/dashboard
   → Dashboard root redirects to: /dashboard/student
```

---

### Example 3: Cross-Tenant Attack Prevention
```
1. Attacker (belongs to tenant A) tries to access tenant B:
   → Visits: tenantB.lvh.me:3000/login
   → Enters credentials from tenant A

2. Backend validates:
   ✅ Credentials correct
   ❌ user.tenantId (tenant A) ≠ tenantB's tenantId
   ❌ Returns 403: "You don't belong to this tenant"

3. Login fails - attacker cannot access tenant B's data
```

---

## ✅ Implementation Checklist

### Backend Changes
- [x] Updated `authController.js` - Tenant ownership validation (removed subdomain-type checks)
- [x] `subdomainResolver.js` - Already working (extracts base subdomain)
- [x] `tenantProtect.js` - No changes needed (already sets req.tenantId)
- [x] `redisClient.js` - Already working (graceful fallback)

### Frontend Changes
- [x] Simplified `middleware.ts` - Merged 3 handlers into 1
- [x] Updated `/api/auth/login/route.ts` - Removed subdomain-type header
- [x] Created `/dashboard/admin/layout.tsx` - Admin role guard
- [x] Created `/dashboard/staff/layout.tsx` - Staff role guard
- [x] Created `/dashboard/student/layout.tsx` - Student role guard
- [x] Updated `/dashboard/page.tsx` - Role-based redirects
- [x] Updated `/login/page.tsx` - New redirect logic
- [x] Created `/dashboard/admin/page.tsx` - Redirects to /dashboard/home
- [x] Created `/dashboard/staff/page.tsx` - Staff dashboard placeholder
- [x] Created `/dashboard/student/page.tsx` - Student dashboard placeholder

### Testing Scenarios
- [ ] **SuperAdmin**: Login at localhost:3000 → Access all tenants ✅
- [ ] **SuperAdmin**: Login at prasamagar.lvh.me → Should fail (403) ❌
- [ ] **Admin**: Login at prasamagar.lvh.me → Access /dashboard/admin → Redirect to /dashboard/home ✅
- [ ] **Admin**: Login at localhost:3000 → Should fail (403) ❌
- [ ] **Admin**: Try /dashboard/student → Redirect to /dashboard/admin ❌
- [ ] **Staff**: Login at prasamagar.lvh.me → Access /dashboard/staff ✅
- [ ] **Staff**: Try /dashboard/admin → Redirect to /dashboard ❌
- [ ] **Student**: Login at prasamagar.lvh.me → Access /dashboard/student ✅
- [ ] **Student**: Try /dashboard/admin → Redirect to /dashboard ❌
- [ ] **Cross-tenant**: User from tenantA tries tenantB subdomain → 403 ❌
- [ ] Student login on `prasamagar.lvh.me` → Own data only

---

## 🎨 Same Layout, Different Data---

## 🎨 Why This Approach is Better

### Simpler DNS & URLs
**Before**: `admin.prasamagar.enromatics.com`, `staff.prasamagar.enromatics.com`
**After**: `prasamagar.enromatics.com` (one subdomain for all roles)

### Easier SSL Management
**Before**: Need to handle nested subdomain SSL
**After**: Simple 1-level wildcard certificate (`*.enromatics.com`)

### Better User Experience
**Before**: Different URLs for each role (confusing for users)
**After**: One URL per tenant, role separation handled internally

### Cleaner Architecture
**Before**: 3 middleware handlers, complex subdomain parsing
**After**: 1 middleware handler, route guards handle role separation

### Easier Testing
**Before**: Test admin.tenant.lvh.me, staff.tenant.lvh.me, tenant.lvh.me
**After**: Test tenant.lvh.me with different user roles

---

## 🔑 Key Concepts

### Same Dashboard Layout, Different Access
**Key Concept**: We don't create separate dashboards. Instead:

1. **Same React Components** - Reuse all UI components
2. **Same Base Routes** - `/dashboard/*` works for all
3. **Role-Specific Sections** - `/dashboard/admin/*`, `/dashboard/staff/*`, `/dashboard/student/*`
4. **Different Data** - Backend filters by tenantId from subdomain
5. **Route Guards** - Layout components enforce role-based access

**Example**:
```typescript
// Admin can access existing pages through their route
function AdminDashboard() {
  // Redirects to /dashboard/home (existing admin pages)
  router.push('/dashboard/home');
}

// Staff gets their own dashboard
function StaffDashboard() {
  return (
    <div>
      <h1>Staff Dashboard</h1>
      <AttendanceWidget />
      <ClassScheduleWidget />
    </div>
  );
}

// Student gets their own dashboard
function StudentDashboard() {
  return (
    <div>
      <h1>My Learning Portal</h1>
      <CoursesWidget />
      <AssignmentsWidget />
    </div>
  );
}
```

---

## 🚀 Deployment Checklist (Dec 25)

### DNS Configuration
- [ ] Add wildcard DNS record: `*.enromatics.com` → Server IP
- [ ] Verify: `nslookup prasamagar.enromatics.com` resolves correctly
- [ ] Test: Visit `prasamagar.enromatics.com` in browser

### SSL Certificate
- [ ] Obtain wildcard SSL: `*.enromatics.com`
- [ ] Install on server/CDN (Cloudflare auto-provides)
- [ ] Verify HTTPS works on subdomains

### Backend Deployment
- [ ] Deploy Express backend with subdomain resolver
- [ ] Configure Redis connection (optional, has MongoDB fallback)
- [ ] Set environment: `NODE_ENV=production`
- [ ] Test API: Login validation works with subdomain header

### Frontend Deployment
- [ ] Deploy Next.js with middleware active
- [ ] Set cookie domain: `.enromatics.com`
- [ ] Verify subdomain detection works
- [ ] Test login redirects work correctly

### Testing Matrix
- [ ] **SuperAdmin**: localhost:3000/login → Dashboard access ✅
- [ ] **SuperAdmin**: prasamagar.enromatics.com/login → 403 error ✅
- [ ] **Admin**: prasamagar.enromatics.com/login → /dashboard/admin ✅
- [ ] **Admin**: localhost:3000/login → 403 error ✅
- [ ] **Staff**: prasamagar.enromatics.com/login → /dashboard/staff ✅
- [ ] **Student**: prasamagar.enromatics.com/login → /dashboard/student ✅
- [ ] **Cross-tenant**: Wrong subdomain → 403 error ✅

### Monitoring
- [ ] Check backend logs for subdomain resolution
- [ ] Monitor Redis cache hit rates
- [ ] Track login success/failure by subdomain
- [ ] Alert on cross-tenant access attempts

---

## 📝 Migration Notes

### What Changed from MVP V3.0
1. **Removed**: `admin.{tenant}`, `staff.{tenant}` subdomain patterns
2. **Simplified**: Single `{tenant}` subdomain for all roles
3. **Added**: Route-based guards (`/dashboard/admin/*`, `/dashboard/staff/*`, `/dashboard/student/*`)
4. **Updated**: Login redirects based on user role
5. **Kept**: Tenant isolation, data filtering, custom branding

### Backward Compatibility
- ✅ Existing admin pages work without changes (`/dashboard/home`, `/dashboard/students`, etc.)
- ✅ BFF helpers work without changes (already extract base subdomain)
- ✅ Backend subdomain resolver works without changes
- ✅ Custom tenant branding works without changes

### Files Modified
**Backend**: 1 file
- `backend/src/controllers/authController.js` - Updated validation logic

**Frontend**: 9 files
- `frontend/middleware.ts` - Simplified to 1 handler
- `frontend/app/api/auth/login/route.ts` - Removed subdomain-type header
- `frontend/app/dashboard/page.tsx` - Added role-based redirects
- `frontend/app/dashboard/admin/layout.tsx` - NEW (role guard)
- `frontend/app/dashboard/admin/page.tsx` - NEW (redirect to home)
- `frontend/app/dashboard/staff/layout.tsx` - NEW (role guard)
- `frontend/app/dashboard/staff/page.tsx` - NEW (staff dashboard)
- `frontend/app/dashboard/student/layout.tsx` - NEW (role guard)
- `frontend/app/dashboard/student/page.tsx` - NEW (student dashboard)
- `frontend/app/login/page.tsx` - Updated redirect logic

---

## 🧪 Local Testing Guide

### Test URLs (lvh.me - resolves to 127.0.0.1)

#### SuperAdmin Testing
```
✅ SHOULD WORK:
http://localhost:3000/login
- Login with SuperAdmin credentials
- Should redirect to /dashboard/home

❌ SHOULD FAIL (403):
http://prasamagar.lvh.me:3000/login
- SuperAdmin should NOT be able to login on tenant subdomain
- Error: "SuperAdmin can only login on main domain"
```

#### Admin/TenantAdmin Testing
```
✅ SHOULD WORK:
http://prasamagar.lvh.me:3000/login
- Login with: mpiyush2727@gmail.com
- Should redirect to /dashboard/admin → /dashboard/home
- Can access: http://prasamagar.lvh.me:3000/dashboard/home
- Can access: http://prasamagar.lvh.me:3000/dashboard/students
- Can access: http://prasamagar.lvh.me:3000/dashboard/batches

❌ SHOULD FAIL:
http://localhost:3000/login
- Admin should NOT be able to login on main domain
- Error: "Please use your tenant subdomain to login"

❌ SHOULD REDIRECT:
http://prasamagar.lvh.me:3000/dashboard/student
- Should redirect back to /dashboard/admin or /dashboard
- Route guard blocks non-student access
```

#### Staff Testing (Manager Role)
```
✅ SHOULD WORK:
http://prasamagar.lvh.me:3000/login
- Login with: rajesh@gmail.com (role: manager)
- Should redirect to /dashboard/staff
- Can access: http://prasamagar.lvh.me:3000/dashboard/staff

❌ SHOULD FAIL:
http://localhost:3000/login
- Staff should NOT be able to login on main domain
- Error: "Please use your tenant subdomain to login"

❌ SHOULD REDIRECT:
http://prasamagar.lvh.me:3000/dashboard/admin
- Should redirect back to /dashboard/staff or /dashboard
- Route guard blocks non-admin access
```

#### Student Testing (When you have a student user)
```
✅ SHOULD WORK:
http://prasamagar.lvh.me:3000/login
- Login with student credentials
- Should redirect to /dashboard/student
- Can access: http://prasamagar.lvh.me:3000/dashboard/student

❌ SHOULD FAIL:
http://localhost:3000/login
- Student should NOT be able to login on main domain

❌ SHOULD REDIRECT:
http://prasamagar.lvh.me:3000/dashboard/admin
http://prasamagar.lvh.me:3000/dashboard/staff
- Should redirect back to /dashboard/student
- Route guards block non-student access
```

#### Public Pages (Should be blocked on tenant subdomains)
```
❌ SHOULD REDIRECT TO /login:
http://prasamagar.lvh.me:3000/about
http://prasamagar.lvh.me:3000/contact
http://prasamagar.lvh.me:3000/services
http://prasamagar.lvh.me:3000/plans
- All public pages blocked on tenant subdomains

✅ SHOULD WORK:
http://localhost:3000/about
http://localhost:3000/contact
- Public pages work on main domain
```

#### Custom Branding Test
```
✅ CHECK BRANDING:
http://prasamagar.lvh.me:3000/login
- Should show: "Shree Coaching classes" (not "Enromatics")
- Should hide: "Sign up" link
- Should hide: "Student Login" link
- Footer should show: "© 2025 Shree Coaching classes"

http://localhost:3000/login
- Should show: "Sign in to Enromatics"
- Should show: "Sign up" link
- Should show: "Student Login" link
```

### Quick Test Commands

```bash
# 1. Start backend (Terminal 1)
cd backend
npm run dev
# Backend should start on http://localhost:5050

# 2. Start frontend (Terminal 2)
cd frontend
npm run dev
# Frontend should start on http://localhost:3000

# 3. Test in Browser
# Open multiple tabs to test different scenarios
```

### Test Credentials

```
SuperAdmin:
- Email: [Your SuperAdmin email]
- Test URL: http://localhost:3000/login

Tenant Admin (Prasa Magar):
- Email: mpiyush2727@gmail.com
- Password: [Your password]
- Test URL: http://prasamagar.lvh.me:3000/login

Staff/Manager (Prasa Magar):
- Email: rajesh@gmail.com
- Password: [Your password]
- Test URL: http://prasamagar.lvh.me:3000/login
```

### Expected Flow Diagrams

**Admin Login Flow:**
```
1. Visit: http://prasamagar.lvh.me:3000
   ↓
2. Middleware redirects: http://prasamagar.lvh.me:3000/login
   ↓
3. Shows: "Shree Coaching classes" branding
   ↓
4. Login with mpiyush2727@gmail.com
   ↓
5. Backend validates: ✅ User belongs to prasamagar tenant
   ↓
6. Frontend redirects: http://prasamagar.lvh.me:3000/dashboard/admin
   ↓
7. Admin layout guard: ✅ Role allowed
   ↓
8. Redirects to: http://prasamagar.lvh.me:3000/dashboard/home
   ↓
9. Shows admin dashboard with tenant data
```

**Staff Login Flow:**
```
1. Visit: http://prasamagar.lvh.me:3000/login
   ↓
2. Shows: "Shree Coaching classes" branding
   ↓
3. Login with rajesh@gmail.com
   ↓
4. Backend validates: ✅ User belongs to prasamagar tenant
   ↓
5. Frontend redirects: http://prasamagar.lvh.me:3000/dashboard/staff
   ↓
6. Staff layout guard: ✅ Role allowed
   ↓
7. Shows staff dashboard
```

### Debugging Tips

**Check Browser Console:**
```javascript
// Should see these logs:
🌐 Tenant subdomain: prasamagar, pathname: /login
✅ Tenant branding loaded: Shree Coaching classes
🔄 Redirecting user based on role: tenantAdmin
✅ Admin - redirecting to /dashboard/admin
```

**Check Backend Logs:**
```javascript
// Should see these logs:
🔐 Login attempt for: mpiyush2727@gmail.com
🌐 Tenant subdomain: prasamagar
✓ User found, role: tenantAdmin tenantId: 4b778ad5 checking password...
✅ tenantAdmin login on tenant subdomain: prasamagar
✅ Login successful for: mpiyush2727@gmail.com
```

**Check Network Tab:**
- POST `/api/auth/login` should include `X-Tenant-Subdomain: prasamagar` header
- Response should include user role and token
- Cookies should be set with domain `.lvh.me`

---

## 🎯 Next Steps

1. **Test locally** with `prasamagar.lvh.me:3000`
2. **Commit changes** as MVP V3.1
3. **Deploy to production** Dec 25
4. **Onboard first client**: Prasa Magar (Shree Coaching classes)

---

**Document Updated**: December 23, 2025
**Version**: MVP V3.1 - Route-Based Multi-Tenancy
**Status**: ✅ Implementation Complete, Ready for Testing