# Issue 8: Auto-Renew & Billing Cycle Not in Tenant 🎯

## Problem Statement
Billing configuration scattered across models:
- **TenantSubscription**: Has `autoRenew` and `billingCycle`
- **Tenant**: Missing these critical billing fields

### Impact
1. Can't determine renewal settings from Tenant record alone
2. Requires separate lookup to TenantSubscription for billing info
3. Inconsistent data source for subscription metadata
4. Difficult to query: "Which tenants have auto-renew disabled?"

## Root Cause
During design, billing fields were only added to TenantSubscription, not mirrored to Tenant for quick access.

## Solution
Add billing metadata to Tenant model to mirror TenantSubscription:

```javascript
// Add to Tenant schema
subscriptionMetadata: {
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  nextBillingDate: {
    type: Date,
    default: null
  },
  renewalReminderSent: {
    type: Boolean,
    default: false
  }
}
```

### Why in Tenant?
✓ Single record contains all key info  
✓ Faster queries: No joins needed  
✓ Cache-friendly  
✓ API responses can include billing status  

### Sync Strategy
- Tenant.subscriptionMetadata = source of truth for READ
- TenantSubscription.subscription = source of truth for detailed billing
- Updates propagate from TenantSubscription → Tenant (via hooks)

## Implementation

### 1. Add subscriptionMetadata to Tenant
- billingCycle: monthly|annual
- autoRenew: boolean
- nextBillingDate: Date (calculated)
- renewalReminderSent: flag

### 2. Add sync hooks to TenantSubscription
- Before save: Copy metadata to Tenant
- On subscription update: Recalculate nextBillingDate

### 3. Add billing calculation utilities
- calculateNextBillingDate()
- calculateDaysUntilRenewal()
- isRenewalDue()

### 4. Update API endpoints
- Return subscriptionMetadata in Tenant responses
- Use it for renewal reminders and queries

## Benefits

| Before | After |
|--------|-------|
| Need to fetch TenantSubscription to get billing cycle | Direct access from Tenant |
| Can't query "auto-renew: false" quickly | Can query Tenant directly |
| Data duplication handled manually | Automatic sync via hooks |
| Inconsistent renewal reminder logic | Centralized in utilities |

## Related Issues
- Issue 9: Subscription Status Lifecycle (uses nextBillingDate)
- Issue 1: Duplicate Subscription Data (mirrors this pattern)

---
**Status**: ✅ IMPLEMENTATION COMPLETE  
**Date**: 2026-03-19
