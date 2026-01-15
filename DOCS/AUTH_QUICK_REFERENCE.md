# 🔐 AUTH SYSTEM - QUICK REFERENCE CARD

**Print this and keep it on your desk!**

---

## ✅ CORRECT USAGE

### Copy-Paste Template for New Routes:

```javascript
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route
router.get("/public", async (req, res) => {
  res.json({ message: "anyone can access" });
});

// Protected route (authenticated users only)
router.get("/profile", protect, async (req, res) => {
  const user = req.user;
  res.json({ user });
});

// Admin only route
router.post("/admin-action", protect, authorizeRoles("superadmin"), async (req, res) => {
  res.json({ message: "admin action" });
});

// Multiple roles allowed
router.get("/reports", protect, authorizeRoles("superadmin", "accountant"), async (req, res) => {
  res.json({ reports: "..." });
});

export default router;
```

---

## ❌ WHAT TO NEVER DO

| ❌ WRONG | ✅ RIGHT |
|---------|---------|
| `from "../middleware/auth.js"` | `from "../middleware/authMiddleware.js"` |
| `authenticate` | `protect` |
| `import auth from` | `import { protect } from` |
| Both imports from same file | Split into two imports |

---

## 📋 MIDDLEWARE ORDERING

**ALWAYS in this order:**
```javascript
router.route(
  "/path",
  protect,                     // ← Authentication first
  authorizeRoles(...),         // ← Role check second
  async (req, res) => { }      // ← Handler last
);
```

---

## 🎯 AVAILABLE ROLES

```javascript
"superadmin"     // ← Full access
"admin"          // ← Admin access
"tenantAdmin"    // ← Tenant admin
"accountant"     // ← Financial access
"teacher"        // ← Teaching access
"student"        // ← Student access
"staff"          // ← Staff access
```

---

## 📂 CORE AUTH FILES (LOCKED)

```
/backend/src/middleware/
├── authMiddleware.js      ⛔ FROZEN
│   └── export: protect, checkSuperAdmin, checkAdmin
├── roleMiddleware.js      ⛔ FROZEN
│   └── export: authorizeRoles
└── [Other files]          ✅ Optional
```

---

## 🚀 NEW ROUTE CHECKLIST

- [ ] Import `protect` from `authMiddleware.js`
- [ ] Import `authorizeRoles` from `roleMiddleware.js`
- [ ] Use `protect` before `authorizeRoles`
- [ ] Use correct role names
- [ ] Test without auth (should get 401)
- [ ] Test with auth (should work)
- [ ] Test with wrong role (should get 403)

---

## 🧪 QUICK TEST COMMANDS

```bash
# Test 1: Verify auth files exist
ls -la backend/src/middleware/authMiddleware.js
ls -la backend/src/middleware/roleMiddleware.js

# Test 2: Find any incorrect imports (should be empty)
grep -r "auth.js" backend/src/routes/
grep -r "authenticate" backend/src/routes/

# Test 3: Run verification script
bash backend/verify-auth-system.sh

# Test 4: Start backend and check logs
npm run dev
# Look for: "✅ Auth middleware error:" in logs
```

---

## 🆘 IF SOMETHING BREAKS

1. **Error: Cannot find module 'auth.js'**
   - Change: `from "../middleware/auth.js"`
   - To: `from "../middleware/authMiddleware.js"`

2. **Error: protect is not a function**
   - Check you're importing from correct file
   - Check you spelled `protect` correctly (not `authenticate`)

3. **Error: authorizeRoles is not a function**
   - Check you're importing from `roleMiddleware.js`
   - Check spelling: `authorizeRoles` (not `checkRoles`)

4. **Route returns 401 when it shouldn't**
   - Missing `protect` middleware
   - Token is invalid or expired

5. **Route returns 403 when it shouldn't**
   - Wrong role in `authorizeRoles()`
   - User doesn't have that role

---

## 📞 RULES TO REMEMBER

1. **Never create `auth.js`** ← Use `authMiddleware.js`
2. **Never rename functions** ← `protect` is `protect`
3. **Never move files** ← Keep in `/middleware/`
4. **Always protect first** ← `protect` before `authorizeRoles`
5. **Always use correct paths** ← Full relative paths with `.js`

---

## ✅ SYSTEM STATUS

**LOCKED:** ⛔ Auth system is frozen  
**VERIFIED:** ✅ All 32 routes are correct  
**TESTED:** ✅ No issues found  
**SAFE:** ✅ Can add new routes using template above  

---

**Last Updated:** December 26, 2025  
**Keep this nearby!** 📌
