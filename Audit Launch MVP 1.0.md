# 🚨 CRASH AUDIT REPORT - enromatics

**Date:** 14 December 2025  
**Status:** CRITICAL ISSUES FOUND ⚠️  
**Launch Readiness:** ❌ NOT READY

---

## 🔍 STEP 1: API ROUTES & JWT PROTECTION

### Backend Student Routes (`backend/src/routes/studentRoutes.js`)

| Route | Method | JWT Protection | Uses req.user | Risk Level |
|-------|--------|----------------|---------------|-----------|
| `/api/students` | GET | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |
| `/api/students` | POST | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |
| `/api/students/:id` | GET | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |
| `/api/students/:id` | PUT | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |
| `/api/students/:id` | DELETE | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |
| `/api/students/:id/reset-password` | PUT | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |
| `/api/students/bulk-upload` | POST | ✅ `protect` middleware | ✅ YES | 🟢 SAFE |

**✅ VERDICT:** All backend student routes properly protected with JWT + tenant isolation.

---

## 🔐 CRITICAL ISSUE #1: Frontend Student Detail Page

**FILE:** `frontend/app/dashboard/client/[tenantId]/students/[studentId]/page.tsx`

**PROBLEM:** Uses old auth pattern instead of BFF + cookies

```tsx
// ❌ WRONG (Line 31)
const res = await fetch(`/api/students/${studentId}`, {
  method: "GET",
  headers: getHeaders(),  // Using localStorage token
});
```

**WHY IT CRASHES:**
1. Backend JWT is in `httpOnly` cookie, NOT localStorage
2. Page uses `getHeaders()` which reads localStorage
3. localStorage is empty → no Authorization header
4. Backend returns 401 Unauthorized
5. Page crashes silently or shows "Failed to fetch student"

**SOLUTION:** Use BFF route with credentials instead

```tsx
// ✅ CORRECT
const res = await fetch(`/api/students/${studentId}`, {
  method: "GET",
  credentials: "include",  // Send cookies
});
```

**FREQUENCY:** This pattern is used in:
- Line 31: `fetchStudent()` GET
- Line 73: `handleSave()` PUT
- Line 91: `handleResetPassword()` PUT
- Line 106: `handleAddPayment()` POST
- Line 128: `handleDeletePayment()` DELETE

**Risk:** 🔴 **CRITICAL** - Page is completely broken without this fix
 #Done#
---

## 🔐 CRITICAL ISSUE #2: Missing BFF Route for Student Details

**FILE:** `frontend/app/api/students/route.ts`

**PROBLEM:** BFF only handles list and bulk routes, NOT single student fetch

Current routes handled:
- ✅ `GET /api/students` (list)
- ✅ `POST /api/students` (create)
- ✅ `POST /api/students/bulk-upload` (bulk)

Missing routes:
- ❌ `GET /api/students/:id` (detail)
- ❌ `PUT /api/students/:id` (update)
- ❌ `DELETE /api/students/:id` (delete)
- ❌ `PUT /api/students/:id/reset-password` (reset pwd)

**WHY IT CRASHES:**
Frontend is calling `/api/students/:id` directly against backend, but:
1. Cookies not being forwarded (no BFF middleware)
2. Page uses getHeaders() with stale/empty localStorage
3. Backend rejects request → 401 or 403

**SOLUTION:** Extend BFF route to handle all student CRUD operations
#done#
---

## 📋 CRITICAL ISSUE #3: Batch Selection UI Bug

**FILE:** `frontend/app/dashboard/client/[tenantId]/students/[studentId]/page.tsx`

**PROBLEM:** Batch field uses text input instead of dropdown

```tsx
// ❌ WRONG (Line 451)
<input 
  name="batch" 
  value={form.batch} 
  onChange={handleChange} 
  className="..." 
/>
```

**ISSUES:**
1. No validation (user can type anything)
2. No batch options fetched
3. User can't select from available batches
4. Likely shows "N/A" or empty for existing students

**SOLUTION:** Fetch available batches and render as `<select>` dropdown

#Done#
---

## 🧨 CRITICAL ISSUE #4: Missing getHeaders() Impacts

**AFFECTED PAGES:**
- `frontend/app/dashboard/client/[tenantId]/students/[studentId]/page.tsx`

**PATTERN:**
```tsx
const getHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};
```

**WHY IT FAILS:**
- JWT is stored in `httpOnly` cookie, NOT localStorage
- localStorage.getItem("token") returns `null`
- Fetch headers missing Authorization header
- Backend rejects with 401
- Page breaks

**IMPACT:** ❌ All API calls on this page fail
#done#
---

## 🏗️ ARCHITECTURE MISMATCH 
#Done

### Expected Flow (Current Design)

```
Frontend Page
    ↓
fetch() with credentials: "include"
    ↓
BFF Route (/api/students)
    ↓
Extract cookies from request
    ↓
Forward to Backend (/api/students)
    ↓
Backend JWT verification
    ↓
Response with Set-Cookie header
    ↓
BFF forwards Set-Cookie to browser
```

