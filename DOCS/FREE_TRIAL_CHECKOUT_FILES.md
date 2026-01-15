# Free Trial Checkout Workflow - Files Involved

## Complete Flow

```
1. User clicks "Start Free Trial"
2. Redirects to /signup?plan=trial
3. Frontend redirects to /subscription/checkout?planId=trial
4. Checkout page fetches plan details
5. Plan detected as free (price = 0)
6. Shows form with password field
7. User verifies email with OTP
8. Account created directly (no payment)
9. Redirects to /onboarding
```

---

## Files Involved

### **FRONTEND FILES**

#### 1. **`frontend/app/signup/page.tsx`** - Entry Point
**Purpose**: Initial signup page that redirects to checkout
**Key Logic**:
- Detects `plan` query parameter
- Redirects to `/subscription/checkout?planId={plan}`
- For trial/free: redirects to `?planId=trial`

**Lines**: 1-45
```tsx
const planId = searchParams?.get("plan") || "trial";
if (isTrial) {
  router.push("/subscription/checkout?planId=trial");
}
```

---

#### 2. **`frontend/app/subscription/checkout/page.tsx`** - Main Checkout Logic
**Purpose**: Handles entire checkout flow for both free and paid plans
**Key Components**:

##### A. Plan Fetching (Lines 150-170)
```tsx
useEffect(() => {
  const fetchPlan = async () => {
    const res = await fetch(`/api/subscription/plans/${planId}`);
    const data = await res.json();
    setPlan(data.plan);
    // AUTO-DETECT if plan is free
    setIsFree(data.plan.price === 0 || data.plan.isFree === true);
  };
}, [planId, router]);
```

##### B. OTP Verification Handler (Lines 276-310)
```tsx
const handleVerifyOtp = async () => {
  // Verify OTP
  if (res.ok) {
    const verifiedEmailValue = formData.email;
    setVerifiedEmail(verifiedEmailValue);
    
    // CRITICAL: Check if free plan
    if (isFree) {
      setStep("processing");  // Show "Creating Account..."
      setIsSubmitting(false);
      handleFreeAccountCreation(verifiedEmailValue);
    } else {
      setStep("payment");  // Show payment page
    }
  }
};
```

##### C. Free Account Creation (Lines 312-363)
```tsx
const handleFreeAccountCreation = async (email: string) => {
  // Create account WITHOUT payment
  const payload = {
    name: formData.name,
    instituteName: formData.instituteName,
    email: email,
    phone: formData.phone,
    password: formData.password,
    planId: planId,
    isTrial: true,  // Mark as trial
  };

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Success → Redirect to onboarding
  router.push("/onboarding");
};
```

##### D. Conditional Payment Step (Line 825)
```tsx
{step === "payment" && !isFree && (
  // Show payment page ONLY for paid plans
)}
```

##### E. Conditional Processing Message (Line 895)
```tsx
{step === "processing" && (
  <h3>
    {isFree ? "Creating Your Account..." : "Processing Payment..."}
  </h3>
)}
```

---

### **BACKEND FILES**

#### 3. **`backend/src/routes/subscriptionCheckoutRoutes.js`** - API Routes
**Purpose**: Define API endpoints for subscription checkout
**Endpoints**:
- `GET /plans` - Get all plans
- `GET /plans/:planId` - Get specific plan (detects if free)
- `POST /checkout` - Initiate checkout (returns `isFree: true` for free plans)

```javascript
router.get("/plans", getPlans);
router.get("/plans/:planId", getPlanById);
router.post("/checkout", checkoutInitiate);
```

---

#### 4. **`backend/src/controllers/subscriptionCheckoutController.js`** - Business Logic
**Purpose**: Handle checkout logic for free and paid plans
**Key Functions**:

##### A. getPlanById (Lines 44-81)
```javascript
export const getPlanById = async (req, res) => {
  const { planId } = req.params;
  
  // Check free plans first
  if (FREE_PLANS[planId]) {
    return res.status(200).json({
      plan: FREE_PLANS[planId]  // price: 0
    });
  }
  
  // Then check paid plans
  const paidPlan = PLANS.find(p => p.id === planId);
  return res.json({ plan: paidPlan });  // price: > 0
};
```

