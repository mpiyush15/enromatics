# Subdomain-Based Tenant Logins & Dashboards - Implementation Workflow

## 🎯 Overall Architecture

```
User visits: client.enromatics.com
      ↓
Middleware extracts subdomain (client)
      ↓
Routes to tenant-specific pages with branding
      ↓
User logs in with tenant credentials
      ↓
Dashboard shows tenant-only data
```

---

## 📋 Implementation Phases

### Phase 1: Backend Setup (Express.js)
**What needs to exist on backend:**

1. **GET /api/tenants/by-subdomain/:subdomain**
   - Purpose: Fetch tenant info by subdomain (branding, appName, etc.)
   - No authentication required (public endpoint)
   - Returns: `{ tenantId, name, instituteName, branding: { logoUrl, themeColor, appName } }`
   - Used by: Tenant login page to show branding

2. **POST /api/auth/login** (already exists, might need updates)
   - Purpose: Authenticate user with email/password
   - No subdomain parameter needed
   - Backend extracts tenantId from JWT context/user
   - Returns: `{ token, user: { email, tenantId, role, name } }`

3. **GET /api/dashboard** (already exists)
   - Purpose: Return dashboard overview data for logged-in tenant
   - Requires: Authentication (Bearer token or cookie)
   - Returns: `{ studentsCount, staffCount, batchesCount, recentActivity, plan }`

---

### Phase 2: Frontend BFF Routes (Next.js /api/*)

#### Route 1: GET /api/tenant/subdomain
```
Input: ?subdomain=client
Purpose: Fetch tenant branding info
Output: { success, tenant: { tenantId, name, instituteName, branding } }
```

#### Route 2: POST /api/tenant/login
```
Input: { email, password, subdomain }
Process:
  1. Call backend /api/auth/login with email/password
  2. Receive token from backend
  3. Set httpOnly cookie "token" = token
  4. Set cookie "tenant-context" = subdomain
  5. Return user info to frontend
Output: { success, user: { email, tenantId, name }, tenantId }
```

#### Route 3: GET /api/tenant/dashboard
```
Input: (no params, but cookies have token + tenant-context)
Process:
  1. Extract token from cookie
  2. Extract tenantId from tenant-context cookie
  3. Call backend GET /api/dashboard with Bearer token
  4. Return dashboard data
Output: { success, data: { studentsCount, staffCount, ... } }
```

---

### Phase 3: Frontend Pages (Next.js /app/*)

#### Page 1: /tenant-login (tenant-specific login page)
```
Flow:
  1. Extract subdomain from URL query param or middleware cookie
  2. Call GET /api/tenant/subdomain?subdomain=xxx to get tenant branding
  3. Render login form with tenant branding (logo, colors, appName)
  4. On submit: Call POST /api/tenant/login with credentials
  5. On success: Redirect to /tenant-dashboard?tenant=xxx
  6. Cookie "token" automatically sent on all requests
```

Features:
- Dynamic branding (logo, theme color, app name)
- Error handling
- Loading states
- Link to /tenant-register

#### Page 2: /tenant-dashboard (tenant-specific dashboard)
```
Flow:
  1. Check if token cookie exists (if not, redirect to /tenant-login)
  2. Extract subdomain from URL or tenant-context cookie
  3. Call GET /api/tenant/subdomain to get tenant branding
  4. Call GET /api/tenant/dashboard (via SWR) to get stats
  5. Render dashboard with:
     - Tenant branding in header
     - Student/staff/batch counts
     - Recent activity
     - Quick action cards
```

Features:
- SWR for data fetching (deduplication, caching)
- Logout button
- Tenant branding applied
- Data isolation (each tenant sees only their data)

---

### Phase 4: Middleware Updates (Already done, verify)

Current middleware in `middleware.ts`:
```typescript
// Extract subdomain from host
const subdomain = getSubdomain(host);  // e.g., "client"

// Route to tenant pages
if (request.nextUrl.pathname === '/') {
  url.pathname = '/tenant-portal';  // or /tenant-login
}

// Set cookie for easy access
response.cookies.set('tenant-context', subdomain);
```

