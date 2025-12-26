# 🎨 Plans & Offers - Simple Visual Guide

## The Concept in Images

### What Customers See (Public `/plans` Page)

```
═══════════════════════════════════════════════════════════════════════════
                   CHOOSE YOUR PERFECT PLAN
═══════════════════════════════════════════════════════════════════════════

┌────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐
│   STARTER PLAN     │  │      PRO PLAN ★         │  │  ENTERPRISE PLAN     │
├────────────────────┤  ├─────────────────────────┤  ├──────────────────────┤
│                    │  │  🎁 DIWALI SPECIAL      │  │                      │
│    ₹999/month      │  │   (25% OFF)             │  │  Custom Pricing      │
│                    │  │  Was: ₹2999/month       │  │                      │
│  ₹11,988/year      │  │  Now: ₹2249/month       │  │  ₹Custom/year        │
│                    │  │                         │  │                      │
│ Features:         │  │  Features:             │  │  Everything:        │
│ ✓ Online Tests    │  │  ✓ Online Tests        │  │  ✓ All Features     │
│ ✓ Test Analytics  │  │  ✓ Test Analytics      │  │  ✓ Priority Support │
│ ✗ Video Classes   │  │  ✓ Video Classes       │  │  ✓ Custom Solutions │
│ ✗ Adv. Reports    │  │  ✗ Adv. Reports        │  │                      │
│                    │  │  Valid until: Dec 31   │  │                      │
│  Best for:        │  │                         │  │  Best for:          │
│  Small Schools    │  │  ★ MOST POPULAR ★      │  │  Large Institutions │
│                    │  │  Growing Institutions   │  │                      │
│ [Get Started]     │  │ [Get Started]           │  │ [Contact Sales]     │
└────────────────────┘  └─────────────────────────┘  └──────────────────────┘


Available Offers:
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎁 YEAR END SALE: ₹500 OFF on ANY plan!                               │
│    Valid: Dec 26 - Jan 5, 2026                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### What SuperAdmin Controls (Admin Dashboard)

```
SUPERADMIN PANEL: Plans & Offers Management

══════════════════════════════════════════════════════════════════════════

📋 Plans Management (/dashboard/superadmin/plans)

┌────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐
│   STARTER PLAN     │  │      PRO PLAN           │  │  ENTERPRISE PLAN     │
├────────────────────┤  ├─────────────────────────┤  ├──────────────────────┤
│                    │  │                         │  │                      │
│ PRICING:          │  │ PRICING:               │  │ PRICING:            │
│ Monthly: [999   ]  │  │ Monthly: [2999  ]       │  │ Monthly: [Custom  ] │
│ Annual:  [11988 ]  │  │ Annual:  [35988 ]       │  │ Annual:  [Custom  ] │
│ [Save Pricing]    │  │ [Save Pricing]          │  │ [Save Pricing]      │
│                    │  │                         │  │                      │
│ FEATURES:         │  │ FEATURES:              │  │ FEATURES:           │
│ ☑ Online Tests    │  │ ☑ Online Tests         │  │ ☑ Online Tests      │
│ ☑ Test Analytics  │  │ ☑ Test Analytics       │  │ ☑ Test Analytics    │
│ ☐ Video Classes   │  │ ☑ Video Classes        │  │ ☑ Video Classes     │
│ ☐ Adv. Reports    │  │ ☐ Adv. Reports         │  │ ☑ Adv. Reports      │
│ [Save Features]   │  │ [Save Features]         │  │ [Save Features]     │
│                    │  │                         │  │                      │
│ VISIBILITY:       │  │ VISIBILITY:            │  │ VISIBILITY:         │
│ [👁️ Show] [Hide]   │  │ [👁️ Show] [Hide]        │  │ [👁️ Show] [Hide]    │
│ [Save]            │  │ [Save]                  │  │ [Save]              │
└────────────────────┘  └─────────────────────────┘  └──────────────────────┘

══════════════════════════════════════════════════════════════════════════

🎁 Offers Management (/dashboard/admin/offers)

