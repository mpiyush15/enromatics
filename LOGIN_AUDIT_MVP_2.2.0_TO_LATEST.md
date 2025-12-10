# Login Issue Audit: MVP 2.2.0 → Latest

## Timeline of Changes

### MVP 2.2.0 (Commit: 2225126) ✅ WORKING
- Redis Caching for all modules
- MongoDB Indexes
- Gzip Compression
- Login: Works perfectly

### MVP 2.2.3 (Commit: 11426c7) 🔴 BREAKS
- **Added:** Full Redis Caching Implementation (37 routes)
- **Added:** Caching in auth service
- **Issue:** Cache causes login to fail

### MVP 2.2.4 (Commit: edc2a76) 🔴 BREAKS
- **Added:** SWR Client-Side Caching for subscription page
- **Added:** SWR for specific endpoints
- **Issue:** Login still broken

### MVP 2.2.5 (Commit: 1c363b7) 🔴 BREAKS
- **Added:** Performance: SWR Client Caching + Skeleton Loaders
- **Added:** SWR extended to more pages
- **Issue:** Login still broken

---

## Root Cause Analysis

### What Changed Between 2.2.0 and 2.2.3

**Key Changes:**
1. **Cache Service Added** - `frontend/lib/cache.ts`
   - TTL-based caching with invalidation
   - User authentication caching
   
2. **Auth Service Modified** - `frontend/lib/authService.ts`
   - Added caching layer
   - User data cached after login
   - May be returning stale/cached data

3. **Middleware Still Same** - `frontend/middleware.ts`
   - Same issue with `/tenant-login` rewrite exists
   - But somehow didn't break 2.2.0

4. **API Routes Modified** - `frontend/app/api/auth/login/route.ts`
   - Added logging (shouldn't break)
   - Timeout handling added
   - These changes broke the flow

### Why 2.2.0 Works

In MVP 2.2.0:
- NO caching layer
- Simpler auth flow
- Direct pass-through from frontend → BFF → Backend
- NO timeout complications
- Middleware rewrites don't matter because request is still processed

### Why 2.2.3+ Breaks

After 2.2.3:
- **Caching conflicts** with auth flow
- **Timeout handling** prevents proper response forwarding
- **Multiple redirects** from cache invalidation
- **SWR prefetching** may trigger unwanted requests

---

## Safe Implementation Plan

### ✅ SAFE TO DO (New Features)
- [x] Add Redis caching to non-auth endpoints
- [x] Add SWR to data pages (my-subscription, dashboard, etc.)
- [x] Add cache invalidation for CRUD operations
- [x] Add skeleton loaders

### 🔴 DO NOT TOUCH (Critical for Login)
- ❌ `frontend/app/api/auth/login/route.ts` - Keep simple, no timeouts
- ❌ `frontend/app/api/auth/me/route.ts` - Keep simple, no delays
- ❌ `frontend/lib/authService.ts` - Don't add caching to login() method
- ❌ `frontend/middleware.ts` - Keep disabled or very simple
- ❌ `frontend/app/login/page.tsx` - Keep form submission simple
- ❌ `frontend/app/student/login/page.tsx` - Keep simple
- ❌ Environment variable handling - Use strict `process.env.VAR!` pattern

### 🟡 USE WITH CAUTION
- ⚠️ `frontend/lib/authService.ts` - Cache only getCurrentUser(), NOT login()
- ⚠️ SWR on protected routes - Must skip if user not authenticated
- ⚠️ Cache invalidation - Must happen on logout, not on other events

---

## What We Know Works

From testing MVP 2.2.0:
```typescript
// LOGIN ROUTE - Keep simple, no caching
POST /api/auth/login
→ Call Express backend directly
→ Return token immediately
→ NO timeouts
→ NO caching

// ME ROUTE - Keep simple
GET /api/auth/me
→ Call Express backend directly
→ Return user or null
→ NO timeouts

// AUTH SERVICE - Only cache getCurrentUser
async login() → Direct call, NO cache
async getCurrentUser() → Can use cache with 5-10min TTL
```

---

## Recommended Next Steps

1. **Keep rollback to MVP 2.2.0 in production**
   - Login works perfectly
   - No complex caching
   - User experience is stable

2. **In development, work on:**
   - Create `frontend/lib/cache-config.ts`
   - Define which routes CAN be cached safely
   - Define which routes MUST NOT be cached

3. **Before adding new features:**
   - Create feature branch from 2.2.0
   - Add feature with clean implementation
   - Test login before merging

4. **Future Redis/SWR Implementation:**
   - Cache ONLY data endpoints (not auth)
   - Cache ONLY GET requests (not POST)
   - Cache ONLY authenticated endpoints
   - Implement cache invalidation properly

---

## Files Requiring Red Flags

### 🚩 DO NOT MODIFY
```
frontend/app/api/auth/login/route.ts
frontend/app/api/auth/me/route.ts
frontend/app/login/page.tsx
frontend/app/student/login/page.tsx
frontend/middleware.ts (keep disabled)
```

### 📝 SAFE TO ADD (New files only)
```
frontend/lib/cache-config.ts (new)
frontend/lib/redis-client.ts (new)
frontend/hooks/useAuthCache.ts (new)
frontend/components/SkeletonLoader.tsx (new)
```

### ✅ SAFE TO MODIFY (Non-auth endpoints)
```
frontend/app/api/subscriptions/* (add caching)
frontend/app/dashboard/* (add SWR)
frontend/app/student/my-tests/* (add caching)
```

---

## Summary

**What broke login:** 
- Caching in authService
- Timeout handling in auth routes
- Complex middleware logic

**What MVP 2.2.0 has right:**
- Simple, direct auth flow
- No caching on auth operations
- No timeouts or delays
- Middleware basically disabled

**Safe path forward:**
- Keep 2.2.0 as base
- Add features to NON-AUTH endpoints
- Never add complexity to auth critical path
