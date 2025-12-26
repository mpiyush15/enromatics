# Plans & Offers - Visual Flow Diagram

## 🎬 User Journey & Data Flow

### SCENARIO 1: SuperAdmin Updates Plan Pricing

```
SuperAdmin goes to /dashboard/superadmin/plans
                    ↓
        Sees 3 Plan Cards (Starter, Pro, Enterprise)
                    ↓
        Clicks on PRO card
                    ↓
        Sees current price: ₹2999/mo
                    ↓
        Changes to: ₹3499/mo
                    ↓
        Clicks "Update Pricing" button
                    ↓
        PATCH /api/subscription-plans/pro-id
        {
          monthlyPrice: 3499,
          annualPrice: 41988
        }
                    ↓
        Backend updates Database
                    ↓
        Success toast: "✅ Plan pricing updated"
                    ↓
        Public /plans page automatically shows:
        
        ┌──────────────────────┐
        │     PRO PLAN         │
        │                      │
        │  ₹3499/mo  (UPDATED!)│  ← User sees new price
        │  (from ₹2999)        │
        │                      │
        │  [Get Started]       │
        └──────────────────────┘
```

---

### SCENARIO 2: SuperAdmin Adds Features to Plans

```
SuperAdmin on Plans Management page
                    ↓
        Each plan card shows FEATURES section:
        
        STARTER CARD:
        ┌────────────────────────────────┐
        │  Online Tests        ✓ enabled │
        │  Test Analytics      ✓ enabled │
        │  Video Classes       ✗ disabled│
        │  Advanced Reports    ✗ disabled│
        │  [Save Features]               │
        └────────────────────────────────┘
                    ↓
        SuperAdmin clicks checkbox to ENABLE "Video Classes"
                    ↓
        Features become: [✓✓✓✗]
                    ↓
        Clicks "Save Features"
                    ↓
        PATCH /api/subscription-plans/starter-id
        {
          features: [
            { name: "Online Tests", enabled: true },
            { name: "Test Analytics", enabled: true },
            { name: "Video Classes", enabled: true },  ← Changed!
            { name: "Advanced Reports", enabled: false }
          ]
        }
                    ↓
        Backend updates Database
                    ↓
        Public /plans page shows:
        
        STARTER PLAN - ₹999/mo
        ✓ Online Tests
        ✓ Test Analytics  
        ✓ Video Classes       ← NEW feature visible!
        ✗ Advanced Reports
```

---

### SCENARIO 3: SuperAdmin Creates an Offer

```
SuperAdmin goes to /dashboard/admin/offers
                    ↓
        Clicks "Create New Offer"
                    ↓
        Form appears:
        ┌────────────────────────────────────┐
        │  Offer Name: "Diwali Special"      │
        │  Description: "25% OFF PRO"        │
        │                                    │
        │  Discount Type: ● Percentage ○ Fixed
        │  Discount: 25%                     │
        │                                    │
        │  Valid From: Dec 26, 2025         │
        │  Valid To: Dec 31, 2025           │
        │                                    │
        │  Apply to which plans:            │
        │  ☐ Starter                        │
        │  ☑ Pro          ← Selected!       │
        │  ☑ Enterprise   ← Selected!       │
        │                                    │
        │  [Create Offer]                   │
        └────────────────────────────────────┘
                    ↓
        SuperAdmin selects:
        - Discount: 25% OFF
        - Valid: Dec 26-31, 2025
        - Apply to: PRO & ENTERPRISE
                    ↓
        Clicks "Create Offer"
                    ↓
        POST /api/offers
        {
          name: "Diwali Special",
          description: "25% OFF PRO",
          discountType: "percentage",
          discountValue: 25,
          validFrom: "2025-12-26",
          validTo: "2025-12-31",
          applicablePlans: ["pro-id", "enterprise-id"]
        }
                    ↓
        Backend creates Offer in Database
                    ↓
        Public /plans page shows:
        
        STARTER - ₹999/mo
        ✓ Features...
        [Get Started]
        
        PRO - ₹2999/mo
        🎁 DIWALI SPECIAL: 25% OFF
        NEW PRICE: ₹2249/mo
        ✓ Features...
        [Get Started]
        
        ENTERPRISE - Custom
        🎁 DIWALI SPECIAL: 25% OFF  
        NEW PRICE: Custom-25%
        ✓ Features...
        [Contact Sales]
```

