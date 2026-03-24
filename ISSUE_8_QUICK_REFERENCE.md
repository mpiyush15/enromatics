# Issue 8 Quick Reference: Auto-Renew & Billing Cycle

## 📋 Files Created/Modified

### Created
1. **billingUtils.js** - Billing calculation and sync utilities
2. **migrate-billing-metadata.js** - Populate subscriptionMetadata in Tenant
3. **validate-billing-metadata.js** - Verify billing metadata consistency
4. **ISSUE_8_AUTO_RENEW_BILLING.md** - Detailed documentation

### Modified
1. **Tenant.js** - Added subscriptionMetadata field and methods
2. **TenantSubscription.js** - Added billingCycle field and post-save sync hook

---

## 🎯 What Was Fixed

### Before
```javascript
// Billing info scattered
Tenant.plan = "pro"                          // Plan info
TenantSubscription.subscription.autoRenew = true   // Renewal setting
TenantSubscription.billingCycle = "monthly"        // Cycle info
// To check renewal: Need 2 lookups!
```

### After
```javascript
// All billing info in Tenant
Tenant.plan = "pro"
Tenant.subscriptionMetadata = {
  billingCycle: "monthly",
  autoRenew: true,
  nextBillingDate: 2026-04-19,
  renewalReminderSent: false,
  lastRenewalDate: 2026-03-19
}
// Single record, no joins needed
```

---

## 📊 New Fields in Tenant

```javascript
subscriptionMetadata: {
  billingCycle: String,        // 'monthly' or 'annual'
  autoRenew: Boolean,          // Auto-renew at end of cycle
  nextBillingDate: Date,       // When next renewal happens
  renewalReminderSent: Boolean, // Notification sent?
  lastRenewalDate: Date        // Last renewal date
}
```

---

## 🔧 How to Use

### Check if renewal is due
```javascript
const tenant = await Tenant.findOne({ tenantId });
if (tenant.isRenewalDue()) {
  console.log('Process renewal');
}
```

### Get days until renewal
```javascript
const daysLeft = tenant.getDaysUntilRenewal();
console.log(`Renews in ${daysLeft} days`);
```

### Check if reminder should be sent
```javascript
if (tenant.shouldSendRenewalReminder(7)) {  // 7 days before
  await sendRenewalReminder(tenant);
  await tenant.markRenewalReminderSent();
}
```

### Find tenants due for renewal
```javascript
const dueTenants = await Tenant.findDueForRenewal();
```

### Find tenants needing reminders
```javascript
const reminderTenants = await Tenant.findNeedingRenewalReminder(7);
```

---

## 📅 Billing Utilities

```javascript
import {
  calculateNextBillingDate,
  calculateDaysUntilRenewal,
  isRenewalDue,
  shouldSendRenewalReminder,
  getRenewalStatus,
  formatBillingSummary
} from './src/utils/billingUtils.js';

// Calculate next date
const nextDate = calculateNextBillingDate(
  new Date(), 
  'monthly'
);

// Get renewal status
const status = getRenewalStatus(tenant.subscriptionMetadata);
console.log(status.display); // "Renews in 7 days"

// Format for UI
const summary = formatBillingSummary(tenant.subscriptionMetadata);
// "Monthly billing • Auto-renews • Renews in 7 days"
```

---

## 🚀 Running Migration

### Preview changes
```bash
cd backend
node migrate-billing-metadata.js
```

### Apply changes
```bash
DRY_RUN=false node migrate-billing-metadata.js
```

### Validate after migration
```bash
node validate-billing-metadata.js
```

---

## ✅ Verification

Check that all tenants have billing metadata:
```javascript
db.tenants.find({
  subscriptionMetadata: { $exists: false }
}).count()
// Should return 0
```

Check metadata matches subscription:
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
      $expr: {
        $ne: ['$subscriptionMetadata.billingCycle', '$subscription.billingCycle']
      }
    }
  }
]).count()
// Should return 0
```

---

## 🔗 Sync Mechanism

### Auto-Sync Flow
1. TenantSubscription updated
2. Post-save hook triggered
3. Calls `syncBillingMetadata()`
4. Updates Tenant subscriptionMetadata
5. Tenant saved with latest billing info

**Result**: Billing info always in sync automatically

---

## 📝 Tenant Methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `isRenewalDue()` | Boolean | Check if past renewal date |
| `getDaysUntilRenewal()` | Number | Days until next renewal |
| `shouldSendRenewalReminder()` | Boolean | Check if reminder due |
| `markRenewalReminderSent()` | Promise | Mark reminder as sent |
| `resetRenewalReminder()` | Promise | Reset reminder flag |

| Static Method | Returns | Purpose |
|---------------|---------|---------|
| `findDueForRenewal()` | Query | Tenants needing renewal |
| `findNeedingRenewalReminder()` | Query | Tenants for reminders |

---

## 📊 Status

- [x] Schema updated: Tenant.subscriptionMetadata added
- [x] Sync hook added: Auto-sync from TenantSubscription
- [x] Billing cycle field added: TenantSubscription.billingCycle
- [x] Billing utilities created: 12 calculation functions
- [x] Migration script created: Populate metadata
- [x] Validation script created: Verify consistency
- [x] Instance methods added: Renewal checking
- [x] Static methods added: Bulk queries

---

**Issue 8 Status**: ✅ COMPLETE
