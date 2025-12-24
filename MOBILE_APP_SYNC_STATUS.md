# Mobile App Sync Status - Dec 25, 2025

## Current Status

### ✅ What's Working:
- Mobile app exists in `EnromaticsMobile/` folder
- React Native app with navigation
- Pointing to correct Railway backend: `https://endearing-blessing-production-c61f.up.railway.app`
- White-label config system in place (`client-configs/clients.json`)
- Build script exists (`build-mobile-apk.sh`)
- Multiple APKs built for Utkarsh Education client

### ❌ Issues to Fix:

1. **Hardcoded API URLs** - Every screen has its own `const API_BASE_URL`
   - Found in 10+ screens
   - Should be centralized in one config file
   
2. **Not Using BFF Pattern**
   - Mobile app calls backend directly
   - Web app uses BFF (/api/auth/login), mobile uses direct `/mobile-auth/login`
   - No consistent authentication flow

3. **Missing Latest Features**
   - No tenant subdomain support
   - No revenue graph
   - Missing latest student/staff features from web

4. **Single Client Config**
   - Currently configured for "Utkarsh Education" only (tenantId: 0946d809)
   - Need multi-tenant support

5. **API Endpoint Mismatch**
   - Mobile uses: `/api/mobile-auth/login`
   - Web uses: `/api/auth/login` (via BFF)
   - Backend might have deprecated mobile endpoints

## Recommended Fixes:

### Priority 1: Centralize API Configuration
```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:5050/api' 
    : 'https://endearing-blessing-production-c61f.up.railway.app/api',
  TIMEOUT: 30000,
};
```

### Priority 2: Check Backend Mobile Endpoints
- Verify `/api/mobile-auth/login` still exists
- Check if it needs tenant-context header
- Update to use same auth flow as web

### Priority 3: Multi-Tenant Support
- Read tenantId from ClientConfig.json
- Send tenant-context header with all requests
- Support dynamic subdomain/tenant switching

### Priority 4: Sync Features with Web
- Add latest student dashboard features
- Add payment features
- Add attendance features
- Sync with current backend API structure

## Current Client Configuration:

**Utkarsh Education**
- App Name: Utkarsh Education
- Package: com.utkarsh.education
- Tenant ID: 0946d809
- Owner: Vivek Sahstrakar
- Colors: Green theme (#059669)

## Next Steps:

1. ✅ Document current state (this file)
2. ⏳ Create centralized API config
3. ⏳ Verify backend mobile endpoints
4. ⏳ Add Shree Coaching Classes config
5. ⏳ Build new white-label APK for prasamagar tenant
6. ⏳ Test authentication flow
7. ⏳ Sync features with web app

---

**Backend URL:** https://endearing-blessing-production-c61f.up.railway.app
**Frontend URL:** https://enromatics.vercel.app
**Mobile APK Location:** `/EnromaticsMobile/*.apk`