---

## 📊 Database Structure

### Plans Collection
```javascript
Plans: [
  {
    _id: ObjectId("607f1f77bcf86cd799439011"),
    id: "starter",
    name: "Starter",
    description: "For small schools",
    monthlyPrice: 999,          // ← Editable by SuperAdmin
    annualPrice: 11988,         // ← Editable by SuperAdmin
    features: [                 // ← Editable by SuperAdmin
      {
        name: "Online Tests",
        enabled: true
      },
      {
        name: "Test Analytics",
        enabled: true
      },
      {
        name: "Video Classes",
        enabled: false
      },
      {
        name: "Advanced Reports",
        enabled: false
      }
    ],
    quotas: {
      students: 100,           // Read-only
      staff: 5,                // Read-only
      storage: "10GB"          // Read-only
    },
    isVisible: true,            // ← Editable by SuperAdmin
    popular: false,
    status: "active",
    createdAt: Date,
    updatedAt: Date
  },
  
  {
    _id: ObjectId("607f1f77bcf86cd799439012"),
    id: "pro",
    name: "Pro",
    description: "For growing schools",
    monthlyPrice: 2999,
    annualPrice: 35988,
    features: [
      { name: "Online Tests", enabled: true },
      { name: "Test Analytics", enabled: true },
      { name: "Video Classes", enabled: true },
      { name: "Advanced Reports", enabled: false }
    ],
    quotas: {
      students: "Unlimited",
      staff: "Unlimited",
      storage: "100GB"
    },
    isVisible: true,
    popular: true,              // Pro is marked as popular/recommended
    status: "active",
    createdAt: Date,
    updatedAt: Date
  },
  
  {
    _id: ObjectId("607f1f77bcf86cd799439013"),
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solution for large institutions",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    features: [
      { name: "Online Tests", enabled: true },
      { name: "Test Analytics", enabled: true },
      { name: "Video Classes", enabled: true },
      { name: "Advanced Reports", enabled: true }
    ],
    quotas: {
      students: "Unlimited",
      staff: "Unlimited",
      storage: "Custom"
    },
    isVisible: true,
    popular: false,
    status: "active",
    createdAt: Date,
    updatedAt: Date
  }
]
```

### Offers Collection (NEW)
```javascript
Offers: [
  {
    _id: ObjectId("607f1f77bcf86cd799439020"),
    name: "Diwali Special",
    description: "25% OFF PRO Plan",
    discountType: "percentage",  // or "fixed"
    discountValue: 25,           // 25% or ₹500
    validFrom: "2025-12-26",
    validTo: "2025-12-31",
    applicablePlans: [
      "607f1f77bcf86cd799439012", // pro-id
      "607f1f77bcf86cd799439013"  // enterprise-id
    ],
    status: "active",
    badgeText: "🎁 DIWALI SPECIAL",
    priority: 1,
    createdBy: "superadmin-user-id",
    createdAt: Date,
    updatedAt: Date
  },
  
  {
    _id: ObjectId("607f1f77bcf86cd799439021"),
    name: "Year End Offer",
    description: "₹500 OFF on any plan",
    discountType: "fixed",
    discountValue: 500,
    validFrom: "2025-12-26",
    validTo: "2026-01-05",
    applicablePlans: [
      "607f1f77bcf86cd799439011", // starter-id
      "607f1f77bcf86cd799439012", // pro-id
      "607f1f77bcf86cd799439013"  // enterprise-id
    ],
    status: "active",
    badgeText: "🎁 YEAR END",
    priority: 2,
    createdBy: "superadmin-user-id",
    createdAt: Date,
    updatedAt: Date
  }
]
```

---

## 🔄 Frontend State Management

