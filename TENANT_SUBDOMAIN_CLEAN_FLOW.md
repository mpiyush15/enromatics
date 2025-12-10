# Tenant Subdomain Flow - Clean & Simple

## 🟡 FREE PLAN FLOW (14-day Trial)

```
User Signs Up
    ↓
Gets 14-day free trial (no subdomain)
    ↓
Uses main dashboard: enromatics.com/client/[tenantId]/dashboard
    ↓
Sees button: "Set Up My Institute (Activate Branding)"
    ↓
When clicked → Upgrade to Paid Plan
    ↓
(NO subdomain yet in free trial)
```

**Why?** Prevent spam + useless subdomains for inactive free users

**Free User Dashboard Features:**
- Access to all features for 14 days
- Can't activate white-label/branding
- Button to upgrade prominently shown
- Data stays isolated in main app

---

## 🟢 PAID PLAN FLOW (What We're Building)

```
User chooses PAID PLAN
    ↓
Payment successful
    ↓
Backend marks tenant as: paid_status = true
    ↓
[IMPORTANT] Redirect to: /onboarding/whitelabel
    ↓
Onboarding Wizard:
  - Step 1: Institute Name
  - Step 2: Logo Upload
  - Step 3: Theme Colors
  - Step 4: Confirm & Generate Subdomain
    ↓
Backend automatically:
  - Creates subdomain: slugified(instituteName).enromatics.com
  - Updates Tenant.subdomain field
  - Seeds branding data
  - Sets up DNS/SSL (handled by infrastructure)
    ↓
Redirect to: https://[subdomain].enromatics.com/login
    ↓
User lands on their BRANDED LOGIN PAGE
    ↓
Logs in with credentials
    ↓
Lands on their BRANDED DASHBOARD
    ↓
DONE ✅ (Never see enromatics.com again!)
```

---

## 📊 User Journey Comparison

| Stage | Free Plan | Paid Plan |
|-------|-----------|-----------|
| **URL** | enromatics.com/client/[id] | [subdomain].enromatics.com |
| **Branding** | None (Enromatics branding) | Full white-label |
| **Duration** | 14 days trial | Indefinite (while paid) |
| **Subdomain** | ❌ No | ✅ Yes |
| **Login Page** | Generic (Enromatics) | Branded (Institute colors/logo) |
| **Dashboard** | Generic (Enromatics) | Branded (Institute colors/logo) |
| **Data** | Isolated | Isolated |
| **Upgrade Button** | ✅ Visible | ❌ Hidden |

---

## 🔑 Key Implementation Points

### 1. When to Show Upgrade Button
```typescript
// On FREE dashboard
if (tenant.plan === 'trial' && tenant.paid_status !== true) {
  // Show "Set Up My Institute (Activate Branding)" button
  // Clicks → redirect to payment/upgrade flow
}
```

### 2. After Payment Success
```typescript
// Backend webhook handler
if (payment.status === 'success') {
  // 1. Update tenant: paid_status = true
  // 2. Update tenant: plan = 'basic' (or 'pro', 'enterprise')
  // 3. Redirect frontend to: /onboarding/whitelabel
  // 4. (Optional) Auto-provision subdomain OR wait for onboarding
}
```

### 3. Onboarding Wizard Flow
```
/onboarding/whitelabel
  ├─ Step 1: Institute Name
  │   └─ Input field, auto-generate slug preview
  ├─ Step 2: Logo Upload
  │   └─ Upload to S3, store URL in branding
  ├─ Step 3: Theme Color
  │   └─ Color picker, save to branding.themeColor
  ├─ Step 4: Review & Confirm
  │   └─ Shows preview with branding
  └─ On Complete:
      ├─ Backend creates subdomain
      ├─ Sets Tenant.subdomain = "slugified-name.enromatics.com"
      ├─ Saves branding (logo, colors, appName)
      └─ Redirects to: https://[subdomain].enromatics.com/login
```

### 4. After Onboarding → User Lands on Subdomain
```
https://myinstitute.enromatics.com/login
    ↓
Middleware detects subdomain: "myinstitute"
    ↓
Fetches tenant branding from backend
    ↓
Renders LOGIN PAGE with:
  - Institute logo
  - Institute colors
  - Institute name (appName)
    ↓
User logs in
    ↓
Redirects to: https://myinstitute.enromatics.com/dashboard
    ↓
BRANDED DASHBOARD with:
  - All their data
  - All their customization
  - Never sees "Enromatics" branding again
```

---

## 🎯 What This Means for Implementation

### Phase 1: Free Plan (Already Working)
- ✅ Users can sign up and access dashboard
- ✅ 14-day trial period
- ❌ No subdomain yet (will add upgrade button)
- Add: "Set Up My Institute" button on dashboard

### Phase 2: Payment Integration (Already Exists)
- ✅ Payment processing via Cashfree/Razorpay
- ✅ Webhook handling
- ❌ Need to redirect to /onboarding/whitelabel after payment

