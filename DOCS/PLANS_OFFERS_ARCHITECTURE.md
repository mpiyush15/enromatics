# Plans & Offers Architecture - New System Design

## 🎯 Overall Vision

Create a **unified pricing & promotion management system** where:
1. **Plans** (Starter, Pro, Enterprise) are managed by SuperAdmin with editable prices, visibility, and features
2. **Offers** are separate, can be created/applied across ANY plan(s) system-wide
3. Both **Plans & Offers appear as cards** on public `/plans` page
4. SuperAdmin controls everything from one **Plans Management** page

---

## 📋 Current vs New Architecture

### CURRENT (What users see on /plans page):
```
┌─────────────────────────────────────────┐
│  SUBSCRIPTION PLANS PAGE (/plans)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐ ┌──────────────────┐ │
│  │   STARTER    │ │      PRO (★)     │ │
│  │  ₹999/mo     │ │   ₹2999/mo       │ │
│  │  100 Students│ │   Unlimited      │ │
│  │  5 Staff     │ │   Unlimited      │ │
│  │  Features: □ │ │   Features: ■    │ │
│  └──────────────┘ └──────────────────┘ │
│                                         │
│  ┌──────────────────┐                  │
│  │   ENTERPRISE     │                  │
│  │   Custom Price   │                  │
│  │   Custom Limits  │                  │
│  │   All Features   │                  │
│  └──────────────────┘                  │
│                                         │
└─────────────────────────────────────────┘
```

### NEW (What we're building):
```
┌──────────────────────────────────────────┐
│  SUBSCRIPTION PLANS PAGE (/plans)        │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐ ┌──────────────────┐  │
│  │   STARTER    │ │      PRO (★)     │  │
│  │  ₹999/mo     │ │   ₹2999/mo       │  │
│  │  100 Students│ │   Unlimited      │  │
│  │  5 Staff     │ │   Unlimited      │  │
│  │  ✓ Feature A │ │   ✓ Feature A    │  │
│  │  ✓ Feature B │ │   ✓ Feature B    │  │
│  │  ✗ Feature C │ │   ✓ Feature C    │  │
│  └──────────────┘ └──────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  🎁 LIMITED TIME OFFER             │  │
│  │  "30% OFF on PRO"                  │  │
│  │  Valid until: Dec 31, 2025         │  │
│  │  [Applied to: PRO, ENTERPRISE]     │  │
│  │  New Price: ₹2099/mo               │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🛠️ What SuperAdmin Controls

### A. Plans Management Page (`/dashboard/superadmin/plans`)
**Shows 3 cards: Starter, Pro, Enterprise**

Each card can edit:
1. **Pricing** (Monthly & Annual) ✅ Already built
   - Starter: ₹999 → ₹1099 (editable)
   - Pro: ₹2999 → ₹3499 (editable)
   - Enterprise: Custom → Custom (editable)

2. **Features** (NEW - to be built)
   - Starter: ✓ Feature A, ✓ Feature B, ✗ Feature C
   - Pro: ✓ Feature A, ✓ Feature B, ✓ Feature C
   - Enterprise: ✓ All Features
   - Can toggle each feature on/off per plan

3. **Visibility Toggle** ✅ Already built
   - Show/Hide each plan from public `/plans` page

4. **Quotas** (Read-only for now)
   - Students: 100 → Unlimited
   - Staff: 5 → Unlimited
   - Storage: Standard → Advanced

### B. Offers Management Page (`/dashboard/admin/offers` → SuperAdmin can access)
**Create promotional offers that apply across plans**

Each offer has:
1. **Offer Details**
   - Name: "30% OFF"
   - Description: "Limited time offer on Pro plan"
   - Discount Type: Percentage (30%) OR Fixed (₹500 off)
   - Valid Dates: Dec 26 - Dec 31, 2025

2. **Applied To Plans**
   - ☐ Starter
   - ☑ Pro
   - ☑ Enterprise
   - (Can select which plans get this offer)

3. **Result**
   - Pro: ₹2999 → ₹2099 (with 30% discount)
   - Enterprise: ₹Custom → ₹Custom-30% (with 30% discount)

---

## 📊 Data Flow

### When SuperAdmin Updates Plan Price:
```
SuperAdmin Page
    ↓
[Edit: Pro from ₹2999 → ₹3499]
    ↓
