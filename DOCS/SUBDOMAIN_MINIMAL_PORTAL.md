# 🌐 Subdomain Routing Strategy - UPDATED

## ✅ New Architecture (Minimal Student Portal)

### 1️⃣ **Tenant Subdomain** (`{tenant}.enromatics.com`)
**Purpose:** Minimal student login portal

**Allowed Routes:**
- ✅ `/login` ONLY

**Blocked Routes:**
- ❌ `/` → Redirects to `/login`
- ❌ `/dashboard` → Redirects to `/login`
- ❌ `/register` → Redirects to `/login`
- ❌ All other routes → Redirects to `/login`

**User Flow:**
```
1. Student visits: prasamagar.lvh.me:3000
   → Automatically redirects to: prasamagar.lvh.me:3000/login

2. Student visits: prasamagar.lvh.me:3000/dashboard
   → Automatically redirects to: prasamagar.lvh.me:3000/login

3. Student logs in at: prasamagar.lvh.me:3000/login
   → After login, redirects to main dashboard (if needed)
```

**Testing URLs:**
- Local: `http://prasamagar.lvh.me:3000` → Redirects to `/login`
- Production: `https://prasamagar.enromatics.com` → Redirects to `/login`

---

### 2️⃣ **Admin Subdomain** (`admin.{tenant}.enromatics.com`)
**Purpose:** Full tenant admin dashboard

**Allowed Routes:**
- ✅ All routes (`/dashboard/*`, `/login`, etc.)

**Root Redirect:**
- `/` → Automatically redirects to `/dashboard`

**User Flow:**
```
1. Admin visits: admin.prasamagar.lvh.me:3000
   → Automatically redirects to: admin.prasamagar.lvh.me:3000/dashboard

2. Admin can access: admin.prasamagar.lvh.me:3000/dashboard/students
   → Full access to all dashboard routes
```

**Testing URLs:**
- Local: `http://admin.prasamagar.lvh.me:3000`
- Production: `https://admin.prasamagar.enromatics.com`

---

### 3️⃣ **Staff Subdomain** (`staff.{tenant}.enromatics.com`)
**Purpose:** Full staff dashboard (role-based permissions)

**Allowed Routes:**
- ✅ All routes (`/dashboard/*`, `/login`, etc.)

**Root Redirect:**
- `/` → Automatically redirects to `/dashboard`

**User Flow:**
```
1. Staff visits: staff.prasamagar.lvh.me:3000
   → Automatically redirects to: staff.prasamagar.lvh.me:3000/dashboard

2. Staff can access: staff.prasamagar.lvh.me:3000/dashboard/students
   → Access based on role permissions (teacher, manager, etc.)
```

**Testing URLs:**
- Local: `http://staff.prasamagar.lvh.me:3000`
- Production: `https://staff.prasamagar.enromatics.com`

---

### 4️⃣ **Main Domain** (`enromatics.com`)
**Purpose:** SuperAdmin global management

**Allowed Routes:**
- ✅ All routes

**User Flow:**
```
1. SuperAdmin visits: localhost:3000
   → Can access all superadmin routes

2. SuperAdmin dashboard: localhost:3000/dashboard/tenants
   → Manages all tenants globally
```

**Testing URLs:**
- Local: `http://localhost:3000`
- Production: `https://enromatics.com`

---

## 🎯 Key Changes Summary

| Subdomain Type | Old Behavior | New Behavior |
|---------------|--------------|--------------|
| **Tenant** (`prasamagar.lvh.me`) | Showed full website | ✅ ONLY `/login` route |
| **Admin** (`admin.prasamagar.lvh.me`) | Full website | ✅ Full dashboard (root → `/dashboard`) |
| **Staff** (`staff.prasamagar.lvh.me`) | Full website | ✅ Full dashboard (root → `/dashboard`) |
| **Main** (`localhost:3000`) | Full website | ✅ Full website (unchanged) |

---

## 🔒 Middleware Logic

