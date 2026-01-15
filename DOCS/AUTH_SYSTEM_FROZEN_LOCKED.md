# 🔐 AUTH SYSTEM - FROZEN & LOCKED

**Status:** ⛔ STRICTLY FROZEN - DO NOT MODIFY  
**Date:** December 26, 2025  
**Version:** 1.0 (FINAL)

---

## ⚠️ WARNING: AUTH SYSTEM IS FROZEN

**This auth system has been modified twice already (Incident Dec 25 & Dec 26, 2025).**

**FROM NOW ON:**
- ✅ Auth middleware files are LOCKED
- ✅ No renaming of functions
- ✅ No moving files
- ✅ No changing imports
- ✅ Only bug fixes allowed (with pre-approval)

---

## 🔒 LOCKED AUTH SYSTEM STRUCTURE

### Core Authentication Files (DO NOT TOUCH):

```
backend/src/middleware/
├── authMiddleware.js          ⛔ LOCKED - Core auth logic
├── roleMiddleware.js          ⛔ LOCKED - Role-based access
├── permissionMiddleware.js    ✅ Optional (secondary)
├── protectStudent.js          ✅ Optional (secondary)
└── [Other files are OPTIONAL]
```

---

## 📋 DEFINITIVE EXPORT REFERENCE

### File 1: `authMiddleware.js`
**Location:** `/backend/src/middleware/authMiddleware.js`  
**Status:** ⛔ FROZEN - DO NOT MODIFY

**Exports (THESE ARE FINAL):**
```javascript
export const protect = async (req, res, next) => { ... }
export const checkSuperAdmin = (req, res, next) => { ... }
export const checkAdmin = (req, res, next) => { ... }
```

**Usage in routes:**
```javascript
import { protect } from "../middleware/authMiddleware.js";

router.get("/endpoint", protect, async (req, res) => {
  // req.user is automatically set by protect middleware
  const user = req.user;  // ✅ This is safe
});
```

### File 2: `roleMiddleware.js`
**Location:** `/backend/src/middleware/roleMiddleware.js`  
**Status:** ⛔ FROZEN - DO NOT MODIFY

**Exports (THESE ARE FINAL):**
```javascript
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => { ... }
}
```

**Usage in routes:**
```javascript
import { authorizeRoles } from "../middleware/roleMiddleware.js";

router.post("/admin-only", protect, authorizeRoles("superadmin", "admin"), async (req, res) => {
  // Only users with superadmin or admin role can access
});
```

---

## ✅ CORRECT IMPORT PATTERN

### Template for ALL Routes:

```javascript
// ✅ CORRECT IMPORTS
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ CORRECT USAGE
router.post("/", protect, async (req, res) => { ... });
router.get("/admin", protect, authorizeRoles("superadmin"), async (req, res) => { ... });
router.put("/:id", protect, authorizeRoles("admin", "superadmin"), async (req, res) => { ... });
```

### ❌ DO NOT USE:

| ❌ WRONG | ✅ CORRECT | Reason |
|---------|----------|--------|
| `auth.js` | `authMiddleware.js` | File was renamed |
| `authenticate` | `protect` | Function name is different |
| `../auth` | `../middleware/authMiddleware.js` | Wrong path |
| Both from `auth.js` | Split: `authMiddleware.js` + `roleMiddleware.js` | Separate files |

---

## 🚨 INCIDENTS THAT MUST NOT HAPPEN AGAIN

### Incident #1 (Dec 25, 2025)
**Problem:** Someone tried to use `authenticate` instead of `protect`  
**Impact:** Routes broke, authentication failed  
**Prevention:** This guide locked the system

### Incident #2 (Dec 26, 2025)
**Problem:** `offersRoutes.js` imported from non-existent `auth.js`  
**Impact:** Module not found error, backend crashed  
**Prevention:** This guide and audits

---

## 📝 AUDIT CHECKLIST

Before ANY changes to auth, run this checklist:

### Step 1: Identify All Auth Imports
```bash
# Find all auth imports in routes
grep -r "from.*middleware.*auth" backend/src/routes/

# Output should ONLY show:
# - "../middleware/authMiddleware.js"
# - "../middleware/roleMiddleware.js"
```

### Step 2: Verify Export Names
```javascript
// In authMiddleware.js, verify exports are:
export const protect
export const checkSuperAdmin
export const checkAdmin

// In roleMiddleware.js, verify exports are:
export const authorizeRoles
```

### Step 3: Check Route Usage
```javascript
// All routes should use:
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

// NOT:
// import { authenticate } from "../middleware/auth.js";
```

---

## 🚀 HOW TO USE AUTH IN ANY NEW ROUTE

### Pattern #1: Public Route (No Auth)
```javascript
router.get("/public", async (req, res) => {
  // Anyone can access
  res.json({ message: "Public data" });
});
```

### Pattern #2: Authenticated User Only
```javascript
router.get("/my-profile", protect, async (req, res) => {
  // Only logged-in users
  const user = req.user;  // ✅ Set by protect middleware
  res.json({ user });
});
```

### Pattern #3: Superadmin Only
```javascript
router.post("/admin-action", protect, authorizeRoles("superadmin"), async (req, res) => {
  // Only superadmins
  res.json({ message: "Admin action done" });
});
```

