# 📋 Dashboard Pages & Their Endpoints

## Reference for SWR Implementation

When updating each dashboard page, use the corresponding API endpoint:

---

## Dashboard Pages & Endpoints

### 1. Home/Overview Page
```typescript
// File: /app/dashboard/home/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/analytics/dashboard'  // ✅ Already implemented
);
```

### 2. Payments Page
```typescript
// File: /app/dashboard/payments/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/payments'  // Check backend for exact route
);
// Possible variations:
// '/api/payments/list'
// '/api/admin/payments'
```

### 3. Subscribers Page
```typescript
// File: /app/dashboard/subscribers/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/subscriptions'  // Or check what's available
);
// Possible variations:
// '/api/subscriptions/list'
// '/api/subscribers'
```

### 4. Students Page
```typescript
// File: /app/dashboard/students/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/students'
);
// Possible variations:
// '/api/students/list'
// '/api/admin/students'
```

### 5. Staff Page
```typescript
// File: /app/dashboard/staff/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/staff'
);
// Possible variations:
// '/api/staff/list'
// '/api/admin/staff'
```

### 6. Batches Page
```typescript
// File: /app/dashboard/batches/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/batches'
);
// From previous grep: We know batches route exists and has Redis!
```

### 7. Subscription Page
```typescript
// File: /app/dashboard/subscription/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/my-subscription'  // Or check exact route
);
// This might be user's own subscription, not all subscriptions
```

### 8. Profile Page
```typescript
// File: /app/dashboard/profile/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/auth/me'  // User's own profile
);
// OR if it needs more data:
// '/api/profile'
```

### 9. Settings Page
```typescript
// File: /app/dashboard/settings/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/settings'
);
// Might be user settings or org settings
```

### 10. Invoices Page
```typescript
// File: /app/dashboard/invoices/page.tsx
const { data, isLoading, error, mutate } = useDashboardData(
  '/api/invoices'
);
// Possible variations:
// '/api/invoices/list'
// '/api/billing/invoices'
```

---

## How to Find the Right Endpoint

### Method 1: Check Current Page Code
If the page already has a fetch call, look for the URL:

```typescript
// Look for pattern:
const response = await fetch(`${apiUrl}/api/...`, {
  // Use this path!
});
```

### Method 2: Check Network Tab
1. Open DevTools → Network tab
2. Go to the dashboard page
3. Look for API calls
4. See what URL it's calling
5. Use that URL in useDashboardData()

### Method 3: Search for Endpoint in Code
```bash
# In terminal, search for the page's endpoint:
grep -r "payments" frontend/app/api/
grep -r "students" frontend/app/api/
grep -r "staff" frontend/app/api/
```

---

## Common Endpoint Patterns

### BFF Routes (Frontend API Routes)
```
/api/analytics/dashboard     (✅ known)
/api/batches                 (✅ known to exist)
/api/payments                (likely exists)
/api/subscriptions           (likely exists)
/api/students                (likely exists)
/api/staff                    (likely exists)
```

### Backend Routes (Express)
```
Backend base: https://endearing-blessing-production-c61f.up.railway.app

Express endpoints probably include:
/api/admin/payments
/api/admin/students
/api/admin/staff
/api/admin/batches
/api/admin/subscriptions
```

---

## Priority Order for Updates

### Highest Impact (Most Used)
1. Payments page (revenue critical)
2. Students page (core data)
3. Batches page (core data)

### Medium Impact
4. Subscribers page
5. Staff page
6. Overview/analytics

### Lower Priority
7. Settings
8. Profile
9. Invoices
10. Subscription (single user)

---

## Testing Each Page

For each page you update:

```bash
1. Update the page with useDashboardData
2. npm run dev
3. Go to http://localhost:3000/login
4. Login with: piyushmagar4p@gmail.com / 22442232
5. Navigate to the updated page
6. ✅ Check data loads
7. ✅ Check refresh button works
8. ✅ Check browser console clean
9. Go to different page and back
10. ✅ Check cache works (instant load)
11. Logout and login again
12. ✅ Check data still accessible
```

---

## If Endpoint Not Working

**Symptoms:**
- Page shows "Error loading data"
- Network tab shows 404 or 500 error

**Solutions:**
1. Check correct endpoint path in current page code
2. Check Network tab in DevTools for actual request
3. Check if backend route exists
4. Check if BFF route in /app/api/ exists
5. Ask: "Which endpoint does this page currently use?"

**Example Debug:**
```typescript
// If current page has:
const response = await fetch(`${apiUrl}/api/admin/payments`)

// Use in SWR:
const { data } = useDashboardData('/api/admin/payments')

// Check Network tab to confirm path
```

---

## Endpoints to Avoid (Auth)

These should NOT be used with SWR:

```
❌ /api/auth/login          (POST, not GET)
❌ /api/auth/logout         (POST, not GET)
❌ /api/auth/me             (Handled by auth hook)
❌ /api/auth/register       (POST, not GET)
```

---

## Summary Table

| Page | Endpoint | Status | Notes |
|------|----------|--------|-------|
| Home | `/api/analytics/dashboard` | ✅ Done | Already implemented |
| Payments | `/api/payments` | ⏳ TODO | TBD |
| Subscribers | `/api/subscriptions` | ⏳ TODO | Check backend |
| Students | `/api/students` | ⏳ TODO | Core page |
| Staff | `/api/staff` | ⏳ TODO | Core page |
| Batches | `/api/batches` | ⏳ TODO | Has Redis |
| Subscription | `/api/my-subscription` | ⏳ TODO | User's subscription |
| Profile | `/api/profile` or `/api/auth/me` | ⏳ TODO | User profile |
| Settings | `/api/settings` | ⏳ TODO | Check backend |
| Invoices | `/api/invoices` | ⏳ TODO | Billing page |

---

## Quick Copy-Paste Template

For each page update:

```typescript
'use client';

import { useDashboardData } from '@/hooks/useDashboardData';

interface PageData {
  // Define your data shape based on what API returns
}

export default function PageName() {
  const { data, isLoading, error, mutate } = useDashboardData<PageData>(
    '/api/ENDPOINT_HERE'  // ← Replace with actual endpoint
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState onRetry={() => mutate()} />;
  if (!data) return <EmptyState />;

  return (
    <div>
      {/* Render your page with data */}
    </div>
  );
}
```

---

## Need More Info?

Check these files:
- **SWR_IMPLEMENTATION_GUIDE.md** - How SWR works
- **CODE_CHANGES_SUMMARY.md** - Exact code changes
- **LOGIN_TEST_CHECKLIST.md** - Testing procedure
- **QUICK_REFERENCE.md** - Quick tips

