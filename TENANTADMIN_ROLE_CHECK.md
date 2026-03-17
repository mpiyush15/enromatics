# TenantAdmin Role Check

## Question: Is tenantAdmin in both enums?

### User Model (`backend/src/models/User.js`)
```javascript
role: {
  enum: ["SuperAdmin", "Admin", "tenantAdmin", "employee", "student", "adsManager", "teacher", "staff", "manager", "counsellor", "accountant", "marketing"],
  default: "tenantAdmin", // every new signup = tenant admin by default
}
```
✅ **tenantAdmin IS defined in User model**

### Staff Model (`backend/src/models/Staff.js`)
```javascript
role: {
  enum: [
    "teacher",
    "staff",
    "accountant",
    "admissionIncharge",
    "counsellor",
    "receptionist",
    "librarian",
    "labAssistant",
    "manager",
    "other"
  ],
  required: true,
}
```
❌ **tenantAdmin IS NOT in Staff model**

---

## Problem:

**Staff and User are different models with different role enums:**

### User roles (12 total):
`SuperAdmin, Admin, tenantAdmin, employee, student, adsManager, teacher, staff, manager, counsellor, accountant, marketing`

### Staff roles (10 total):
`teacher, staff, accountant, admissionIncharge, counsellor, receptionist, librarian, labAssistant, manager, other`

### Key differences:
- **Staff model does NOT have**: `SuperAdmin, Admin, tenantAdmin, employee, student, adsManager, marketing`
- **User model does NOT have**: `admissionIncharge, receptionist, librarian, labAssistant, other`

---

## Impact:

1. **TenantAdmin cannot be a Staff member**
   - A tenantAdmin cannot have a Staff record
   - Staff records can only have the 10 roles listed

2. **Staff with special roles (receptionist, librarian, etc.) cannot be Users**
   - They can only exist as Staff records, not as User records
   - They cannot log in as regular users

3. **Sidebar expects User roles, not Staff roles**
   - Backend sends sidebar based on the user's role from JWT
   - If someone logs in as a Staff member, their JWT won't have Staff roles like "receptionist"
   - This causes role filtering to fail

---

## Decision: Keep Employee?

✅ **"employee" is in User model**
✅ **"employee" is NOT in Staff model**

If you want to keep "employee":
- It's a general staff member with no specific department/function
- Staff records must use one of the 10 specific roles
- This is actually correct separation
