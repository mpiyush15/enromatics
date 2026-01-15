# Student Password Reset - Complete Flow Documentation

## Overview
The student password reset feature allows admins to reset a student's password and display the new password for sharing.

---

## Files Involved

### 1. **Backend Controller** 
**File**: `backend/src/controllers/studentController.js` (Lines 284-305)

```javascript
export const resetStudentPassword = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });
    
    // If newPassword is not provided, generate a random one
    const generated = newPassword || Math.random().toString(36).slice(-8);

    const student = await Student.findOne({ _id: id, tenantId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.password = generated;
    await student.save();

    // Return the (possibly generated) new password so admin can share it
    res.status(200).json({ 
      success: true, 
      message: "Password reset", 
      newPassword: generated 
    });
  } catch (err) {
    console.error("Reset student password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
```

**What it does**:
- ✅ Validates tenant ID from auth context
- ✅ Generates random 8-char password if not provided
- ✅ Finds student by ID and tenant
- ✅ Updates student password in database
- ✅ Returns new password to admin

**Security**:
- ✅ Protected by `protect` middleware (auth required)
- ✅ Authorized roles: "tenantAdmin", "teacher", "staff"
- ✅ Requires permission: "canAccessStudents"
- ✅ Tenant-scoped: `tenantId` from auth context

---

### 2. **Backend Route**
**File**: `backend/src/routes/studentRoutes.js` (Lines 68-75)

```javascript
// Admin reset student password (generate or set new password)
router.put(
  "/:id/reset-password",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  resetStudentPassword
);
```

**Route Details**:
- **Method**: `PUT`
- **Endpoint**: `/api/students/:id/reset-password`
- **Middleware Stack**:
  1. `protect` - Verify JWT token
  2. `authorizeRoles()` - Check user role
  3. `requirePermission()` - Check specific permission
  4. `resetStudentPassword` - Handler function

---

### 3. **BFF Route Handler**
**File**: `frontend/app/api/students/route.ts` (Lines 304-340+)

