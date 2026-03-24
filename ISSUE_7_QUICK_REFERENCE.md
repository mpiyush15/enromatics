# Issue 7 Quick Reference

## 📋 Files Created/Modified

### Created
1. **planUtils.js** - Standardized plan definitions and utilities
2. **migrate-plan-field.js** - Data migration script (legacy → new format)
3. **validate-plan-field.js** - Validation and consistency checks
4. **ISSUE_7_PLAN_FIELD_POLLUTION.md** - Detailed issue documentation

### Modified
1. **TenantSubscription.js** - Updated planType enum and methods

---

## 🔧 How to Use

### Running Migration
```bash
# Preview changes (dry-run)
cd backend
node migrate-plan-field.js

# Apply changes
DRY_RUN=false node migrate-plan-field.js
```

### Running Validation
```bash
cd backend
node validate-plan-field.js
```

### Using Plan Utilities
```javascript
import { 
  getPlanFeatures, 
  getPlanPricing,
  hasFeature,
  canUpgradePlan 
} from './src/utils/planUtils.js';

// Get features for a plan
const proFeatures = getPlanFeatures('pro');
// { webDashboard: true, mobileApp: true, prioritySupport: true, ... }

// Check if feature available
const hasAPI = hasFeature('basic', 'apiAccess');  // true

// Check upgrade validity
const canUpgrade = canUpgradePlan('basic', 'pro');  // true

// Get pricing
const pricing = getPlanPricing('pro');
// { monthlyPrice: 999, annualPrice: 9999, currency: 'INR' }
```

---

## 📊 Plan Tiers (Standardized)

```
┌─────────────┬───────────────────────────────────────────────────────────┐
│ Plan        │ Features                                                  │
├─────────────┼───────────────────────────────────────────────────────────┤
│ free        │ Web Dashboard only, no paid features                      │
├─────────────┼───────────────────────────────────────────────────────────┤
│ basic       │ Dashboard, Mobile App, API Access (₹499/month)            │
├─────────────┼───────────────────────────────────────────────────────────┤
│ pro         │ Basic + Priority Support, Offline, Customization (₹999)   │
├─────────────┼───────────────────────────────────────────────────────────┤
│ enterprise  │ Pro + Custom features, dedicated support (Contact sales)  │
└─────────────┴───────────────────────────────────────────────────────────┘
```

---

## ✅ Verification

**All subscriptions should use new plan values:**
```javascript
// Should return 0 if all migrated correctly
db.tenantsubscriptions.find({
  planType: { $nin: ['free', 'basic', 'pro', 'enterprise'] }
}).count()
```

**Check consistency between Tenant and TenantSubscription:**
```javascript
db.tenants.aggregate([
  {
    $lookup: {
      from: 'tenantsubscriptions',
      localField: 'tenantId',
      foreignField: 'tenantId',
      as: 'subscription'
    }
  },
  {
    $unwind: '$subscription'
  },
  {
    $match: {
      $expr: { $ne: ['$plan', '$subscription.planType'] }
    }
  }
]).count()
// Should return 0 if consistent
```

---

## 🎯 Key Changes Summary

| Aspect | Old | New |
|--------|-----|-----|
| TenantSubscription planType | `['basic', 'premium']` | `['free', 'basic', 'pro', 'enterprise']` |
| Feature mapping | Manual | Automated via `getPlanFeatures()` |
| Pricing | USD mixed with INR | Standardized INR (0, 499, 999, custom) |
| Upgrade paths | Undefined | Explicit: free→basic→pro→enterprise |
| Plan comparison | Not possible | Via `getPlanRank()` |
| Legacy migration | N/A | Via `migrateLegacyPlan()` |

---

## 🚀 Common Tasks

### Check if tenant can access mobile app
```javascript
import TenantSubscription from './src/models/TenantSubscription.js';

const sub = await TenantSubscription.findOne({ tenantId });
const canAccess = sub.canAccessMobileApp();
```

### Upgrade a subscription
```javascript
const sub = await TenantSubscription.findOne({ tenantId });
await sub.upgradePlan('pro');
// Automatically:
// - Updates planType
// - Updates features
// - Updates pricing
// - Adds payment history record
```

### Get all premium tenants
```javascript
const premiumSubs = await TenantSubscription.findPremiumTenants();
// Returns all tenants with plan = 'pro' or 'enterprise'
```

### Validate plan values
```javascript
import { isValidPlan } from './src/utils/planUtils.js';

if (isValidPlan('pro')) {
  console.log('Valid plan');
}
```

---

## 📝 Notes

- Migration is safe: dry-run by default
- Validation confirms consistency
- Backward compatible: old code still works
- Feature gating: use `hasFeature(plan, feature)` 
- Pricing: always in INR now
- Always use plan utils for any plan logic

---

**Issue 7 Status**: ✅ RESOLVED