Active Offers:
┌─────────────────────────────────────────────────────────────────────────┐
│ Offer #1: "Diwali Special"                              [Edit] [Delete] │
│ ├─ Discount: 25% OFF                                                    │
│ ├─ Applied to: Pro, Enterprise                                          │
│ ├─ Valid: Dec 26 - Dec 31, 2025                                         │
│ └─ Status: 🟢 ACTIVE                                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Offer #2: "Year End Sale"                               [Edit] [Delete] │
│ ├─ Discount: ₹500 OFF                                                   │
│ ├─ Applied to: Starter, Pro, Enterprise                                 │
│ ├─ Valid: Dec 26 - Jan 5, 2026                                          │
│ └─ Status: 🟢 ACTIVE                                                    │
└─────────────────────────────────────────────────────────────────────────┘

[+ Create New Offer]

Create New Offer Form:
┌─────────────────────────────────────────────────────────────────────────┐
│ Name: [Black Friday Sale]                                               │
│ Description: [50% OFF all plans for 3 days only]                        │
│                                                                           │
│ Discount Type:                                                           │
│ ○ Percentage: [50]% OFF                                                 │
│ ○ Fixed Amount: ₹[500] OFF                                              │
│                                                                           │
│ Valid From: [Dec 26, 2025]                                              │
│ Valid To:   [Dec 31, 2025]                                              │
│                                                                           │
│ Apply This Offer To:                                                    │
│ ☐ Starter Plan                                                           │
│ ☑ Pro Plan                                                               │
│ ☑ Enterprise Plan                                                        │
│                                                                           │
│ Badge Text: [🎁 BLACK FRIDAY]                                           │
│                                                                           │
│ [Create Offer]  [Cancel]                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
                    ┌─────────────────────────────┐
                    │   SUPERADMIN DASHBOARD      │
                    │  Plans & Offers Management  │
                    └──────────────┬──────────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
        ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Update Price   │ │Update Feature│ │Create Offer  │
        │  ₹999 → ₹1099   │ │  Toggle On/Off
        │                 │ │                │ │ 25% OFF on   │
        └────────┬────────┘ └───────┬────────┘ │ Pro & Ent.   │
                 │                  │          └──────┬───────┘
                 │                  │                 │
     ┌───────────▼──────────┬───────▼────────┐       │
     │                      │                │       │
     │  PATCH /api/         │ PATCH /api/    │ POST /│
     │  subscription-plans  │ subscription-  │ api/offers
     │  {monthlyPrice}      │  plans         │ {discount
     │                      │  {features}    │  Value,dates
     │                      │                │  plans}
     └───────────┬──────────┴────────┬───────┴───────┬
                 │                  │               │
                 ▼                  ▼               ▼
        ┌────────────────────────────────────────────────┐
        │         MONGODB DATABASE                       │
        │                                                │
        │ Collections:                                   │
        │ ├─ SubscriptionPlans                           │
        │ │  ├─ Starter {monthlyPrice: 1099}            │
        │ │  ├─ Pro {features: [✓✓✓✗]}                  │
        │ │  └─ Enterprise                               │
        │ │                                              │
        │ └─ Offers                                      │
        │    ├─ "Diwali Special" {discount: 25%}        │
        │    └─ "Year End" {discount: 500}              │
        └────────────────┬──────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │ GET /api/           │
              │ subscription-plans  │
              │ +                   │
              │ GET /api/offers     │
              └──────────┬──────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  PUBLIC /PLANS PAGE            │
        │  (What Customers See)          │
        │                                │
        │ ┌──────────────────────────┐   │
        │ │ Pro: ₹2999/mo            │   │
        │ │ 🎁 25% OFF: ₹2249/mo     │   │
        │ │ ✓ Feature A, B, C        │   │
        │ │ [Get Started]            │   │
        │ └──────────────────────────┘   │
        │                                │
        │ ┌──────────────────────────┐   │
        │ │ 🎁 Year End: ₹500 OFF    │   │
        │ │ All Plans                │   │
        │ │ Valid until Dec 31       │   │
        │ └──────────────────────────┘   │
        └────────────────────────────────┘