### Tenant Subdomain Handler
```typescript
function handleTenantSubdomain(request: NextRequest, subdomain: string) {
  const pathname = request.nextUrl.pathname;
  
  // ONLY allow /login
  if (pathname !== '/login') {
    // Redirect everything to /login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Allow /login - set cookies and proceed
  return NextResponse.next();
}
```

### Admin/Staff Subdomain Handler
```typescript
function handleAdminSubdomain(request: NextRequest, tenantSubdomain: string) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect root to dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Allow all other routes
  return NextResponse.next();
}
```

---

## 🧪 Testing Scenarios

### ✅ Test 1: Tenant Subdomain (Student Portal)
```bash
# Visit root
curl -I http://prasamagar.lvh.me:3000
Expected: 307 Redirect → /login

# Visit any route
curl -I http://prasamagar.lvh.me:3000/dashboard
Expected: 307 Redirect → /login

# Visit login
curl -I http://prasamagar.lvh.me:3000/login
Expected: 200 OK (login page shown)
```

### ✅ Test 2: Admin Subdomain
```bash
# Visit root
curl -I http://admin.prasamagar.lvh.me:3000
Expected: 307 Redirect → /dashboard

# Visit dashboard
curl -I http://admin.prasamagar.lvh.me:3000/dashboard
Expected: 200 OK (dashboard shown - after login)

# Visit login
curl -I http://admin.prasamagar.lvh.me:3000/login
Expected: 200 OK (login page shown)
```

### ✅ Test 3: Staff Subdomain
```bash
# Visit root
curl -I http://staff.prasamagar.lvh.me:3000
Expected: 307 Redirect → /dashboard

# Visit dashboard
curl -I http://staff.prasamagar.lvh.me:3000/dashboard
Expected: 200 OK (dashboard shown - after login)
```

---

## 📋 Expected Behavior

### Scenario 1: Student tries to access admin routes
```
URL: prasamagar.lvh.me:3000/dashboard/students
Result: ❌ Redirects to prasamagar.lvh.me:3000/login
Reason: Tenant subdomain only allows /login
```

### Scenario 2: Admin visits root
```
URL: admin.prasamagar.lvh.me:3000/
Result: ✅ Redirects to admin.prasamagar.lvh.me:3000/dashboard
Reason: Better UX - direct to dashboard
```

### Scenario 3: Student logs in
```
URL: prasamagar.lvh.me:3000/login
Action: Student enters credentials
Result: ✅ After successful login, redirects to student dashboard
Note: Student dashboard might be on different subdomain or app
```

---

## 🚀 Benefits

1. **Clear Separation** ✅
   - Students see minimal portal (just login)
   - Admins/Staff see full dashboard
   - No confusion about which features are available

2. **Security** ✅
   - Students cannot accidentally access admin routes
   - Middleware enforces strict routing rules
   - Backend validates subdomain + role combination

3. **Better UX** ✅
   - Students: Simple login page only
   - Admins: Direct to dashboard on root
   - Staff: Direct to dashboard on root

4. **Scalability** ✅
   - Easy to add student portal later (different app/subdomain)
   - Clear separation of concerns
   - Each subdomain has specific purpose

---

## 🔄 Next Steps

1. **Test locally with lvh.me** ✅
   - Visit `prasamagar.lvh.me:3000` → Should redirect to `/login`
   - Visit `prasamagar.lvh.me:3000/dashboard` → Should redirect to `/login`
   - Visit `admin.prasamagar.lvh.me:3000` → Should redirect to `/dashboard`

2. **Build Student Portal** (Future)
   - Create separate Next.js app for students
   - Or create `/student` routes in main app
   - After login, redirect to appropriate portal

3. **Production Deployment**
   - Same behavior on production
   - `prasamagar.enromatics.com` → Login only
   - `admin.prasamagar.enromatics.com` → Full dashboard

---

**Last Updated:** Dec 23, 2025
**Status:** ✅ Middleware updated - Ready for testing
**Changes:** Tenant subdomain now restricted to /login only
