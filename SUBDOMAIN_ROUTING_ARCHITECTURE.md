# 🎯 Subdomain Routing Architecture

## Overview
**Same Dashboard Layout for All Roles** - Different data access based on role and subdomain context.

## 🌐 Subdomain Structure

### 1. SuperAdmin Domain
```
URL: localhost:3000 or enromatics.com
Role: SuperAdmin
Access: ALL tenants management
```

**Routes**:
- `/dashboard` - SuperAdmin overview
- `/dashboard/tenants` - Manage all tenants (✅ Protected)
- `/dashboard/subscribers` - View all subscribers (✅ Protected)
- `/dashboard/payments` - View all payments (✅ Protected)
- `/dashboard/invoices` - View all invoices (✅ Protected)

**Protection**: 
```typescript
useEffect(() => {
  if (!authLoading && user && user.role !== "SuperAdmin") {
    router.push("/dashboard");
  }
}, [user, authLoading, router]);
```

---

### 2. Tenant Admin Subdomain
```
URL: admin.{tenant}.enromatics.com (e.g., admin.prasamagar.lvh.me:3000)
Role: tenantAdmin
Access: ONLY their tenant data
```

**Routes** (Same layout, filtered data):
- `/dashboard` - Tenant overview (filtered by tenantId)
- `/dashboard/students` - Their students only
- `/dashboard/batches` - Their batches only
- `/dashboard/scholarship-exams` - Their exams only
- `/dashboard/accounts` - Their financial data only
- `/dashboard/employees` - Their staff only

**Backend Filtering**:
- Middleware extracts subdomain → resolves to tenantId
- All API calls include `X-Tenant-Subdomain` header
- Backend filters all queries by `req.tenantId`

---

### 3. Staff/Teacher Subdomain
```
URL: staff.{tenant}.enromatics.com (e.g., staff.prasamagar.lvh.me:3000)
Role: staff, teacher, employee
Access: Limited tenant data based on permissions
```

**Routes** (Same layout, role-based restrictions):
- `/dashboard` - Staff overview
- `/dashboard/students` - View students (read-only or limited)
- `/dashboard/attendance` - Mark attendance
- `/dashboard/results` - Enter results
- Limited access to financial data

---

### 4. Student Portal
```
URL: {tenant}.enromatics.com (e.g., prasamagar.lvh.me:3000)
Role: student
Access: Only their own data
```

**Routes** (Different layout - student-focused):
- `/dashboard` - Student dashboard
- `/my-courses` - Enrolled courses
- `/my-results` - View results
- `/payments` - Payment history
- `/attendance` - View attendance

---

## 🔒 Security Architecture

### Role-Based Access Control (Frontend)
```typescript
const { user } = useAuth();

// Check role before rendering
if (user.role !== "SuperAdmin") {
  return <AccessDenied />;
}
```

### Subdomain-Based Tenant Isolation (Backend)
```javascript
// middleware/tenantProtect.js
const subdomain = req.headers['x-tenant-subdomain'];
const tenantId = await resolveTenantFromSubdomain(subdomain);
req.tenantId = tenantId;

// All subsequent queries filtered by tenantId
```

### Login Enforcement (Backend)
```javascript
// controllers/authController.js
if (user.role === 'SuperAdmin' && subdomainType) {
  return res.status(403).json({
    message: "SuperAdmin cannot login on tenant subdomains"
  });
}

if (user.role === 'tenantAdmin' && subdomainType !== 'admin') {
  return res.status(403).json({
    message: "Tenant Admin must login on admin.{tenant}.enromatics.com"
  });
}
```

---

## ✅ Implementation Checklist

### Frontend Protection
- [x] `/dashboard/tenants` - SuperAdmin only (✅ Added role check)
- [x] `/dashboard/subscribers` - SuperAdmin only (✅ Already protected)
- [x] `/dashboard/payments` - SuperAdmin only (✅ Already protected)
- [x] `/dashboard/invoices` - SuperAdmin only (✅ Already protected)
- [ ] All tenant routes - Auto-filtered by backend

### Backend Enforcement
- [x] Login role validation (✅ Implemented in authController)
- [x] Subdomain resolution with Redis cache (✅ subdomainResolver.js)
- [x] Tenant protection middleware (✅ tenantProtect.js)
- [x] BFF headers with subdomain (✅ 36 routes updated)

### Testing Scenarios
- [ ] SuperAdmin login on `localhost:3000` → Access all tenants
- [ ] SuperAdmin login on `admin.prasamagar.lvh.me` → Should fail (403)
- [ ] TenantAdmin login on `admin.prasamagar.lvh.me` → Access their data only
- [ ] TenantAdmin login on `localhost:3000` → Should fail (403)
- [ ] Staff login on `staff.prasamagar.lvh.me` → Limited access
- [ ] Student login on `prasamagar.lvh.me` → Own data only

---

## 🎨 Same Layout, Different Data

**Key Concept**: We don't create separate dashboards. Instead:

1. **Same React Components** - Reuse all UI components
2. **Same Routes** - `/dashboard/students` works everywhere
3. **Different Data** - Backend filters by tenantId from subdomain
4. **Role-Based Visibility** - Hide/show features based on user.role

**Example**:
```typescript
// Same component used by SuperAdmin and TenantAdmin
function StudentsPage() {
  const { user } = useAuth();
  
  // Fetch students - backend automatically filters by tenantId
  const students = await fetchStudents();
  
  // Conditional rendering based on role
  return (
    <div>
      <h1>Students</h1>
      {user.role === 'SuperAdmin' && <ExportAllButton />}
      {user.role === 'tenantAdmin' && <AddStudentButton />}
      <StudentsList students={students} />
    </div>
  );
}
```

---

## 🚀 Deployment Checklist (Dec 25)

- [ ] DNS: Configure `*.enromatics.com` wildcard record
- [ ] SSL: Setup wildcard SSL certificate
- [ ] Backend: Deploy with Redis connection
- [ ] Frontend: Deploy with subdomain middleware active
- [ ] Test: All subdomain scenarios
- [ ] Monitor: Check logs for subdomain resolution errors

---

## 📝 Notes

- **Redis Optional**: System works without Redis (falls back to MongoDB)
- **Cookie Domain**: Set to `.enromatics.com` for cross-subdomain sharing
- **Local Testing**: Use `lvh.me` (resolves to 127.0.0.1)
- **SuperAdmin Pages**: Only accessible from main domain (no subdomain)
- **Tenant Pages**: Automatically filtered by backend middleware