```

---

## 💰 Price Calculation Example

```
BASE PLAN PRICE (from database):
Pro: ₹2,999/month

ACTIVE OFFERS (today):
┌─────────────────────────────────┐
│ Offer 1: 25% OFF (Diwali)       │
│ Applied to: Pro, Enterprise     │
│ Calculation: 2999 × 25% = 749.75│
│ Result: 2999 - 749.75 = 2249.25 │
│                                 │
│ Offer 2: ₹500 OFF (Year End)    │
│ Applied to: All Plans           │
│ Calculation: 2999 - 500 = 2499  │
└─────────────────────────────────┘

WHICH OFFER TO USE?
→ Pick the BEST discount for customer
→ Offer 1 saves ₹749 (better!)
→ Use Offer 1

FINAL PRICE ON PUBLIC PAGE:
┌──────────────────────────────┐
│ Pro Plan                     │
│ Original: ₹2,999/month       │
│ 🎁 WITH OFFER: ₹2,249/month  │
│ You Save: ₹750!              │
│ Valid until: Dec 31, 2025    │
│ [Get Started]                │
└──────────────────────────────┘
```

---

## 🎯 The Flow (Step by Step)

### Step 1: SuperAdmin Updates Plan
```
1. Opens: /dashboard/superadmin/plans
2. Sees: 3 plan cards (Starter, Pro, Enterprise)
3. Clicks: Pro card → Edit price
4. Changes: ₹2999 → ₹3499
5. Clicks: [Save Pricing]
6. Result: Saved to database
```

### Step 2: Public Page Updates
```
7. Public /plans page fetches plans
8. Gets new price: ₹3499
9. Displays to customers
10. Customers see updated price immediately
```

### Step 3: SuperAdmin Creates Offer
```
11. Opens: /dashboard/admin/offers
12. Clicks: [+ Create New Offer]
13. Fills: 30% OFF, Valid Dec 26-31, Apply to Pro & Enterprise
14. Clicks: [Create Offer]
15. Result: Offer saved to database
```

### Step 4: Public Page Shows Offer
```
16. Public /plans page fetches offers
17. Matches: 30% offer applies to Pro
18. Calculates: 3499 × 30% = 1049.70 discount
19. Shows: Pro was ₹3499 → NOW ₹2449 with 30% OFF! 🎁
20. Customers see: Discount badge + new price
```

---

## ✨ Key Points (Remember!)

| Feature | Who Controls | How | When Updated |
|---------|-------------|-----|-------------|
| **Plan Price** | SuperAdmin | Edit + Save in dashboard | Instantly |
| **Plan Features** | SuperAdmin | Toggle checkboxes in dashboard | Instantly |
| **Plan Visibility** | SuperAdmin | Eye toggle in dashboard | Instantly |
| **Offers** | SuperAdmin | Create in offers page | Instantly |
| **Discounts** | Automatic | Based on valid dates | Real-time |
| **Public Display** | Automatic | Fetches from DB | Real-time |

---

## 🚀 What's Next?

```
TODAY ✅
└─ Verify backend PATCH endpoint

THIS WEEK ⏳
└─ Build features section (Phase 2)
   ├─ Add feature checkboxes
   ├─ Save to backend
   └─ Display on public page

NEXT WEEK 📌
└─ Build offers system (Phase 3)
   ├─ Create offer model
   ├─ Build management UI
   └─ Show discounts on public page
```

---

## 💬 TL;DR (Too Long Didn't Read)

**What we're building:**
- SuperAdmin can edit plan prices, features, and visibility in one place
- SuperAdmin can create promotional offers that apply to any plans
- Both show up on public /plans page automatically
- Features and offers can be toggled on/off anytime
- Discounts calculate automatically based on active offers

**Current Status:**
- ✅ Phase 1 (Pricing) - DONE
- ⏳ Phase 2 (Features) - NEXT
- 📌 Phase 3 (Offers) - AFTER

**You now have:**
- Plans management page ✅
- Price editing ✅
- Visibility toggle ✅
- Complete documentation 📄
- Clear roadmap 🗺️

**Ready to build Phase 2?** 🚀
