# Analytics Dashboard Test

## Test Steps

### 1. Login
- Go to https://enromatics.com/login (or localhost:3000/login)
- Login with SuperAdmin credentials
- Should redirect to `/dashboard/home`

### 2. Dashboard Load
- Dashboard home should load without 401 errors
- Should see KPI cards, charts, tables

### 3. Check Logs

**Browser Console (DevTools F12):**
- No 401 errors
- No token errors
- Charts and data should load

**Backend Console:**
- Look for these logs in order:
  ```
  ✅ Token from cookie
  ✅ Decoded token: { id: ..., email: ..., role: ... }
  ✅ User authenticated: { email: ..., role: ... }
  🔐 Role check - User role: superadmin Allowed roles: [ 'superadmin' ] Match: true
  ✅ Role authorized
  📊 Analytics API called - User: { email: ..., role: ... }
  ```

### 4. Troubleshooting

**If 401 Unauthorized:**
- Check backend logs for "No token found" - means cookies not being sent
- Verify CORS has `credentials: true`
- Verify cookie-parser middleware is loaded
- Check if token is in browser cookies (DevTools → Application → Cookies)

**If 403 Forbidden:**
- Check if user role is "SuperAdmin" in database (case-sensitive)
- Look for "Role check" logs to see what role was received

**If no data shows:**
- Check if Tenant collection has data
- Check analytics controller logs
- Database might be empty

## Expected Result
✅ Dashboard loads with:
- 4 KPI cards (Revenue, Subscriptions, Tenants, Users)
- 5 charts (Revenue trend, Plans pie chart, Monthly revenue, Signups, Status)
- Revenue breakdown card
- Top tenants table
- Refresh button
