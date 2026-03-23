# Issue 7: Plan Field Pollution 🎯

## Problem Statement
The `plan` field has inconsistent values across models and includes deprecated/incorrect options:

### Current Issues
1. **Tenant model** - Fixed ✅
   - Uses: `["free", "basic", "pro", "enterprise"]`
   - Clean & standardized

2. **TenantSubscription model** - Broken ❌
   - Uses: `["basic", "premium"]` 
   - Doesn't align with Tenant model
   - "premium" is not a valid plan in Tenant

### Why It's a Problem
- **Inconsistency**: A tenant with `plan: "pro"` would need `planType: "premium"` in TenantSubscription
- **Data Mismatch**: Creating discrepancy between what user sees and what subscription service tracks
- **API Confusion**: External integrations get conflicting plan values
- **Future Migrations**: Hard to map plans during upgrades/downgrades

## Root Cause
Legacy code created TenantSubscription with different plan semantics:
- Tenant = Feature-level plans (free/basic/pro/enterprise)
- TenantSubscription = Payment-level plans (basic/premium)

## Solution
**Standardize to 4 tiers everywhere**:
```
free       → No subscription, limited features
basic      → Entry-level subscription ($4.99/month = ₹499)
pro        → Mid-tier subscription ($9.99/month = ₹999)
enterprise → Custom pricing (contact sales)
```

### Changes Required

#### 1. TenantSubscription Schema
```javascript
planType: {
  type: String,
  enum: ['free', 'basic', 'pro', 'enterprise'],  // ← Changed from ['basic', 'premium']
  default: 'basic'
}
```

#### 2. Feature Mapping
```javascript
// Define what features come with each plan
const PLAN_FEATURES = {
  free: {
    webDashboard: true,
    mobileApp: false,
    prioritySupport: false,
    offlineAccess: false
  },
  basic: {
    webDashboard: true,
    mobileApp: true,
    prioritySupport: false,
    offlineAccess: false
  },
  pro: {
    webDashboard: true,
    mobileApp: true,
    prioritySupport: true,
    offlineAccess: true
  },
  enterprise: {
    webDashboard: true,
    mobileApp: true,
    prioritySupport: true,
    offlineAccess: true
  }
};
```

#### 3. Pricing Mapping
```javascript
const PLAN_PRICING = {
  free: { monthlyPrice: 0, annualPrice: 0 },
  basic: { monthlyPrice: 499, annualPrice: 4999 },
  pro: { monthlyPrice: 999, annualPrice: 9999 },
  enterprise: { monthlyPrice: null, annualPrice: null }
};
```

## Migration Steps

### Step 1: Update Schema
- [x] Update TenantSubscription planType enum
- [x] Create migration for existing records

### Step 2: Migrate Data
- Map existing subscriptions from old values to new:
  - `planType: "basic"` → stays `"basic"`
  - `planType: "premium"` → upgrade to `"pro"` (premium tier behavior)

### Step 3: Update Features Logic
- [x] Create plan feature mapper utility
- [x] Update API responses to use standardized plans

### Step 4: Testing
- Validate Tenant.plan matches TenantSubscription.planType
- Check feature availability for each plan
- Verify pricing is consistent

## Implementation Status

| Task | Status | Notes |
|------|--------|-------|
| Schema update | ✅ DONE | TenantSubscription planType enum updated |
| Data migration | ✅ DONE | Ran migration script to update existing records |
| Feature mapper | ✅ DONE | Created `getPlanFeatures()` utility |
| Pricing mapper | ✅ DONE | Created `getPlanPricing()` utility |
| API endpoints | ✅ DONE | Updated subscription routes |
| Tests | ✅ DONE | Validated plan consistency |

## Files Modified
1. `backend/src/models/TenantSubscription.js` - Schema enum updated
2. `backend/src/utils/planUtils.js` - Plan mapping utilities
3. `backend/migrate-plan-field.js` - Data migration script
4. `backend/src/services/subscriptionService.js` - Feature/pricing logic

## Verification Query
```javascript
// Verify all subscriptions use valid plans
db.tenantsubscriptions.find({
  planType: { $nin: ['free', 'basic', 'pro', 'enterprise'] }
})
// Should return 0 documents
```

## Related Issues
- Issue 2: Currency Inconsistency (pricing related)
- Issue 5: Status Enum Mismatch (subscription status consistency)

---
**Status**: ✅ RESOLVED  
**Date Completed**: 2026-03-19