### Phase 3: Onboarding Wizard (NEW - Build This)
- ❌ Create /onboarding/whitelabel page
- ❌ 4-step wizard for branding setup
- ❌ Logo upload to S3
- ❌ Auto-generate subdomain slug
- ❌ Backend endpoint to save branding + create subdomain

### Phase 4: Subdomain Login & Dashboard (NEW - Build This)
- ❌ /tenant-login page (shows tenant branding)
- ❌ /tenant-dashboard page (shows tenant data with branding)
- ❌ BFF routes to handle subdomain auth + data

---

## 🔐 Data Model Changes Needed

### Tenant Schema (Express Backend)
```javascript
{
  tenantId: String,
  name: String,
  instituteName: String,
  
  // Subscription
  plan: 'trial' | 'basic' | 'pro' | 'enterprise',
  paid_status: Boolean, // true = paid, false = trial/free
  subscription: {
    status: 'active' | 'expired' | 'cancelled',
    expiryDate: Date,
    nextBillingDate: Date
  },
  
  // White-label / Subdomain (ONLY for paid users)
  subdomain: String, // e.g., "myinstitute.enromatics.com"
  branding: {
    appName: String,      // "My Institute" 
    logoUrl: String,      // "https://s3.../logo.png"
    themeColor: String,   // "#2F6CE5"
  },
  
  // Onboarding
  onboarding_complete: Boolean, // true after branding setup
  onboarding_step: Number // 1-4 for progress
}
```

---

## 📝 Implementation Checklist

### Backend (Express.js)
- [ ] Add `paid_status` field to Tenant model
- [ ] Add `onboarding_complete` field to Tenant model
- [ ] Create `POST /api/onboarding/save-branding` endpoint
- [ ] Create `GET /api/tenants/by-subdomain/:subdomain` endpoint (already in workflow)
- [ ] Update payment webhook to set `paid_status = true`
- [ ] Update payment webhook to redirect to `/onboarding/whitelabel`
- [ ] Auto-generate subdomain slug in branding save endpoint

### Frontend (Next.js)
- [ ] Create `/onboarding/whitelabel` page (4-step wizard)
- [ ] Create `/tenant-login` page (subdomain-specific)
- [ ] Create `/tenant-dashboard` page (subdomain-specific)
- [ ] Add BFF route: `GET /api/tenant-subdomain` (fetch branding)
- [ ] Add BFF route: `POST /api/tenant-login` (authenticate)
- [ ] Add BFF route: `GET /api/tenant-dashboard` (fetch data)
- [ ] Add BFF route: `POST /api/onboarding/save-branding` (save branding)
- [ ] Add "Set Up My Institute" button to free dashboard

### Middleware (Already Done - Just Verify)
- [x] Subdomain detection in `middleware.ts`
- [x] Route to `/tenant-login` on subdomain visit
- [x] Set `tenant-context` cookie

---

## 🎬 User Experience Timeline

### Day 1 - Free User Signs Up
```
User: enromatics.com/signup
  ↓
Chooses "Free Trial (14 days)"
  ↓
Account created → Redirects to /client/[id]/dashboard
  ↓
Sees: Dashboard with "Set Up My Institute" button
```

### Day 5 - User Wants White-Label
```
User: Clicks "Set Up My Institute"
  ↓
Sees: Payment page ($5/month)
  ↓
Clicks: "Go Pro"
  ↓
Redirects: Razorpay checkout
  ↓
Pays $5
  ↓
Webhook: Backend marks tenant.paid_status = true
  ↓
Redirects: /onboarding/whitelabel
  ↓
User: Completes 4-step wizard
  ↓
Backend: Creates subdomain "mycompany.enromatics.com"
  ↓
Redirects: https://mycompany.enromatics.com/login
  ↓
User: Logs in on their branded login page
  ↓
Lands: On their branded dashboard
  ↓
DONE ✅
```

---

## 🎨 Design Consideration

### Free Dashboard (enromatics.com)
- Generic Enromatics branding
- "Set Up My Institute" button (premium feature)
- Simple, clean interface

### Paid Dashboard (subdomain.enromatics.com)
- Full white-label with institute branding
- Logo in header
- Custom theme colors
- Custom app name everywhere
- User never sees "Enromatics" after login

---

## ✨ Summary: What We're Building

1. **Onboarding Wizard** - Let paid users set up their branding
2. **Subdomain Auto-Generation** - Create `institutename.enromatics.com`
3. **Branded Login** - Show institution logo/colors on login page
4. **Branded Dashboard** - Show institution logo/colors in dashboard
5. **Data Isolation** - Each subdomain only sees their tenant's data

**Key Difference from Current:**
- ❌ Current: Everyone uses enromatics.com dashboard (no branding)
- ✅ New: Paid users get their own subdomain with full branding

---

## 🚀 Ready to Code?

**Next Step:** Confirm you want me to build in this order:
1. ✅ Phase 3: Onboarding Wizard (`/onboarding/whitelabel`)
2. ✅ Phase 4: Subdomain Login & Dashboard (`/tenant-login`, `/tenant-dashboard`)

Should I start? 🎯
