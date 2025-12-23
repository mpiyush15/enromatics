# 🔐 Subdomain Role Mapping

## Complete Role-to-Subdomain Access Matrix

### 1️⃣ **Main Domain** (enromatics.com or localhost:3000)
**Allowed Roles:**
- `SuperAdmin` ✅

**Access:**
- Full system management
- All tenants dashboard
- Subscribers, payments, invoices
- Global configuration

**Login URL:**
- Local: `http://localhost:3000/login`
- Production: `https://enromatics.com/login`

---

### 2️⃣ **Admin Subdomain** (admin.{tenant}.enromatics.com)
**Allowed Roles:**
- `Admin` ✅
- `tenantAdmin` ✅

**Access:**
- Tenant-specific management
- Students, batches, courses
- Staff management
- Scholarship exams
- Accounts & financials (full access)
- Settings & configuration

**Login URL:**
- Local: `http://admin.prasamagar.lvh.me:3000/login`
- Production: `https://admin.prasamagar.enromatics.com/login`

---

### 3️⃣ **Staff Subdomain** (staff.{tenant}.enromatics.com)
**Allowed Roles:**
- `staff` ✅
- `employee` ✅
- `teacher` ✅
- `manager` ✅
- `counsellor` ✅
- `adsManager` ✅

**Access (Role-Based Permissions):**
- View students (limited)
- Mark attendance
- Enter results
- View batches/courses
- Limited accounts access (if permission granted)
- Cannot modify tenant settings
- Cannot add/remove other staff

**Login URL:**
- Local: `http://staff.prasamagar.lvh.me:3000/login`
- Production: `https://staff.prasamagar.enromatics.com/login`

**Example Staff Members:**
- Rajesh Khandare (rajesh@gmail.com) - `manager` role ✅

---

### 4️⃣ **Student/Tenant Subdomain** ({tenant}.enromatics.com)
**Allowed Roles:**
- `student` ✅

**Access:**
- Own profile
- Enrolled courses
- Attendance records
- Results & grades
- Fee payments
- Scholarship applications

**Login URL:**
- Local: `http://prasamagar.lvh.me:3000/login`
- Production: `https://prasamagar.enromatics.com/login`

---

## 🚫 Access Control Rules

### ❌ **Denied Access Scenarios:**

1. **SuperAdmin on Tenant Subdomain**
   ```
   URL: admin.prasamagar.lvh.me:3000
   User: SuperAdmin
   Result: 403 Forbidden ❌
   Message: "SuperAdmin can only login on enromatics.com"
   ```

2. **Admin on Staff Subdomain**
   ```
   URL: staff.prasamagar.lvh.me:3000
   User: tenantAdmin
   Result: 403 Forbidden ❌
   Message: "Admins can only login on admin.tenant.enromatics.com"
   ```

3. **Staff on Admin Subdomain**
   ```
   URL: admin.prasamagar.lvh.me:3000
   User: teacher/manager
   Result: 403 Forbidden ❌
   Message: "Staff members can only login on staff.tenant.enromatics.com"
   ```

4. **Student on Admin/Staff Subdomain**
   ```
   URL: admin.prasamagar.lvh.me:3000
   User: student
   Result: 403 Forbidden ❌
   Message: "Students can only login on tenant.enromatics.com"
   ```

---

## 🔧 Backend Implementation

### Location: `backend/src/controllers/authController.js`

```javascript
// Role-to-subdomain validation in loginUser()

const userRole = user.role?.toLowerCase();
const subdomainType = req.headers['x-subdomain-type'];

// 1. SuperAdmin → NO subdomain (main domain only)
if (userRole === 'superadmin') {
  if (subdomainType) return 403;
}

// 2. Admin/TenantAdmin → ONLY 'admin' subdomain
else if (userRole === 'admin' || userRole === 'tenantadmin') {
  if (subdomainType !== 'admin') return 403;
}

// 3. Staff roles → ONLY 'staff' subdomain
else if (['staff', 'employee', 'teacher', 'manager', 'counsellor', 'adsmanager'].includes(userRole)) {
  if (subdomainType !== 'staff') return 403;
}

// 4. Student → ONLY 'tenant' subdomain
else if (userRole === 'student') {
  if (subdomainType !== 'tenant' && subdomainType !== 'student') return 403;
}
```

---

## 📊 Current System Users

### Tenant: Prasa Magar (4b778ad5)

| Email | Role | Name | Subdomain Access |
|-------|------|------|-----------------|
| mpiyush2727@gmail.com | tenantAdmin | Piyush Magar | admin.prasamagar ✅ |
| rajesh@gmail.com | manager | Rajesh Khandare | staff.prasamagar ✅ |

---

## 🧪 Testing Commands

### Test Staff Login (Rajesh - Manager)
```bash
# URL: http://staff.prasamagar.lvh.me:3000/login
# Email: rajesh@gmail.com
# Password: (your password)
# Expected: ✅ Login successful
```

### Test Admin Login (Piyush - TenantAdmin)
```bash
# URL: http://admin.prasamagar.lvh.me:3000/login
# Email: mpiyush2727@gmail.com
# Password: (your password)
# Expected: ✅ Login successful
```

### Test Wrong Subdomain (Rajesh on Admin)
```bash
# URL: http://admin.prasamagar.lvh.me:3000/login
# Email: rajesh@gmail.com
# Password: (your password)
# Expected: ❌ 403 Forbidden - "Staff members can only login on staff.tenant.enromatics.com"
```

---

## ✅ Summary

**Total Role Groups:** 4
1. SuperAdmin (1 role) → Main domain
2. Admin (2 roles) → admin.* subdomain
3. Staff (6 roles) → staff.* subdomain
4. Student (1 role) → tenant subdomain

**Security:** ✅ Strict role-to-subdomain enforcement
**Flexibility:** ✅ Multiple staff roles supported
**User Experience:** ✅ Clear error messages with hints
**Testing:** ✅ Ready with lvh.me

---

**Last Updated:** Dec 23, 2025
**Status:** ✅ All roles configured and tested
