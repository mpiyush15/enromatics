# RBAC Roles Configuration Comparison

## Defined Roles in Models

### User Model (`backend/src/models/User.js`)
```
["SuperAdmin", "Admin", "tenantAdmin", "employee", "student", "adsManager", "teacher", "staff", "manager", "counsellor", "accountant", "marketing"]
```

### Staff Model (`backend/src/models/Staff.js`)
```
["teacher", "staff", "accountant", "admissionIncharge", "counsellor", "receptionist", "librarian", "labAssistant", "manager", "other"]
```

### Student Model (`backend/src/models/Student.js`)
```
["student"] (default only)
```

---

## Roles Used in Sidebar Config

### Unique roles in sidebar:
```
["SuperAdmin", "Admin", "tenantAdmin", "employee", "student", "adsManager", "teacher", "staff", "manager", "counsellor", "accountant", "marketing"]
```

---

## Analysis: MISMATCH FOUND ❌

### Roles in User model but NOT in sidebar:
- `"marketing"` - Defined in User model but **NOT USED** in sidebar

### Roles used in sidebar that DON'T have clear definition:
- `"employee"` - Used in sidebar, exists in User enum, but **NOT in Staff model**

### Roles in Staff model but NOT properly in User model:
- `"admissionIncharge"` - In Staff model but **NOT in User model enum**
- `"receptionist"` - In Staff model but **NOT in User model enum**
- `"librarian"` - In Staff model but **NOT in User model enum**
- `"labAssistant"` - In Staff model but **NOT in User model enum**
- `"other"` - In Staff model but **NOT in User model enum**

---

## Issues:

1. **User model vs Staff model role mismatch**
   - User model has: `teacher, staff, accountant, counsellor, manager`
   - Staff model has: `teacher, staff, accountant, admissionIncharge, counsellor, receptionist, librarian, labAssistant, manager, other`
   - Missing in User: `admissionIncharge, receptionist, librarian, labAssistant, other`

2. **"employee" vs "staff" confusion**
   - Sidebar uses `"employee"` (in User model)
   - Sidebar uses `"staff"` (also exists in both)
   - Are these the same thing? Different?

3. **"marketing" is defined but unused**
   - User model includes `"marketing"`
   - But **NO sidebar links use it**

4. **Staff roles not in User enum**
   - If Staff members can log in as users, their roles need to be in User enum
   - Currently only 5 roles overlap

---

## Recommendation:

Need to decide:
1. Should User model and Staff model have matching role enums?
2. What is the difference between `"employee"` and `"staff"`?
3. Should `"marketing"` role have sidebar access?
4. Should specialized staff roles (`admissionIncharge`, `receptionist`, etc.) be in User model?