PATCH /api/subscription-plans/pro-plan-id
    ↓
Database Updated
    ↓
Public /plans Page
    ↓
Shows NEW Price: ₹3499/mo
```

### When SuperAdmin Creates an Offer:
```
SuperAdmin Page
    ↓
[Create Offer: 30% OFF PRO PLAN]
    ↓
POST /api/offers
    ↓
Database: Offer Created
    ↓
POST /api/offers/apply (applies to PRO)
    ↓
Public /plans Page
    ↓
Shows Card with Badge: "🎁 30% OFF - ₹2099/mo"
```

### When User Views /plans Page:
```
GET /api/subscription-plans
    ↓
Returns: All plans with current pricing
    ↓
GET /api/offers
    ↓
Returns: All active offers (date-based)
    ↓
Frontend Renders:
    ├─ Plan Cards (with features checklist)
    ├─ Offer Cards (if any active)
    └─ Calculate Final Price: Original - Offer Discount
```

---

## 🗄️ Database Schema Changes Needed

### SubscriptionPlan (Update)
```javascript
{
  _id: ObjectId,
  id: "pro",
  name: "Pro",
  description: "For growing schools",
  
  // Pricing (EDITABLE)
  monthlyPrice: 2999,
  annualPrice: 35988,
  
  // Features (NEW - EDITABLE)
  features: [
    { name: "Students", enabled: true, limit: "Unlimited" },
    { name: "Staff", enabled: true, limit: "Unlimited" },
    { name: "Online Tests", enabled: true },
    { name: "Test Analytics", enabled: true },
    { name: "Video Classes", enabled: false },
    { name: "Advanced Reports", enabled: false },
  ],
  
  // Quotas (Read-only)
  quotas: {
    students: "Unlimited",
    staff: "Unlimited",
    storage: "100GB",
  },
  
  // Visibility (EDITABLE)
  isVisible: true,
  popular: true,
  
  status: "active",
  createdAt: Date,
  updatedAt: Date,
}
```

### Offer (New Collection)
```javascript
{
  _id: ObjectId,
  name: "30% OFF Pro Plan",
  description: "Limited time promotional offer",
  
  // Offer Details
  discountType: "percentage", // or "fixed"
  discountValue: 30, // 30% or ₹500
  validFrom: Date,
  validTo: Date,
  
  // Applied to which plans
  applicablePlans: ["pro-id", "enterprise-id"],
  
  // Metadata
  status: "active",
  priority: 1, // Higher = shown first on card
  badgeText: "🎁 LIMITED TIME",
  createdBy: "superadmin-id",
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🎨 Frontend Components

### 1. Plans Management Page
**Location**: `/frontend/app/dashboard/superadmin/plans/page.tsx`

**Components**:
```
PlansManagement
├─ Header: "💰 Plans Management"
├─ Plans Grid (3 columns)
│  ├─ PlanCard
│  │  ├─ Plan Name & Description
│  │  ├─ Price Editor (Monthly/Annual) ✅ Done
│  │  ├─ Features Checklist (NEW)
│  │  │  ├─ Checkbox: Online Tests
│  │  │  ├─ Checkbox: Test Analytics
│  │  │  ├─ Checkbox: Video Classes
│  │  │  └─ Checkbox: Advanced Reports
│  │  ├─ Visibility Toggle ✅ Done
│  │  └─ Save Button
│  ├─ PlanCard (Pro)
│  └─ PlanCard (Enterprise)
└─ Info Box: "Features, offers, and quotas can be managed here"
```

### 2. Offers Management Page
**Location**: `/frontend/app/dashboard/admin/offers/page.tsx`

**Exists** but needs to show offer creation that applies across plans

```
OffersManagement
├─ Header: "🎁 Offers & Promotions"
├─ Active Offers List
│  ├─ OfferCard
│  │  ├─ Offer Name: "30% OFF"
│  │  ├─ Applied to: [Pro, Enterprise]
│  │  ├─ Valid: Dec 26 - Dec 31
│  │  ├─ Status Badge
│  │  └─ Edit/Delete Buttons
└─ Create New Offer Button
   └─ OfferForm
      ├─ Name & Description
      ├─ Discount Type (Percentage/Fixed)
      ├─ Discount Value
      ├─ Valid Dates (From/To)
      ├─ Select Plans (Checkboxes: Starter/Pro/Enterprise)
      └─ Create Button
```

---

## 🔌 API Endpoints Needed

### Plans Management
```
✅ GET /api/subscription-plans
   Response: [{ _id, name, monthlyPrice, annualPrice, features, isVisible, ... }]

✅ PATCH /api/subscription-plans/:id
   Body: { monthlyPrice, annualPrice }
   Response: { success, plan }

⏳ PATCH /api/subscription-plans/:id
   Body: { features: [{ name: "Online Tests", enabled: true }, ...] }
   Response: { success, plan }

✅ PATCH /api/subscription-plans/:id
   Body: { isVisible: true/false }
   Response: { success, plan }
```

### Offers Management
```
⏳ GET /api/offers
   Response: [{ _id, name, discountType, discountValue, applicablePlans, validFrom, validTo, ... }]

⏳ POST /api/offers
   Body: { name, description, discountType, discountValue, validFrom, validTo, applicablePlans: [planIds] }
   Response: { success, offer }

⏳ PATCH /api/offers/:id
   Body: { ... any updates ... }
   Response: { success, offer }

⏳ DELETE /api/offers/:id
   Response: { success, message }
```

---

## 📅 Implementation Phases

### Phase 1: ✅ DONE
- [x] Plans Management page created (cost updates only)
- [x] Fetch plans from API
- [x] Edit monthly/annual pricing
- [x] Toggle visibility
- [x] Sidebar unified under "Plans & Offers"

### Phase 2: 🔄 NEXT (Features)
- [ ] Add features checklist to each plan card
- [ ] PATCH endpoint to update plan features
- [ ] Save features with checkboxes

### Phase 3: 📌 OFFERS (Promotions)
- [ ] Create Offer form
- [ ] Multi-select plan checkboxes
- [ ] POST /api/offers endpoint
- [ ] Display offers on public /plans page
- [ ] Calculate discounted prices

### Phase 4: 🎨 POLISH
- [ ] Show offer badges on plan cards
- [ ] Date-based offer filtering
- [ ] Offer priority/ordering
- [ ] Admin offer management (edit/delete)

---

## ✨ What User Sees

### On Public `/plans` Page:
```
STARTER - ₹999/mo
✓ 100 Students
✓ 5 Staff  
✓ Online Tests
✓ Test Analytics
✗ Video Classes
[Get Started Button]

PRO - ₹2999/mo  (30% OFF → ₹2099/mo) 🎁
✓ Unlimited Students
✓ Unlimited Staff
✓ Online Tests
✓ Test Analytics
✓ Video Classes
✗ Advanced Reports
[Get Started Button]

ENTERPRISE - Custom Pricing
✓ Everything Included
[Contact Sales Button]

---

LIMITED TIME OFFER
30% OFF on Pro Plan
Valid until: Dec 31, 2025
```

### In SuperAdmin Dashboard:
```
STARTER CARD:
Price: ₹999/mo | ₹11988/year
Features: ✓✓✗✗ (toggle each)
Visibility: [Eye Icon - Show/Hide]
[Save Changes]

PRO CARD:
Price: ₹2999/mo | ₹35988/year
Features: ✓✓✓✗ (toggle each)
Visibility: [Eye Icon - Show/Hide]
[Save Changes]

ENTERPRISE CARD:
Price: Custom | Custom
Features: ✓✓✓✓ (all enabled)
Visibility: [Eye Icon - Show/Hide]
[Save Changes]
```

---

## 🎯 Key Benefits

1. **Centralized Management** - All plans & pricing in one SuperAdmin page
2. **Feature Control** - Toggle features per plan without affecting other plans
3. **Flexible Offers** - Create promotional offers applicable to any combination of plans
4. **Dynamic Pricing** - Offers automatically calculate and display final prices
5. **Date-Based** - Offers can be time-limited and auto-expire
6. **Visibility Control** - Hide/show plans from public page on demand

---

## 📝 Summary

**What we're building:**
- Plans (Starter/Pro/Enterprise) with editable prices, features, and visibility
- Offers (promotions) that apply across plans with flexible discounts
- Everything managed by SuperAdmin in one interface
- Public `/plans` page displays both plans and active offers dynamically

**Getting you, bro?** 🙌