### Pattern #4: Multiple Allowed Roles
```javascript
router.get("/financial-report", 
  protect, 
  authorizeRoles("superadmin", "accountant", "tenantAdmin"), 
  async (req, res) => {
    // Only these 3 roles can access
    res.json({ report: "..." });
  }
);
```

### Pattern #5: Check Role Manually (If Needed)
```javascript
router.get("/optional-admin-data", protect, async (req, res) => {
  const isAdmin = req.user.role === 'superadmin' || req.user.role === 'admin';
  
  let data = { basic: "info" };
  if (isAdmin) {
    data.adminOnly = "secret info";
  }
  
  res.json(data);
});
```

---

## 🔐 MIDDLEWARE CHAIN ORDER (IMPORTANT!)

**Always put middleware in THIS order:**

```javascript
// ✅ CORRECT ORDER
router.post(
  "/endpoint",
  protect,                           // 1. Authentication first (validates token)
  authorizeRoles("superadmin"),      // 2. Role check second (checks req.user.role)
  async (req, res) => {              // 3. Route handler last
    // Your code here
  }
);

// ❌ WRONG ORDER (will crash)
router.post(
  "/endpoint",
  authorizeRoles("superadmin"),      // ❌ protect not called yet - req.user is undefined!
  protect,
  async (req, res) => { ... }
);
```

---

## 🎯 AVAILABLE ROLES

These are the only valid roles in the system:

```javascript
const VALID_ROLES = [
  "superadmin",      // Full system access
  "admin",           // Admin access
  "tenantAdmin",     // Tenant admin access
  "accountant",      // Financial access
  "teacher",         // Teacher access
  "student",         // Student access
  "staff",           // Staff access
  // Add more only after team discussion
];
```

---

## ✅ AUDIT RESULTS

### Last Audit (Dec 26, 2025)
```
✅ authMiddleware.js exports: protect, checkSuperAdmin, checkAdmin
✅ roleMiddleware.js exports: authorizeRoles
✅ No other auth files being used
✅ All imports are from correct files
✅ No broken references
```

### Files Checked:
```
✅ offersRoutes.js - FIXED (was using auth.js)
✅ All other routes - VERIFIED
✅ No other auth.js file exists
```

---

## 🛡️ ENFORCEMENT RULES

### Rule #1: No New Auth Files
- ❌ Do NOT create `auth.js`
- ❌ Do NOT create `authentication.js`
- ❌ Do NOT rename `authMiddleware.js`
- ✅ Only use existing `authMiddleware.js` and `roleMiddleware.js`

### Rule #2: No Function Renaming
- ❌ Do NOT rename `protect` to `authenticate`
- ❌ Do NOT rename `authorizeRoles` to `checkRoles`
- ✅ Only use exact exported names

### Rule #3: No Path Changes
- ❌ Do NOT move `authMiddleware.js` to different folder
- ❌ Do NOT move `roleMiddleware.js`
- ✅ Keep files in `/middleware/`

### Rule #4: No Import Changes
- ❌ Do NOT import from wrong path
- ✅ ONLY import from these exact paths:
  ```javascript
  import { protect } from "../middleware/authMiddleware.js";
  import { authorizeRoles } from "../middleware/roleMiddleware.js";
  ```

### Rule #5: Optional Middleware OK
- ✅ Can use `permissionMiddleware.js`
- ✅ Can use `protectStudent.js`
- ✅ Can use `trialLockMiddleware.js`
- These are secondary and won't break core auth

---

## 🚨 IF YOU NEED TO MODIFY AUTH

**Step 1:** Get approval from team lead  
**Step 2:** Create a new version file (e.g., `authMiddleware.v2.js`)  
**Step 3:** Test thoroughly before replacing  
**Step 4:** Update this document  
**Step 5:** Audit ALL routes that use auth

**Never modify in place!**

---

## 🧪 TESTING CHECKLIST

Before deploying ANY auth change:

- [ ] Backend starts without errors
- [ ] Login endpoint works
- [ ] Protected route returns 401 without token
- [ ] Protected route works with valid token
- [ ] Role check blocks unauthorized users
- [ ] Role check allows authorized users
- [ ] Multiple roles work correctly
- [ ] req.user has correct data
- [ ] No console errors about auth
- [ ] All route imports are correct
- [ ] Grep shows no invalid imports:
  ```bash
  grep -r "auth.js\|authenticate" backend/src/routes/
  # Should return 0 results
  ```

---

## 📞 WHO TO CONTACT

If you need auth changes:
1. **Bug Fix:** Document the bug, get approval, test thoroughly
2. **New Feature:** Discuss with team first, then implement
3. **Emergency:** Contact team lead immediately

---

## 🔒 FINAL SUMMARY

| Item | Status | Rule |
|------|--------|------|
| File Names | ⛔ FROZEN | Cannot change |
| Function Names | ⛔ FROZEN | Cannot change |
| Export Names | ⛔ FROZEN | Cannot change |
| Import Paths | ⛔ FROZEN | Cannot change |
| Middleware Order | ⛔ FROZEN | Cannot change |
| Bug Fixes | ✅ ALLOWED | With approval |
| Adding new roles | ⚠️ MAYBE | With discussion |
| Adding optional middleware | ✅ ALLOWED | Doesn't break core |

---

**This system is locked to prevent further incidents.**  
**Violations will result in immediate code review.**  
**No exceptions.**

---

**Last Updated:** December 26, 2025  
**Version:** 1.0 FINAL  
**Status:** ✅ LOCKED & FROZEN
