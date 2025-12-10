# 🧪 LOGIN TEST CHECKLIST - CRITICAL!

## Before Proceeding Further ⚠️

You MUST verify login still works with SWR changes. This is non-negotiable.

---

## ✅ Pre-Test Setup

- [ ] Pull latest code
- [ ] Run `npm install` in `/frontend` directory
- [ ] Run `npm run dev` (start dev server)
- [ ] Open `http://localhost:3000` in browser

---

## 🔴 Critical Test Flow

### Test 1: Fresh Login
```
1. Navigate to http://localhost:3000/login
2. Enter: piyushmagar4p@gmail.com
3. Enter: 22442232
4. Click "Sign In"
5. ✅ Should redirect to /dashboard/home
6. ✅ Dashboard data should load (not stuck in loop)
7. ✅ No console errors about AUTH
```

**Expected Result:** Login completes, data loads, no redirects to register

### Test 2: Dashboard Loading
```
1. Once on dashboard, verify:
   - [ ] KPI cards load (Total Revenue, Subscriptions, etc)
   - [ ] Charts render (Revenue Trend, Tenants by Plan, etc)
   - [ ] Tables show data (Top Tenants)
   - [ ] No loading spinner after 2 seconds
   - [ ] No error messages
```

**Expected Result:** All data visible, no loading state

### Test 3: Refresh Button
```
1. Click "Refresh Data" button at bottom
   - [ ] Data refetches
   - [ ] No page reload
   - [ ] Instant update
```

**Expected Result:** Fresh data without full page reload

### Test 4: Network Tab Check
```
1. Open DevTools → Network tab
2. Refresh page
3. Look for requests to /api/analytics/dashboard
   - [ ] Should see 1-2 requests
   - [ ] Should be fast (< 500ms)
   - [ ] Status 200 OK
```

**Expected Result:** Single API call, proper responses

### Test 5: Tab Switch Test
```
1. On dashboard, switch to another tab/window
2. Wait 30 seconds
3. Come back to dashboard
   - [ ] Should NOT see loading spinner
   - [ ] Should NOT make new API call (use cache)
```

**Expected Result:** Instant data, no refetch

### Test 6: Logout & Re-login
```
1. Click logout (LogoutButton.tsx)
   - [ ] Redirect to login page
   - [ ] Auth state cleared
2. Login again with same credentials
   - [ ] Login succeeds
   - [ ] Dashboard loads
   - [ ] No "already logged in" errors
```

**Expected Result:** Clean logout/login cycle

### Test 7: Browser DevTools Console
```
1. Open DevTools → Console
2. Perform all above tests
3. Check for errors containing:
   - [ ] No "Cannot find token" errors
   - [ ] No "401 Unauthorized" during dashboard use
   - [ ] No "Infinite redirect" logs
   - [ ] No "CORS" errors
   - [ ] No "fetch failed" for /api/analytics/dashboard
```

**Expected Result:** Console clean, no auth-related errors

---

## 🚨 If Something Breaks

### Issue: "Stuck at login" / Infinite redirects
**Solution:** 
- Check that `/app/api/auth/login/route.ts` was NOT modified
- Check that `/app/middleware.ts` still has `return NextResponse.next()`
- Verify `process.env.EXPRESS_BACKEND_URL` is set in Vercel

### Issue: Dashboard shows error "Failed to fetch"
**Solution:**
- Check network tab - what status is /api/analytics/dashboard returning?
- If 401: Auth token not being sent (check cookies in DevTools)
- If 500: Backend error - check Railway logs
- If CORS: Check backend CORS configuration

### Issue: "Cannot find name 'useDashboardData'"
**Solution:**
- Run `npm install` again
- Make sure `frontend/hooks/useDashboardData.ts` exists
- Check file path is correct: `/hooks/useDashboardData.ts` NOT `/hook/...`

### Issue: SWR hook not found
**Solution:**
- Run `npm install swr`
- Restart dev server (`npm run dev`)
- Clear node_modules and reinstall if needed

---

## ✅ Pass Criteria

All of these MUST be true:

- [x] Login page loads without redirect
- [x] Can enter credentials without errors
- [x] Login button click works (no stuck state)
- [x] Redirects to /dashboard/home (not /register)
- [x] Dashboard loads all data within 2 seconds
- [x] No loading spinners after data loads
- [x] No error messages on dashboard
- [x] Refresh button works
- [x] Browser console has no auth errors
- [x] Can logout successfully
- [x] Can re-login after logout
- [x] Network tab shows proper API calls

---

## 🎯 Only After ALL Tests Pass

Once you've verified everything above, proceed to:

1. Update next dashboard page with SWR
2. Re-run full test suite
3. Only then move to page 3, 4, etc.

**Do NOT skip login testing!** 🚫

---

## Commands to Run

```bash
# In /frontend directory

# Install dependencies
npm install

# Start dev server
npm run dev

# Build (if testing production)
npm run build
npm start
```

---

## Questions?

If login breaks or dashboard doesn't load:
1. Check `/app/api/auth/login/route.ts` - should be UNCHANGED
2. Check `/app/middleware.ts` - should be SIMPLE (return NextResponse.next())
3. Check console errors - read them carefully
4. Check Network tab - see actual API responses
5. Ask for help with specific error message