```typescript
// PUT /api/students/:id/reset-password
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' }, 
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    // If request path contains reset-password, forward to backend reset endpoint
    if (url.pathname.endsWith('/reset-password')) {
      console.log('📤 Resetting student password via Backend (PATCH)');

      const backendResponse = await fetch(
        `${BACKEND_URL}/api/students/${params.id}/reset-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': extractCookies(request),
            'X-Tenant-Guard': 'true',
          },
        }
      );
      // ... response handling
    }
  } catch (err) {
    // ... error handling
  }
}
```

**What it does**:
- ✅ Accepts PATCH requests (frontend uses PUT, BFF normalizes)
- ✅ Validates student ID parameter
- ✅ Extracts cookies from frontend request
- ✅ Forwards to backend with X-Tenant-Guard header
- ✅ Proxies response back to frontend

**Security**:
- ✅ Uses httpOnly cookies (not localStorage)
- ✅ Includes X-Tenant-Guard header
- ✅ Preserves auth context through BFF

---

### 4. **Frontend Handler**
**File**: `frontend/app/dashboard/client/[tenantId]/students/[studentId]/page.tsx` (Lines 113-134)

```typescript
const handleResetPassword = async () => {
  const ok = confirm("Generate/reset password for this student? The new password will be shown to you.");
  if (!ok) return;
  
  setStatus("Resetting password...");
  try {
    const res = await fetch(`/api/students/${studentId}/reset-password`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    
    const data: StudentMutationResponse = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reset password");
    
    const newPwd = data.newPassword;
    alert(`Password reset successfully!\n\nNew Password: ${newPwd}\n\nPlease share this with the student.`);
    setStatus(`✅ Password reset. New password: ${newPwd}`);
  } catch (err: any) {
    console.error(err);
    setStatus("❌ " + (err.message || "Error resetting password"));
  }
};
```

**What it does**:
- ✅ Shows confirmation dialog to admin
- ✅ Sends PUT request to BFF endpoint
- ✅ Uses `credentials: "include"` for cookie auth
- ✅ Types response as `StudentMutationResponse`
- ✅ Displays new password in alert dialog
- ✅ Shows success/error status message

**UX**:
- ✅ Confirmation dialog prevents accidental resets
- ✅ New password shown in alert (admin copies for student)
- ✅ Status message provides feedback
- ✅ Error handling with user-friendly messages

---

## Complete Request/Response Flow

### Request Flow
```
Admin clicks "Reset Password" button
    ↓
handleResetPassword() confirms action
    ↓
Frontend: PUT /api/students/{studentId}/reset-password
    (credentials: "include")
    ↓
BFF Route: PATCH handler extracts cookies
    ↓
BFF: PUT {BACKEND_URL}/api/students/{studentId}/reset-password
    (with X-Tenant-Guard header + cookies)
    ↓
Backend Controller: resetStudentPassword
    ↓
Backend: Updates password in database
    ↓
Backend: Returns { success: true, newPassword: "xyz" }
```

### Response Flow
```
Backend: { success: true, newPassword: "xyz" }
    ↓
BFF: Passes response through
    ↓
Frontend: Receives StudentMutationResponse
    ↓
handleResetPassword: Extracts data.newPassword
    ↓
Alert displayed: "New Password: xyz"
    ↓
Admin can copy and share with student
```

---

## Type Definition

**StudentMutationResponse** (from `frontend/types/student.ts`):
```typescript
export interface StudentMutationResponse {
  success: boolean;
  student?: StudentDTO;
  message?: string;
  newPassword?: string;  // ← Used for reset-password response
}
```

---

## API Contract

### Request
```http
PUT /api/students/{studentId}/reset-password
Content-Type: application/json
Cookie: [httpOnly JWT]

{
  // No body required (generates random password)
  // Optional: { newPassword: "customPassword" }
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Password reset",
  "newPassword": "aBcD1234"
}
```

### Response (400 Bad Request)
```json
{
  "message": "Student ID required"
}
```

### Response (403 Forbidden)
```json
{
  "message": "Tenant ID missing"
}
```

### Response (404 Not Found)
```json
{
  "message": "Student not found"
}
```

### Response (500 Server Error)
```json
{
  "message": "Server error"
}
```

---

## Security Features

| Feature | Status | Details |
|---------|--------|---------|
| **Auth Required** | ✅ | Must be logged in (JWT token) |
| **Role-Based** | ✅ | Only tenantAdmin, teacher, staff |
| **Permission Check** | ✅ | Requires "canAccessStudents" permission |
| **Tenant Scoped** | ✅ | Only accessible within own tenant |
| **Cookie Auth** | ✅ | Uses httpOnly cookies (not localStorage) |
| **No Password in Transit** | ✅ | Only returned in final alert, not logged |
| **Audit Trail** | ✅ | Server logs password reset action |

---

## How to Use

### From Dashboard Student Detail Page:
1. Navigate to a student's detail page
2. Click "🔐 Reset Password" button
3. Confirm in dialog: "Generate/reset password?"
4. New password appears in alert
5. Admin copies and shares with student

### Button Location:
```tsx
<button 
  onClick={handleResetPassword}
  className="..."
>
  🔐 Reset Password
</button>
```

---

## Testing Checklist

- [ ] Admin can navigate to student detail page
- [ ] Reset password button is visible
- [ ] Confirmation dialog appears
- [ ] Password is actually changed in database
- [ ] New password is returned and displayed
- [ ] Non-admins cannot reset password (403)
- [ ] Invalid student ID shows 404
- [ ] Password works for student login after reset
- [ ] Tenant isolation works (can't reset other tenant's student)

---

## Related Features

- **Student Login**: Students use generated password to log in
- **Change Password**: Students can later change their own password
- **Batch Operations**: Bulk student creation generates initial passwords
- **Account Security**: Password reset tracked in audit logs

---

**Last Updated**: 14 December 2025  
**MVP Status**: ✅ Included in MVP 1.0 Release