### Plans Management Page State
```typescript
// /frontend/app/dashboard/superadmin/plans/page.tsx

interface Plan {
  _id: string;
  name: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  features: Feature[];
  quotas: Quotas;
  isVisible: boolean;
  status: string;
}

interface Feature {
  name: string;
  enabled: boolean;
}

interface EditingState {
  [planId: string]: {
    monthlyPrice: number | string;
    annualPrice: number | string;
    features: Feature[];
  };
}

// Component State
const [plans, setPlans] = useState<Plan[]>([]);
const [editingPrices, setEditingPrices] = useState<EditingState>({});
const [editingFeatures, setEditingFeatures] = useState<EditingState>({});
const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

// Handlers
const handlePriceChange = (planId, field, value) => {
  setEditingPrices(prev => ({
    ...prev,
    [planId]: {
      ...prev[planId],
      [field]: value
    }
  }));
};

const handleFeatureToggle = (planId, featureName) => {
  setEditingFeatures(prev => ({
    ...prev,
    [planId]: {
      ...prev[planId],
      features: prev[planId].features.map(f =>
        f.name === featureName
          ? { ...f, enabled: !f.enabled }
          : f
      )
    }
  }));
};

const handleSavePrice = async (plan) => {
  // PATCH /api/subscription-plans/:id
  // Body: { monthlyPrice, annualPrice }
};

const handleSaveFeatures = async (plan) => {
  // PATCH /api/subscription-plans/:id
  // Body: { features: [...] }
};

const toggleVisibility = async (plan) => {
  // PATCH /api/subscription-plans/:id
  // Body: { isVisible: !plan.isVisible }
};
```

---

## 🧮 Price Calculation Logic

### When Displaying Plan on /plans Page:

```typescript
function calculateDisplayPrice(plan: Plan, offers: Offer[]) {
  // Get applicable offers for this plan
  const applicableOffers = offers.filter(
    offer => 
      offer.applicablePlans.includes(plan._id) &&
      isOfferValid(offer)  // Check if within valid dates
  );

  // Calculate discount
  let finalPrice = plan.monthlyPrice;
  let bestDiscount = 0;
  let appliedOffer = null;

  for (const offer of applicableOffers) {
    let discount;
    
    if (offer.discountType === "percentage") {
      // 25% OFF on ₹2999 = ₹749.75
      discount = (plan.monthlyPrice * offer.discountValue) / 100;
    } else {
      // ₹500 OFF on ₹2999 = ₹500
      discount = offer.discountValue;
    }

    // Use the best (highest) discount
    if (discount > bestDiscount) {
      bestDiscount = discount;
      appliedOffer = offer;
      finalPrice = plan.monthlyPrice - discount;
    }
  }

  return {
    originalPrice: plan.monthlyPrice,
    finalPrice: finalPrice,
    discount: bestDiscount,
    appliedOffer: appliedOffer,
    hasDiscount: bestDiscount > 0
  };
}
```

---

## ✅ Implementation Checklist

### Phase 1: Price Management (✅ DONE)
- [x] Create Plans Management page
- [x] Fetch plans from API
- [x] Display plans as cards
- [x] Edit monthly/annual prices
- [x] Save prices to backend
- [x] Toggle visibility
- [x] Success/error toasts

### Phase 2: Features Management (🔄 NEXT)
- [ ] Add features array to plan display
- [ ] Create feature toggles (checkboxes) per plan
- [ ] Handle feature state updates
- [ ] PATCH /api/subscription-plans/:id with features
- [ ] Display features on public /plans page

### Phase 3: Offers System (📌 AFTER Phase 2)
- [ ] Create Offers management page
- [ ] Create new offer form
- [ ] Multi-select plan checkboxes
- [ ] Date picker for valid dates
- [ ] POST /api/offers endpoint
- [ ] Display offers on cards
- [ ] Calculate discounted prices
- [ ] Show offer badges

### Phase 4: Refinements (🎨 POLISH)
- [ ] Offer priority ordering
- [ ] Active offer filtering
- [ ] Edit existing offers
- [ ] Delete offers
- [ ] Offer history/audit log

---

## 🎯 Got It? (Summary)

**SuperAdmin Controls:**
1. ✅ **Prices** (monthly/annual) - Can change anytime
2. ⏳ **Features** (what features each plan has) - Coming next
3. ✅ **Visibility** (show/hide from public page) - Already done
4. ⏳ **Offers** (promotions, discounts, badges) - After features

**Cards on `/plans` Page:**
1. Plan cards show current features & prices
2. Offer cards/badges show active promotions
3. Price updates instantly from backend
4. Features toggle instantly from backend
5. Offers apply automatically if date-valid

**System-wide Offers:**
- One offer can apply to multiple plans
- Automatically calculates discounted prices
- Shows badges on plan cards
- Date-based auto-expiry
- SuperAdmin can create/edit/delete anytime

---

Got it, bro? 🙌 Ready to build Phase 2 (Features)? 🚀
