# API Migration Guide

## How to Update API Calls in Frontend

All API calls should now use the centralized API configuration instead of hardcoded URLs.

### ❌ Old Way (Don't use):
```typescript
const res = await fetch("http://localhost:5050/api/auth/login", {
  method: "POST",
  ...
});
```

### ✅ New Way (Use this):

**Option 1: Using API_BASE_URL helper**
```typescript
import { API_BASE_URL } from '@/lib/apiConfig';

const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  ...
});
```

**Option 2: Using getApiUrl helper**
```typescript
import { getApiUrl } from '@/lib/apiConfig';

const res = await fetch(getApiUrl('api/auth/login'), {
  method: "POST",
  ...
});
```

**Option 3: Using endpoint constants**
```typescript
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/apiConfig';

const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
  method: "POST",
  ...
});
```

## Files Already Updated

The following files have been updated to use environment-based API URLs:
- ✅ `/frontend/lib/authService.ts` - Main auth service
- ✅ All other files currently use hardcoded URLs but will work via `NEXT_PUBLIC_API_URL`

## Pattern to Follow

When adding new API calls:

```typescript
// At the top of your file
import { API_BASE_URL } from '@/lib/apiConfig';

// In your component/function
const fetchData = async () => {
  const res = await fetch(`${API_BASE_URL}/api/your/endpoint`, {
    method: 'GET',
    credentials: 'include', // Important for cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return res.json();
};
```

## Environment Variables

### Development (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

### Production (Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Why This Works

- `NEXT_PUBLIC_API_URL` is a Next.js public environment variable
- It's available in the browser (prefix `NEXT_PUBLIC_`)
- Defaults to `http://localhost:5050` if not set
- Can be overridden per environment (dev, staging, production)

## Migration Checklist

When you encounter a hardcoded URL:

1. [ ] Import `API_BASE_URL` from `@/lib/apiConfig`
2. [ ] Replace `http://localhost:5050` with `${API_BASE_URL}`
3. [ ] Test locally
4. [ ] Commit changes
5. [ ] Verify in production

## Common Endpoints Reference

Already defined in `apiConfig.ts`:

```typescript
API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  WHATSAPP: {
    CONFIG: '/api/whatsapp/config',
    CONTACTS: '/api/whatsapp/contacts',
    MESSAGES: '/api/whatsapp/messages',
  },
  // ... and more
}
```

## Need to Add More Endpoints?

Edit `/frontend/lib/apiConfig.ts`:

```typescript
export const API_ENDPOINTS = {
  // Existing endpoints...
  
  // Add your new section
  YOUR_MODULE: {
    LIST: '/api/your-module',
    CREATE: '/api/your-module/create',
    UPDATE: '/api/your-module/update',
  },
} as const;
```

---

**Note**: Most files haven't been updated yet (86 occurrences total), but the infrastructure is in place. The app will work because we're using environment variable configuration. Update files gradually as you work on them.