**Status:** ✅ Already implemented, just needs to route to /tenant-login

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Browser                                  │
│            (client.enromatics.com)                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js Middleware                              │
│  1. Extract subdomain from host: "client"                        │
│  2. Set cookie "tenant-context": "client"                        │
│  3. Route to /tenant-login                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              /tenant-login Page (Frontend)                       │
│  1. Read subdomain from URL/cookie                               │
│  2. Fetch GET /api/tenant/subdomain?subdomain=client             │
│  3. Render login form with tenant branding                       │
│  4. On submit → POST /api/tenant/login                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│           Next.js BFF Route: /api/tenant/login                   │
│  1. Extract email, password from body                            │
│  2. Call Express backend: POST /api/auth/login                   │
│  3. Receive token from backend                                   │
│  4. Set httpOnly cookie "token" = token                          │
│  5. Return { success: true, user: {...} }                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              /tenant-dashboard Page (Frontend)                   │
│  1. Check if token cookie exists (auth guard)                    │
│  2. Fetch GET /api/tenant/subdomain (for branding)               │
│  3. Fetch GET /api/tenant/dashboard (via SWR, with token cookie) │
│  4. Render dashboard with stats & branding                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│          Next.js BFF Route: /api/tenant/dashboard                │
│  1. Extract token from cookie (auto-sent by browser)             │
│  2. Extract tenantId from tenant-context cookie                  │
│  3. Call Express backend: GET /api/dashboard                     │
│     Header: Authorization: Bearer {token}                        │
│  4. Return dashboard data to frontend                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│          Express Backend (Railway)                               │
│  1. Validate JWT token                                           │
│  2. Extract tenantId from JWT payload                            │
│  3. Query database for tenant-specific data                      │
│  4. Return data (students, staff, batches, etc.)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Checklist

### Backend (Express.js) - Prerequisites
- [ ] Verify `GET /api/tenants/by-subdomain/:subdomain` endpoint exists
- [ ] Verify `POST /api/auth/login` returns token
- [ ] Verify `GET /api/dashboard` returns tenant-specific data
- [ ] Add error handling for subdomain not found (404)

### Frontend - BFF Routes (/api/tenant/*)
- [ ] Create `GET /api/tenant/subdomain` → fetch tenant branding
- [ ] Create `POST /api/tenant/login` → authenticate & set cookies
- [ ] Create `GET /api/tenant/dashboard` → fetch dashboard data with auth

### Frontend - Pages (/app/tenant-*)
- [ ] Create `/tenant-login` page with branding
- [ ] Create `/tenant-dashboard` page with SWR
- [ ] Create `/tenant-register` page (if needed)

### Frontend - Middleware
- [ ] Update middleware to route subdomain to `/tenant-login`
- [ ] Ensure cookies are properly set/forwarded

### Testing
- [ ] Test login flow on subdomain
- [ ] Verify data isolation between tenants
- [ ] Check branding loads correctly
- [ ] Verify SWR caching works
- [ ] Test logout flow

---

## 📝 Key Differences from Admin Dashboard

| Feature | Admin Dashboard | Tenant Dashboard |
|---------|-----------------|-----------------|
| URL | admin.tenant.enromatics.com | client.enromatics.com |
| Users | Tenant admins, staff | Students, general users |
| Data | Full management access | Read-only overview |
| Branding | Default/system branding | Tenant-specific branding |
| Auth | Token-based | Token-based (same) |
| Pages | Multiple (staff, students, etc.) | Simple overview |

---

## 🔐 Security Considerations

1. **Data Isolation:**
   - Backend must validate tenantId in JWT
   - Each request must check: `jwt.tenantId === requestedTenantId`

2. **Cookie Security:**
   - Token cookie: `httpOnly: true, secure: true, sameSite: 'lax'`
   - Tenant context: `httpOnly: false` (frontend needs access)

3. **Subdomain Lookup:**
   - Cache tenant branding in memory (Redis/server)
   - Add rate limiting for branding endpoint
   - Return 404 if subdomain not found (don't reveal tenant names)

4. **CORS & Headers:**
   - Allow credentials in fetch calls: `credentials: 'include'`
   - Forward cookies from BFF to backend

---

## 🚀 Performance Optimizations

1. **Caching:**
   - Tenant branding: Cache in browser localStorage + SWR
   - Dashboard stats: Cache with 30-60 second revalidation

2. **Images:**
   - Serve tenant logos from S3 CDN
   - Pre-load logo before rendering page

3. **Data Fetching:**
   - Use SWR for automatic deduplication
   - Batch API requests where possible

---

## 📞 Next Steps

1. **Confirm backend endpoints** exist and return correct data format
2. **Create BFF routes** (/api/tenant/*)
3. **Create frontend pages** (/app/tenant-login, /tenant-dashboard)
4. **Update middleware** to route to /tenant-login
5. **Test end-to-end** on local dev and staging
6. **Deploy to production**

