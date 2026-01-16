# Student Portal - Quick Testing Guide

## Prerequisites

### 1. Local DNS Setup
Add this to `/etc/hosts`:
```
127.0.0.1 prasanagar.lvh.me
```

**On macOS:**
```bash
sudo nano /etc/hosts
# Add: 127.0.0.1 prasanagar.lvh.me
# Save: Ctrl+O, Enter, Ctrl+X
```

**On Windows (PowerShell as Admin):**
```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "127.0.0.1 prasanagar.lvh.me"
```

### 2. Start Development Server
```bash
cd /Users/mpiyush/Documents/Pixels_web_\ dashboard/frontend
npm run dev
```

The server should run on `http://localhost:3000`

---

## Testing Flow

### Step 1: Access Student Login
1. Open browser
2. Navigate to: **http://prasanagar.lvh.me:3000/student/login**
3. You should see:
   - "Student Portal" heading
   - "Prasanagar Coaching Classes" subtitle
   - Email and password input fields
   - Demo credentials display showing:
     ```
     📧 pixelsadvertise@gmail.com
     🔑 test123
     ```

### Step 2: Test Login
1. Enter email: `pixelsadvertise@gmail.com`
2. Enter password: `test123`
3. Click "Login" button
4. Expected: Should redirect to `http://prasanagar.lvh.me:3000/student/home`

### Step 3: Verify Home Page
On the home page, you should see:
- ✅ Header with "Prasanagar Portal"
- ✅ "Welcome, [Student Name]" message
- ✅ Logout button
- ✅ Quick navigation cards:
  - 📚 Academics
  - 📋 Assignments
  - 💰 Payments
  - 👤 Profile

### Step 4: Navigate to Sub-pages
Test each navigation card:
- **Academics**: Should show course progress
- **Assignments**: Should show assignment list
- **Payments**: Should show fees and payment history
- **Profile**: Should show student details

### Step 5: Test Logout
1. Click "Logout" button
2. Should be redirected to `/student/login`
3. localStorage should be cleared

---

## Troubleshooting

### Issue: "Cannot GET /student/login"
**Cause:** Route not configured properly
**Solution:**
1. Check file exists: `/frontend/app/student/login/page.tsx`
2. Restart dev server: `npm run dev`

### Issue: Login button disabled
**Cause:** Tenant subdomain not detected
**Solution:**
1. Verify hosts file contains `127.0.0.1 prasanagar.lvh.me`
2. Clear browser cache and reload
3. Check browser console for tenant detection logs

### Issue: "Invalid credentials" after login
**Cause:** Backend authentication not configured
**Solution:**
1. Verify backend running: `http://localhost:3000/api/auth/login` endpoint exists
2. Check MongoDB connection
3. Verify student record exists with correct password hash

### Issue: Page redirects to login after login
**Cause:** Token not properly saved
**Solution:**
1. Check browser localStorage for `authToken`
2. Verify token is valid JWT
3. Check backend validates token correctly

### Issue: Subdomain not working (localhost instead)
**Solution:**
1. Use `http://prasanagar.lvh.me:3000` NOT `http://localhost:3000`
2. Verify hosts file entry
3. Clear browser DNS cache: 
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   ```

---

## API Endpoints to Implement

For full functionality, backend needs these endpoints:

### 1. Authentication
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: { _id, name, email } }
```

### 2. Student Data
```
GET /api/student/profile
Headers: Authorization: Bearer {token}
Response: { student: { _id, name, email, phone, ... } }

GET /api/student/academics
Headers: Authorization: Bearer {token}
Response: { batchName, courses: [...], averageScore, ... }

GET /api/student/assignments
Headers: Authorization: Bearer {token}
Response: { assignments: [...] }

GET /api/student/payments
Headers: Authorization: Bearer {token}
Response: { totalFees, totalPaid, balance, payments: [...] }
```

---

## Frontend File Structure

```
frontend/
├── app/
│   ├── student/
│   │   ├── login/
│   │   │   └── page.tsx          ← Login form
│   │   ├── home/
│   │   │   └── page.tsx          ← Dashboard
│   │   ├── academics/
│   │   │   └── page.tsx          ← Academics
│   │   ├── assignments/
│   │   │   └── page.tsx          ← Assignments
│   │   ├── payments/
│   │   │   └── page.tsx          ← Payments
│   │   └── profile/
│   │       └── page.tsx          ← Profile
│   └── ...
├── lib/
│   └── middleware/
│       └── tenantContext.ts      ← Subdomain extraction
├── middleware.ts                  ← Next.js middleware
└── ...
```

---

## Browser DevTools Debugging

### Check Tenant Detection
Open browser console and run:
```javascript
// Should return 'prasanagar'
fetch('/').then(r => r.headers.get('x-tenant-subdomain'))
```

### Check Token Storage
```javascript
// Should return your JWT token
localStorage.getItem('authToken')

// Should return your email
localStorage.getItem('userEmail')
```

### Check Network Requests
1. Open Network tab
2. Login and monitor requests:
   - `POST /api/auth/login` (should return 200)
   - `GET /api/student/profile` (should return 200)

---

## Success Indicators ✅

When everything is working:
- [ ] Can access `/student/login` on subdomain
- [ ] Can see demo credentials displayed
- [ ] Login with demo credentials works
- [ ] Redirected to `/student/home`
- [ ] Student name displays correctly
- [ ] All navigation cards visible
- [ ] Can click through to sub-pages
- [ ] Logout clears localStorage
- [ ] Cannot access pages without login

---

## Next: Backend Implementation

Once frontend is tested, implement these backend endpoints:
1. `/api/auth/login` - Validate credentials
2. `/api/student/profile` - Return student data
3. `/api/student/academics` - Return courses & progress
4. `/api/student/assignments` - Return assignments
5. `/api/student/payments` - Return fees & payments

See `STUDENT_PORTAL_SETUP.md` for API specifications.
