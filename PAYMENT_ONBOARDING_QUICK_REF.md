# Payment → Onboarding Workflow - Quick Reference

## What Gets Built When User Completes Payment

```
Customer pays → Payment webhook fires → Sets paid_status = true
                                         ↓
                                         Customer redirected to:
                                         /onboarding/whitelabel?tenantId=X
                                         ↓
                                         [6-step wizard]
                                         ↓
                                         Redirected to:
                                         /tenant-login?subdomain=myschool
                                         ↓
                                         [Custom branded login]
                                         ↓
                                         Redirected to:
                                         /tenant-dashboard?subdomain=myschool
                                         ↓
                                         [Custom branded dashboard]
```

## Frontend Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/onboarding/whitelabel?tenantId=X` | 6-step setup wizard | Loads tenant data, saves branding |
| `/tenant-login?subdomain=myschool` | Custom branded login | Shows logo, institute name, theme color |
| `/tenant-dashboard?subdomain=myschool` | Custom branded dashboard | Shows stats with custom branding |

## BFF Routes (8 total)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/onboarding/save-branding` | Save all branding config to backend |
| GET | `/api/tenant/branding?tenantId=X` | Load branding by tenantId |
| GET | `/api/tenant/branding-by-subdomain?subdomain=X` | Load branding by subdomain (for public pages) |
| GET | `/api/tenant/subdomain-check?subdomain=X` | Check if subdomain available |
| POST | `/api/tenant/login` | Authenticate tenant user |
| GET | `/api/tenant/dashboard?subdomain=X` | Load dashboard stats |
| GET | `/api/tenant/check-onboarding?tenantId=X` | Check if needs onboarding |
| POST | `/api/upload/logo` | Upload logo file to S3 |

## 6-Step Onboarding Wizard

### Step 1: Institute Name
- **Input:** Text field
- **Validation:** Required
- **Prefilled:** From tenant data

### Step 2: Subdomain
- **Input:** Text field (auto-slugified)
- **Validation:** 3+ chars, alphanumeric + hyphens
- **Check:** Real-time availability check
- **Format:** `subdomain.enromatics.com`

### Step 3: Logo Upload
- **Input:** Drag-drop or click to upload
- **Format:** PNG/JPG up to 5MB
- **Upload:** To S3 via backend
- **Preview:** Shows after upload

### Step 4: Brand Color
- **Input:** Color picker
- **Display:** Hex code + preview box
- **Usage:** Used across all branded pages

### Step 5: WhatsApp (Optional)
- **Input:** Phone number
- **Format:** E.g., +91 98765 43210
- **Usage:** Creates WhatsApp support button

### Step 6: Review & Submit
- **Display:** All entered data
- **Show:** Logo preview
- **Show:** Subdomain
- **Show:** Color preview
- **Show:** WhatsApp number (if provided)

## Branded Pages

### Login Page (`/tenant-login`)
```
┌─────────────────────┐
│    [LOGO]           │
│   Institute Name    │
│ portal.school.com   │
├─────────────────────┤
│ Email: [______]     │
│ Password: [___]     │
│ [LOGIN] button      │
│ [WhatsApp Support]  │
└─────────────────────┘
```

### Dashboard Page (`/tenant-dashboard`)
```
┌─────────────────────────────────────┐
│ [LOGO] Institute  portal.school.com │
│                          Settings   │
│                          Logout     │
├─────────────────────────────────────┤
│ Welcome to Your Portal!             │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │Students│Courses│Active │ Revenue ││
│ │  250  │  12  │  180  │ ₹125K   ││
│ └──────┘ └──────┘ └──────┘ └──────┘│
├─────────────────────────────────────┤
│ Quick Actions:                      │
│ [Manage Students] [Manage Courses]  │
│ [View Analytics]                    │
├─────────────────────────────────────┤
│         [WhatsApp Support]          │
└─────────────────────────────────────┘
```

## Custom Branding Applied

Every page respects:
- **Logo:** Displayed in header
- **Institute Name:** Shown in headers and welcome messages
- **Subdomain:** Used in URLs and displayed
- **Theme Color:** Used for buttons, accents, backgrounds
- **WhatsApp:** Support button created if provided

## Payment Flow Integration

```
1. User in dashboard clicks "Upgrade Now"
   ↓
2. Navigates to /dashboard/client/[tenantId]/my-subscription
   ↓
3. Selects plan, pays via Cashfree
   ↓
4. Cashfree webhook fires → Sets paid_status = true
   ↓
5. Redirect to /payment/success?order_id=...
   ↓
6. Success page calls /api/tenant/check-onboarding
   ↓
7. If new paying customer → Redirect to /onboarding/whitelabel
   ↓
8. Complete 6-step wizard
   ↓
9. Click "Complete Setup"
   ↓
10. Redirect to /tenant-login
    ↓
11. Login with credentials
    ↓
12. See /tenant-dashboard with custom branding
```

## Key Files

**Frontend:**
- `/app/onboarding/whitelabel/page.tsx` - Main wizard
- `/app/tenant-login/page.tsx` - Branded login
- `/app/tenant-dashboard/page.tsx` - Branded dashboard
- `/app/api/onboarding/*` - Branding save routes
- `/app/api/tenant/*` - Tenant-specific routes
- `/app/api/upload/logo/route.ts` - Logo upload
- `/app/payment/success/page.tsx` - Updated with redirect logic

**Backend:**
- `controllers/paymentController.js` - Added paid_status flag

## Backend Endpoints Needed

These need to be implemented in Express backend:

1. `GET /api/tenants/:tenantId/check-onboarding` → `{ needsOnboarding }`
2. `GET /api/tenants/check-subdomain?subdomain=X` → `{ available }`
3. `POST /api/tenants/:tenantId/branding` → Save branding
4. `GET /api/tenants/by-subdomain/:subdomain` → Tenant + branding
5. `GET /api/tenants/by-subdomain/:subdomain/dashboard` → Analytics
6. `POST /api/tenants/authenticate` → Login, return token
7. `POST /api/upload/logo` → Upload to S3, return URL

## Status

✅ **Frontend:** Complete (MVP 2.4.2 - Commit 9f1af6c)
⏳ **Backend:** Pending implementation
⏳ **Testing:** Ready for manual E2E test

## Testing

To test the flow:
1. Sign up new trial tenant
2. Click "Upgrade Now" in topbar
3. Select a plan
4. Complete payment with Cashfree test card
5. Should automatically redirect to /onboarding/whitelabel
6. Fill 6-step form
7. Verify redirected to /tenant-login
8. Login and see /tenant-dashboard with branding applied

---

**Version:** v2.4.2  
**Released:** [Commit date]  
**Status:** Frontend ready, awaiting backend implementation
