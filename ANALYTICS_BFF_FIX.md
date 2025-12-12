# Analytics BFF Routes - Fixed ✅

## Problems Found & Resolved

### Problem 1: Missing BFF Routes (404 Error)
The frontend was making **direct backend calls** for analytics endpoints instead of using BFF (Backend-For-Frontend) routes.
- ❌ 404 error on `/api/analytics/dashboard`

### Problem 2: Wrong Cookie Name (401 Error)
BFF routes were looking for cookie named "token", but Express backend sets cookie named "jwt"
- ❌ 401 Unauthorized because token extraction failed

## Solutions Implemented

### 1. Created 3 BFF Routes:
1. ✅ **`/api/analytics/dashboard`** → `frontend/app/api/analytics/dashboard/route.ts`
2. ✅ **`/api/analytics/revenue-breakdown`** → `frontend/app/api/analytics/revenue-breakdown/route.ts`
3. ✅ **`/api/analytics/top-tenants`** → `frontend/app/api/analytics/top-tenants/route.ts`

### 2. Fixed Token Extraction:
All BFF routes now correctly:
- ✅ Look for cookie named **"jwt"** (set by Express backend)
- ✅ Fall back to Authorization header if cookie not found
- ✅ Forward token to Express backend

### 3. Updated Components:
1. ✅ **`frontend/app/dashboard/home/page.tsx`**
   - Already using relative path `/api/analytics/dashboard` ✓

2. ✅ **`frontend/components/dashboard/RevenueBreakdown.tsx`**
   - Changed from direct backend call to `/api/analytics/revenue-breakdown` (BFF route)
   - Removed localStorage token check (BFF handles via cookies)

3. ✅ **`frontend/components/dashboard/TopTenantsTable.tsx`**
   - Changed from direct backend call to `/api/analytics/top-tenants` (BFF route)
   - Removed localStorage token check (BFF handles via cookies)

## How It Works Now (✅ Fixed)

```
1. Frontend Login:
   Login Page → POST /api/auth/login (BFF)
   BFF forwards to Express → Express sets 'jwt' cookie
   Express returns Set-Cookie header
   BFF forwards Set-Cookie → Browser stores as httpOnly cookie

2. Frontend Analytics Request:
   Dashboard Component → GET /api/analytics/dashboard (BFF, relative path)
   Browser sends 'jwt' cookie automatically (credentials: 'include')
   BFF extracts 'jwt' from request.cookies
   BFF forwards token to Express backend
   Express returns analytics data
   BFF returns data to frontend
```

## Cookie Flow

```
Express Backend:
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: (production),
    sameSite: (production ? "none" : "lax"),
    maxAge: 30 * 24 * 60 * 60 * 1000
  })

BFF Route:
  let token = request.cookies.get("jwt")?.value;
  // Use token to call Express backend
```

## Benefits
- ✅ Secure: Tokens handled server-side via httpOnly cookies
- ✅ Works in Production: Proper sameSite and secure flags
- ✅ No CORS Issues: All calls within same domain (vercel.app)
- ✅ Automatic Cookie Forwarding: BFF handles Set-Cookie headers
- ✅ Flexible Backend: Can change URL without frontend rebuild
- ✅ Consistent Pattern: All analytics endpoints follow same BFF pattern

## Testing Checklist
- [ ] Login works (token stored in httpOnly cookie)
- [ ] Dashboard analytics loads without 401
- [ ] Revenue breakdown chart loads
- [ ] Top tenants table loads
- [ ] All three endpoints show proper data
- [ ] Refresh page - data persists (cookies still valid)
- [ ] Test in production after deployment