### Actual Flow (Broken)

```
Frontend Page (Student Detail)
    ↓
fetch() with getHeaders() [empty token from localStorage]
    ↓
Directly to Backend (BYPASSING BFF)
    ↓
No cookies sent (they're httpOnly)
    ↓
Backend: "No Authorization header" → 401
    ↓
Page crashes
```
#Done#
---

## 📊 CRASH MATRIX

| Page | Route | Auth Method | JWT Source | BFF Used | Status |
|------|-------|-------------|-----------|----------|--------|
| Students List | `/api/students?...` | cookies | httpOnly | ✅ YES | 🟢 OK |
| Add Student | `/api/students` POST | cookies | httpOnly | ✅ YES | 🟢 OK |
| **Student Detail** | `/api/students/:id` GET | localStorage token | localStorage | ❌ NO | 🔴 CRASH |
| **Student Detail** | `/api/students/:id` PUT | localStorage token | localStorage | ❌ NO | 🔴 CRASH |
| **Student Detail** | `/api/students/:id/reset-pwd` | localStorage token | localStorage | ❌ NO | 🔴 CRASH |

#Done#
---

## 🔧 FIX PRIORITY

### Priority 1: CRITICAL (LAUNCH BLOCKER)

- [ ] Fix student detail page fetch calls
  - Remove `getHeaders()` usage
  - Add `credentials: "include"`
  - Stop calling backend directly
  
- [ ] Extend BFF route to handle `/:id` operations
  - GET `/api/students/:id`
  - PUT `/api/students/:id`
  - DELETE `/api/students/:id`
  - PUT `/api/students/:id/reset-password`

### Priority 2: HIGH (UX BLOCKER)

- [ ] Fix batch selection UI
  - Fetch available batches in student detail page
  - Render as `<select>` dropdown instead of text input
  - Add batch validation

### Priority 3: MEDIUM (POLISH)

- [ ] Update student detail page styling
- [ ] Add error handling for API failures
- [ ] Add loading states

---

## 🧪 TEST CASES THAT WILL FAIL

```
1. Click on student row in students list
   Result: ❌ Page loads but shows "Failed to fetch student"
   
2. Click Edit Profile button
   Result: ❌ Form loads but any change fails to save
   
3. Try to reset password
   Result: ❌ "Error resetting password" (401)
   
4. Try to add payment
   Result: ❌ "Error adding payment" (401)
   
5. Try to change batch
   Result: ❌ Can type anything (no validation), no dropdown options
```

---

## ✅ ENV VARIABLES CHECK

### Backend Required

```bash
✅ JWT_SECRET (found in authMiddleware.js)
✅ NEXT_PUBLIC_BACKEND_URL (used in BFF routes)
✅ MONGODB_URI (used in mongoose connection)
✅ NODE_ENV (checks for production mode)
```

### Frontend Required

```bash
✅ NEXT_PUBLIC_API_URL (used in api config)
✅ NEXT_PUBLIC_BACKEND_URL (used in BFF routes)
```

**VERDICT:** ✅ ENV variables properly set

---

## 🔐 TENANT SAFETY CHECK

**Pattern Observed:**
- ✅ Tenant always extracted from `req.user.tenantId` (JWT payload)
- ✅ Never accepts tenantId from URL params directly
- ✅ Student queries filtered by tenantId

**Example (backend):**
```javascript
const tenantId = req.user?.tenantId;  // ✅ FROM JWT
const student = await Student.findOne({ _id: id, tenantId });  // ✅ FILTERED
```

**VERDICT:** ✅ No data leaks between tenants

---

## 📋 CHECKLIST FOR LAUNCH

- [x] Backend routes properly JWT protected
- [x] Tenant data properly isolated
- [x] ENV variables configured
- [ ] ❌ **Student detail page uses correct auth pattern**
- [ ] ❌ **BFF route handles all CRUD operations**
- [ ] ❌ **Batch selection uses dropdown UI**
- [ ] ❌ **Error handling and logging in place**

---

## 🎯 NEXT STEPS

1. **Fix Student Detail Page** (20 mins)
   - Replace `getHeaders()` with `credentials: "include"`
   - Update all 5 fetch calls
   
2. **Extend BFF Route** (30 mins)
   - Add GET/:id
   - Add PUT/:id
   - Add DELETE/:id
   - Add PUT/:id/reset-password
   
3. **Fix Batch UI** (15 mins)
   - Fetch batches in useEffect
   - Render select dropdown
   - Add validation

4. **Test** (10 mins)
   - Open student detail page
   - Try edit
   - Try reset password
   - Try change batch

**Total Fix Time:** ~75 minutes

---

## 🚀 LAUNCH READINESS

**Current Status:** 🔴 **BLOCKED**

**Blocker:** Student detail page cannot load/edit any student

**Fix ETA:** 1-2 hours

**Post-Fix Status:** Will be 🟢 **READY TO LAUNCH**

