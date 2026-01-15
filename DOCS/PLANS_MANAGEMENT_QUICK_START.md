# 🚀 Plans Management - Quick Start Guide

## Overview
SuperAdmin can now manage plan pricing from a unified Plans & Offers dashboard section.

---

## How to Access

1. **Login as SuperAdmin**
2. **Navigate:** Sidebar → 💰 Plans & Offers → 📋 Plans Management
3. **URL:** `/dashboard/superadmin/plans`

---

## What You Can Do

### ✅ Update Plan Pricing
1. View all active plans in cards
2. Edit "Monthly Price" or "Annual Price" fields
3. Click "Update Pricing" button
4. See success confirmation

**Format Accepted:**
- Numeric: `999`, `8399`
- Text: `"Free"`, `"Custom"`, `"Contact us"`

### ✅ Toggle Plan Visibility
1. Click eye icon (👁️) on plan card
2. Plan appears/disappears from public `/plans` page
3. Badge shows visibility status

### ✅ View Plan Details
- Student quota limit
- Staff quota limit
- Storage allocation
- Status (Active/Inactive)
- Current pricing

---

## What's NOT Available (Phase 2)

- ❌ Create new plans
- ❌ Delete plans
- ❌ Edit plan names
- ❌ Edit plan features
- ❌ Edit quotas/storage

---

## API Flow

```
Frontend Request
    ↓
PATCH /api/subscription-plans/:id
    ├─ Body: { monthlyPrice, annualPrice } OR { isVisible }
    └─ Requires: Authentication + SuperAdmin role
    ↓
Backend Update
    ├─ Validate pricing format
    ├─ Update MongoDB document
    └─ Return updated plan
    ↓
Frontend Response
    ├─ Update local state
    ├─ Show success toast
    └─ Display new values
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Plans not loading | Check `/api/subscription-plans` endpoint exists |
| Save button disabled | Check network/authentication |
| Price update fails | Verify backend PATCH support |
| Visibility toggle not working | Ensure `isVisible` field in plan schema |
| Page crashes | Check browser console for errors |

---

## Testing Steps

1. **Load page** → Plans display with current prices
2. **Edit price** → Input field value changes
3. **Click save** → Loading spinner appears → Success toast → New price displays
4. **Toggle visibility** → Eye icon changes color → Check `/plans` page shows/hides correctly
5. **Refresh page** → Changes persist (data loaded fresh from API)

---

## Integration Checklist

- [x] Frontend UI built and error-free
- [x] Sidebar navigation unified
- [x] API endpoints integrated
- [ ] Backend PATCH endpoint verified/created
- [ ] Database schema supports pricing updates
- [ ] Visibility toggle persists to database
- [ ] `/plans` public page reads `isVisible` flag
- [ ] End-to-end testing completed

---

## Key Features

🎯 **Simple Cost Management** - Focus on pricing, nothing else

🔄 **Real-time Updates** - See changes immediately

👁️ **Visibility Control** - Show/hide plans on public page

📊 **Plan Overview** - See all details at a glance

⚡ **Loading States** - User knows when action is processing

🔔 **Toast Feedback** - Clear success/error messages

---

## Next Steps

1. Verify backend PATCH endpoint implementation
2. Test with real database
3. Validate pricing updates persist
4. Confirm visibility toggle works
5. Deploy to production
6. Plan Phase 2 feature additions

