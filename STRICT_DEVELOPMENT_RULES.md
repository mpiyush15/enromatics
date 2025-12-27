# ⚠️ STRICT DEVELOPMENT RULES - MUST READ BEFORE ANY CODE CHANGE

## 🚨 GOLDEN RULE: NEVER ASSUME - ALWAYS CHECK FIRST

Before adding ANY new value, field, or enum - **STOP AND CHECK** what already exists.

---

## ✅ PRE-CHANGE CHECKLIST

### 1. ENUM VALUES - Always Check Model First
```
BEFORE using any enum value (type, status, role, plan, etc.):
1. Find the model file: backend/src/models/[ModelName].js
2. Read the enum array for that field
3. ONLY use values that exist in the enum
4. If value doesn't exist, use the closest existing one
```

**Known Enums to Check:**

| Model | Field | Allowed Values |
|-------|-------|----------------|
| EmailLog | type | `otp`, `welcome`, `password-reset`, `tenant-registration`, `student-registration`, `payment-confirmation`, `subscription`, `demo-request`, `demo-status`, `admin-notification`, `general` |
| EmailLog | status | `sent`, `failed`, `bounced`, `opened`, `clicked` |
| Tenant | plan | `free`, `trial`, `test`, `basic`, `starter`, `professional`, `pro`, `enterprise` |
| Tenant | subscription.status | `active`, `trial`, `inactive`, `cancelled`, `pending` |
| Tenant | subscription.billingCycle | `monthly`, `annual`, `yearly` |
| User | role | `superadmin`, `tenantAdmin`, `admin`, `staff`, `teacher`, `student` |
| User | status | `active`, `inactive`, `suspended` |

### 2. FIELD NAMES - Match Existing Schema
```
BEFORE adding a field reference:
1. Check the model schema for exact field name
2. Use EXACT spelling and casing
3. Example: subdomain vs tenantId - both exist, know which to use
```

### 3. COOKIE/TOKEN NAMES - Check Auth System
```
Known cookies:
- jwt (NOT token) - Auth token set by backend
- tenant-context - Tenant subdomain context

NEVER assume cookie names - check authController.js
```

### 4. API ROUTES - Verify Endpoint Exists
```
BEFORE calling an API:
1. Check backend/src/routes/ for the route file
2. Verify the exact path and method
3. Check what middleware is applied
```

### 5. FRONTEND BFF ROUTES - Match Backend
```
frontend/app/api/[route]/route.ts → backend/src/routes/[route]Routes.js
Always verify both sides match
```

---

## 🔴 COMMON MISTAKES TO AVOID

1. ❌ Using `token=` instead of `jwt=` for cookie check
2. ❌ Using `credentials` type when only `welcome` exists  
3. ❌ Using `subdomain` field when tenant only has `tenantId`
4. ❌ Adding new enum values without updating model
5. ❌ Assuming field exists without checking schema

---

## 📋 VERIFICATION COMMANDS

```bash
# Check model schema
cat backend/src/models/[ModelName].js | grep -A 10 "enum"

# Check existing enum values
grep -r "enum:" backend/src/models/

# Check cookie names in auth
grep -r "res.cookie" backend/src/controllers/

# Check route definitions
grep -r "router\." backend/src/routes/[routeName]Routes.js
```

---

## 🎯 WHEN IN DOUBT

1. **ASK** which value/field to use
2. **SHOW** the existing options first
3. **CONFIRM** before implementing

**NEVER blindly add new values - the system will break!**

---

Last Updated: 27 December 2025
