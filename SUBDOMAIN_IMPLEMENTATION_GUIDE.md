# Subdomain Multi-Tenancy Implementation Guide
**Date**: 23 December 2025  
**Deadline**: Deploy by 25 December 2025  
**Status**: Ready for Production Migration ✅

---

## Current State ✅
Your system is **ALREADY BUILT** for subdomain-based multi-tenancy! Here's what you have:

### 1. ✅ Middleware (Already Configured)
- **File**: `frontend/middleware.ts`
- **Features**:
  - ✅ Subdomain extraction
  - ✅ Tenant context cookies
  - ✅ Admin subdomain support (`admin.client.enromatics.com`)
  - ✅ Staff subdomain support (`staff.client.enromatics.com`)
  - ✅ Tenant public portal (`client.enromatics.com`)

### 2. ✅ BFF Architecture (Complete)
- All API routes go through `/api/*` (BFF pattern)
- Cookies automatically forwarded to backend
- No hardcoded backend URLs

### 3. ✅ Backend Tenant Protection
- `tenantProtect` middleware extracts `tenantId` from cookies
- All routes secured

---

## What You Need to Do NOW

### Step 1: DNS Configuration (First Client)
**Client Name**: [ENTER NAME]

#### A. Add DNS Records (At your domain registrar):
```
Type: A
Name: clientname
Value: YOUR_SERVER_IP
TTL: 300
```

```
Type: CNAME
Name: admin.clientname
Value: clientname.enromatics.com
TTL: 300
```

```
Type: CNAME  
Name: staff.clientname
Value: clientname.enromatics.com
TTL: 300
```

#### B. Add Wildcard SSL Certificate
If using Cloudflare/Let's Encrypt:
```bash
# Cloudflare automatically handles wildcard SSL
# Or use certbot:
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d enromatics.com \
  -d *.enromatics.com
```

---

### Step 2: Environment Variables

#### Frontend `.env.local`:
```bash
# Production URL
NEXT_PUBLIC_SITE_URL=https://enromatics.com
NEXT_PUBLIC_BACKEND_URL=https://api.enromatics.com

# Enable subdomain routing
NEXT_PUBLIC_SUBDOMAIN_ENABLED=true

# Main domain
NEXT_PUBLIC_MAIN_DOMAIN=enromatics.com
```

#### Backend `.env`:
```bash
# CORS - Allow all subdomains
CORS_ORIGIN=https://enromatics.com,https://*.enromatics.com

# Cookie domain (important!)
COOKIE_DOMAIN=.enromatics.com

# Database
MONGO_URI=your_mongo_connection_string

# JWT
JWT_SECRET=your_secret_key
```

---

### Step 3: Update Backend CORS (Critical!)

**File**: `backend/src/server.js`

Current CORS needs to allow subdomains:

```javascript
// Update CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Allow main domain and all subdomains
    const allowedDomains = [
      'http://localhost:3000',
      'https://enromatics.com',
      /^https:\/\/[\w-]+\.enromatics\.com$/,  // Any subdomain
      /^https:\/\/[\w-]+\.[\w-]+\.enromatics\.com$/  // Nested subdomains
    ];
    
    const isAllowed = allowedDomains.some(domain => {
      if (domain instanceof RegExp) {
        return domain.test(origin);
      }
      return domain === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Set cookie domain to allow subdomain sharing
app.use((req, res, next) => {
  res.cookie = function (name, value, options) {
    options = options || {};
    // Force cookie domain to parent domain
    options.domain = '.enromatics.com';
    return Response.prototype.cookie.call(this, name, value, options);
  };
  next();
});
```

---

### Step 4: Update Cookie Configuration

**File**: `backend/src/middleware/tenantProtect.js`

```javascript
export const tenantProtect = async (req, res, next) => {
  try {
    // First, check subdomain from header (set by middleware)
    const subdomain = req.headers['x-tenant-subdomain'];
    
    // Then check cookie
    const tenantIdFromCookie = req.cookies['tenant-context'];
    
    // Then check query param (fallback)
    const tenantIdFromQuery = req.query.tenantId;
    
    const tenantId = subdomain || tenantIdFromCookie || tenantIdFromQuery;
    
    if (!tenantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tenant context missing' 
      });
    }
    
    // Attach to request
    req.tenantId = tenantId;
    req.query.tenantId = tenantId; // Ensure it's in query too
    
    next();
  } catch (error) {
    console.error('Tenant protection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Tenant validation failed' 
    });
  }
};
```

---

### Step 5: Frontend BFF Routes - Add Subdomain Header

Update **ALL** BFF routes to pass subdomain to backend:

**Example**: `frontend/app/api/students/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Extract tenant from cookie or subdomain
    const tenantContext = request.cookies.get('tenant-context')?.value;
    
    const response = await fetch(`${BACKEND_URL}/api/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        // Pass tenant as header too
        "X-Tenant-Subdomain": tenantContext || '',
      },
      credentials: "include",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
