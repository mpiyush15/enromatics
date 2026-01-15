# ⚠️ Plans Management - Next Actions Required

## Status: Frontend ✅ | Backend ⚠️ (Needs Verification)

---

## URGENT: Backend PATCH Endpoint

The Plans Management page expects a PATCH endpoint that may not exist yet.

### Endpoint Required:
```
PATCH /api/subscription-plans/:id
```

### What It Should Do:

**For Pricing Updates:**
```javascript
// Request Body
{
  monthlyPrice: 999,        // or string like "Free", "Custom"
  annualPrice: 8399
}

// Expected Response
{
  success: true,
  plan: {
    _id: "...",
    name: "Pro",
    monthlyPrice: 999,
    annualPrice: 8399,
    isVisible: true,
    // ... other fields
  }
}
```

**For Visibility Updates:**
```javascript
// Request Body
{
  isVisible: false
}

// Expected Response
{
  success: true,
  plan: {
    _id: "...",
    name: "Pro",
    isVisible: false,
    // ... other fields
  }
}
```

---

## Verification Tasks

### 1. Backend Endpoint Check

**File:** Check if route handler exists
```
/backend/src/routes/subscriptionPlansRoutes.js (or similar)
```

**Look for:**
```javascript
router.patch('/:id', protect, authorizeRoles('SuperAdmin'), updatePlan);
```

**If exists:** Verify the controller:
```javascript
// Should handle both pricing AND visibility updates
exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { monthlyPrice, annualPrice, isVisible } = req.body;
  
  // Update plan in MongoDB
  // Return updated plan
};
```

**If NOT exists:** Create it (provide template below)

---

## Template: PATCH Endpoint Implementation

If the endpoint doesn't exist, here's a template:

```javascript
// File: /backend/src/controllers/subscriptionPlanController.js

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthlyPrice, annualPrice, isVisible } = req.body;
    
    // Build update object
    const updateData = {};
    if (monthlyPrice !== undefined) updateData.monthlyPrice = monthlyPrice;
    if (annualPrice !== undefined) updateData.annualPrice = annualPrice;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    
    // Update plan
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    res.json({
      success: true,
      plan: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message
    });
  }
};

// Route registration
// In /backend/src/routes/subscriptionPlansRoutes.js
router.patch('/:id', protect, authorizeRoles('SuperAdmin'), updatePlan);
```

---

## Testing Checklist

After backend verification/implementation:

### Manual Testing

- [ ] Load `/dashboard/superadmin/plans` - plans appear
- [ ] Edit monthly price field - value updates in input
- [ ] Click "Update Pricing" - observe network request
- [ ] Check Request:
  - [ ] URL: `/api/subscription-plans/[plan-id]`
  - [ ] Method: PATCH
  - [ ] Body: `{ monthlyPrice: ... }`
  - [ ] Headers: `Content-Type: application/json`
  - [ ] Credentials: `include`
- [ ] Check Response:
  - [ ] Status: 200
  - [ ] Body: `{ success: true, plan: {...} }`
- [ ] Verify Success Toast appears
- [ ] Refresh page - new price persists
- [ ] Toggle visibility (eye icon)
  - [ ] Icon color changes
  - [ ] Request sent to PATCH with `{ isVisible: ... }`
- [ ] Check `/plans` public page - visibility toggle works

### Automated Testing (Optional)

```javascript
// Example test
describe('Plans Management', () => {
  test('should update plan pricing', async () => {
    const res = await fetch('/api/subscription-plans/plan-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyPrice: 1999 }),
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.plan.monthlyPrice).toBe(1999);
  });
});
```

---

## Potential Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| 404 error on PATCH | Route doesn't exist | Create endpoint using template above |
| 401 Unauthorized | Auth middleware | Check `protect` middleware working |
| 403 Forbidden | Role check | Check user is SuperAdmin |
| Plan not updating | Database issue | Check MongoDB connection + schema |
| Visibility not working | Field missing | Add `isVisible: boolean` to schema |

---

## Public /plans Page Integration

Once backend is working, need to verify:

1. **Is `/plans` page reading `isVisible` flag?**
   - Check: `/frontend/app/plans/page.tsx` or similar
   - Should filter: `plans.filter(p => p.isVisible === true)`

2. **Does it fetch from `/api/subscription-plans`?**
   - Yes: It will automatically show/hide based on admin toggle
   - No: Update fetch to use same endpoint

---

## Implementation Timeline

### Phase 1 (Current - Frontend Ready ✅)
- [x] Plans Management UI built
- [x] Price input fields
- [x] Visibility toggle
- [ ] Backend PATCH endpoint (NEEDS VERIFICATION)

### Phase 2 (After Verification)
- [ ] End-to-end testing
- [ ] Deploy to staging
- [ ] Production rollout

### Phase 3 (Future)
- [ ] Add plan creation
- [ ] Add plan editing (names/features)
- [ ] Add plan deletion
- [ ] Advanced pricing rules

---

## Support Commands

**Check if endpoint exists:**
```bash
grep -r "router.patch" /backend/src/routes/
grep -r "updatePlan\|update.*plan" /backend/src/controllers/
```

**Check subscription plan model:**
```bash
cat /backend/src/models/subscriptionPlan.js | grep -E "(monthlyPrice|annualPrice|isVisible)"
```

---

## Questions to Answer

1. **Backend:** Does PATCH endpoint exist for subscription plans?
2. **Database:** Does SubscriptionPlan schema have `isVisible` field?
3. **Public Page:** Does `/plans` filter by `isVisible === true`?
4. **Auth:** Is SuperAdmin role correctly set?

---

**Status:** BLOCKED ON BACKEND VERIFICATION

Contact: Check backend implementation before deploying frontend.