##### B. checkoutInitiate (Lines 88-260)
```javascript
export const checkoutInitiate = async (req, res) => {
  const { planId, email, phone, name, instituteName } = req.body;
  
  const isFree = FREE_PLANS[planId] ? true : false;
  
  // For FREE plans - NO payment
  if (isFree) {
    return res.status(200).json({
      success: true,
      isFree: true,  // ← Frontend checks this!
      plan: FREE_PLANS[planId],
      message: "Free plan - no payment required."
    });
  }
  
  // For PAID plans - Create Cashfree order
  // ... payment initiation code ...
  return res.json({
    success: true,
    isFree: false,
    paymentSessionId: data.paymentSessionId
  });
};
```

##### C. Free Plans Config (Lines 11-38)
```javascript
const FREE_PLANS = {
  trial: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    isFree: true
  },
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    isFree: true
  }
};
```

---

#### 5. **`backend/src/server.js`** - Route Registration
**Purpose**: Mount the subscription checkout routes
**Key Line** (Line 35):
```javascript
import subscriptionCheckoutRoutes from './routes/subscriptionCheckoutRoutes.js';

// Line 86
app.use('/api/subscription', subscriptionCheckoutRoutes);
```

This makes endpoints available at:
- `GET /api/subscription/plans/trial`
- `POST /api/subscription/checkout`

---

#### 6. **`backend/src/routes/authRoutes.js`** - Signup Handler
**Purpose**: Create user account (called by handleFreeAccountCreation)
**Endpoint**: `POST /api/auth/signup`
**Accepts**:
```javascript
{
  name, instituteName, email, phone, password,
  planId, isTrial: true
}
```

---

#### 7. **`backend/src/config/plans.js`** - Plan Definitions
**Purpose**: Define paid plans config
**Note**: Free plans are defined in `subscriptionCheckoutController.js`

---

## Data Flow

### Request Path for Free Plan
```
Frontend: GET /api/subscription/plans/trial
↓
Backend: subscriptionCheckoutController.getPlanById()
↓
Return: { plan: { id: 'trial', price: 0, isFree: true } }
↓
Frontend: Detects isFree = true
↓
Shows form + password field
↓
User enters OTP
↓
Frontend: POST /api/email/verify-otp
↓
OTP verified
↓
Frontend: Calls handleFreeAccountCreation()
↓
Frontend: POST /api/auth/signup with isTrial: true
↓
Backend: Creates account in User & Tenant collections
↓
Returns token
↓
Frontend: Stores token + redirects to /onboarding
```

---

## Test Commands

### Test Backend Endpoints Locally
```bash
# Get trial plan
curl -s http://localhost:5050/api/subscription/plans/trial | jq .

# Initiate checkout for free plan
curl -s -X POST http://localhost:5050/api/subscription/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "trial",
    "email": "test@example.com",
    "phone": "9876543210",
    "name": "Test Institute",
    "instituteName": "Test Inst"
  }' | jq .

# Expected response:
# {
#   "success": true,
#   "isFree": true,
#   "message": "Free plan - no payment required."
# }
```

### Test Frontend Flow
1. Open http://localhost:3000/signup?plan=trial
2. Fill form + create password
3. Send OTP
4. Verify OTP
5. Should see "Creating Your Account..."
6. Should NOT see payment page
7. Should redirect to /onboarding

---

## Debugging Checklist

- [ ] Backend is running: `npm start` in `/backend`
- [ ] Frontend is running: `npm run dev` in `/frontend`
- [ ] API endpoint `/api/subscription/plans/trial` returns `price: 0`
- [ ] Check browser console for any errors
- [ ] Check browser Network tab for API responses
- [ ] Verify `isFree` is being detected correctly (add console.log)
- [ ] Verify `handleFreeAccountCreation` is being called
- [ ] Verify `setStep("processing")` sets correct state
- [ ] Check if payment step conditional is working: `{step === "payment" && !isFree && (`

---

## Summary

**Free Trial Signup is Controlled by:**

1. ✅ **Frontend Detection**: `setIsFree(data.plan.price === 0)`
2. ✅ **Backend Response**: `isFree: true` flag in checkout response
3. ✅ **Flow Control**: `if (isFree) → skip payment → create account`
4. ✅ **UI Conditional**: `{step === "payment" && !isFree && (` hides payment for free plans
5. ✅ **Processing Message**: `{isFree ? "Creating..." : "Processing Payment..."}`

All these files work together to ensure free plans never see the payment page! 🎉