```

---

### Step 6: Database - Ensure Tenant Isolation

**All MongoDB queries MUST include tenantId filter**:

```javascript
// ALWAYS filter by tenantId
const students = await Student.find({ 
  tenantId: req.tenantId 
});

// For aggregations
const stats = await Student.aggregate([
  { $match: { tenantId: req.tenantId } },
  // ... rest of pipeline
]);

// For updates
await Student.updateMany(
  { tenantId: req.tenantId, _id: { $in: ids } },
  { $set: updates }
);
```

**Create indexes for performance**:
```javascript
// In all models
schema.index({ tenantId: 1 });
schema.index({ tenantId: 1, createdAt: -1 });
```

---

### Step 7: Test Locally with Subdomains

**Option A**: Edit `/etc/hosts`:
```bash
sudo nano /etc/hosts

# Add:
127.0.0.1 testclient.localhost
127.0.0.1 admin.testclient.localhost
127.0.0.1 staff.testclient.localhost
```

**Option B**: Use `lvh.me` (automatically resolves to localhost):
- `testclient.lvh.me:3000`
- `admin.testclient.lvh.me:3000`

---

### Step 8: Testing Checklist

#### Test on Production Domain:
- [ ] `clientname.enromatics.com` - Student portal loads
- [ ] `admin.clientname.enromatics.com` - Admin dashboard loads
- [ ] `staff.clientname.enromatics.com` - Staff dashboard loads
- [ ] Login works across subdomains (shared cookies)
- [ ] All API calls go through BFF
- [ ] Tenant isolation - cannot see other tenant's data
- [ ] SSL certificate valid for all subdomains

#### Test All Modules:
- [ ] Students CRUD
- [ ] Scholarship Exams
- [ ] Scholarship Rewards
- [ ] Scholarship Results
- [ ] Fees Management
- [ ] Attendance
- [ ] Batches/Courses

---

## URL Structure After Migration

### Current (Path-based):
```
https://enromatics.com/dashboard/client/[tenantId]/students
https://enromatics.com/dashboard/client/[tenantId]/scholarship-exams
```

### New (Subdomain-based):
```
https://admin.clientname.enromatics.com/students
https://admin.clientname.enromatics.com/scholarship-exams
```

---

## Migration Timeline (23-25 Dec)

### Day 1 (23 Dec - TODAY):
- [x] Verify all BFF routes complete ✅
- [x] Verify error handling ✅
- [ ] Update backend CORS
- [ ] Update cookie domain settings
- [ ] Add subdomain header to BFF routes
- [ ] Test locally with lvh.me

### Day 2 (24 Dec):
- [ ] Deploy backend to production
- [ ] Configure DNS records
- [ ] Setup SSL certificates
- [ ] Deploy frontend to production
- [ ] Initial smoke tests

### Day 3 (25 Dec - LAUNCH):
- [ ] Full testing with first client
- [ ] Monitor logs
- [ ] Fix any issues
- [ ] **GO LIVE** 🚀

---

## Critical Files to Update

1. **Backend**:
   - `backend/src/server.js` - CORS config
   - `backend/src/middleware/tenantProtect.js` - Subdomain extraction
   - All controllers - Ensure tenantId filtering

2. **Frontend**:
   - All `/app/api/**` routes - Add X-Tenant-Subdomain header
   - `frontend/middleware.ts` - Already configured ✅
   - `.env.local` - Add subdomain settings

---

## Security Checklist

- [ ] Cookie domain set to `.enromatics.com`
- [ ] HttpOnly cookies for sensitive data
- [ ] Secure flag enabled in production
- [ ] SameSite=Lax for CSRF protection
- [ ] All DB queries filtered by tenantId
- [ ] CORS restricted to subdomains only
- [ ] Rate limiting per tenant
- [ ] Input validation on all routes

---

## Rollback Plan

If issues arise:
1. Switch DNS back to main domain
2. Revert to path-based routing (`/dashboard/client/[tenantId]`)
3. Both patterns can coexist during transition

---

## Support & Monitoring

### Logs to Monitor:
```bash
# Backend
tail -f logs/backend.log | grep "tenant"

# Frontend  
tail -f .next/server/logs

# Check subdomain extraction
grep "tenant-context" logs/*.log
```

### Common Issues:
1. **"Tenant context missing"** → Check middleware running
2. **CORS errors** → Update origin pattern
3. **Cookie not shared** → Check domain=.enromatics.com
4. **Cannot access data** → Verify tenantId in all queries

---

## Next Steps RIGHT NOW

Run this script to update all BFF routes:
```bash
cd frontend
find app/api -name "route.ts" -type f -exec grep -l "fetch(" {} \;
```

Then I'll help you update each file to add the subdomain header.

Ready to proceed? Let's make this happen! 🚀
