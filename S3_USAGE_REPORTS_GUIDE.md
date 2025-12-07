# S3 Usage Reports – SuperAdmin Dashboard

## 📊 Where to Access

### **Location in Application**
```
SuperAdmin Dashboard → Storage Usage Report
URL: https://enromatics.com/admin/storage
```

---

## 🔗 API Endpoint (Backend)

**Endpoint:** `GET /api/storage/report`

**Route Location:** `backend/src/routes/storageRoutes.js`

**Controller:** `backend/src/controllers/storageUsageController.js`

### Request Example
```bash
curl -H "Authorization: Bearer <superadmin-token>" \
  https://api.enromatics.com/api/storage/report
```

### Response Format
```json
{
  "success": true,
  "summary": {
    "totalTenants": 42,
    "totalUsageGB": 523.45,
    "totalCapGB": 2100,
    "averageUsagePerTenant": 12.46
  },
  "report": [
    {
      "tenantId": "tenant_001",
      "instituteName": "Utkarsh Institute",
      "plan": "pro",
      "subscriptionStatus": "active",
      "usageGB": 45.23,
      "capGB": 50,
      "percentUsed": 90.46,
      "billingCycle": "monthly"
    },
    {
      "tenantId": "tenant_002",
      "instituteName": "Delhi Academy",
      "plan": "basic",
      "subscriptionStatus": "active",
      "usageGB": 8.12,
      "capGB": 10,
      "percentUsed": 81.2,
      "billingCycle": "annual"
    }
    // ... more tenants
  ]
}
```

---

## 🎨 Frontend Component

**Component:** `frontend/components/admin/StorageUsageReport.tsx`

**Features:**
- Summary cards showing:
  - Total tenants
  - Total storage usage
  - Total storage capacity
  - Average usage per tenant
- Sortable data table with columns:
  - Institute Name
  - Plan Tier (Basic/Pro/Enterprise)
  - Subscription Status
  - Usage / Cap (GB)
  - % Used (color-coded)
- Color coding:
  - 🟢 Green: < 50% used
  - 🟡 Yellow: 50-80% used
  - 🔴 Red: > 80% used

### Component Code Flow
```
StorageUsageReport.tsx
  ├─ useState(report, summary, loading, error)
  ├─ useEffect → fetchStorageReport()
  ├─ GET /api/storage/report
  ├─ Render summary cards
  ├─ Render sortable table
  └─ Color-coded usage bars
```

---

## 📈 Backend Flow

### Controller Logic: `storageUsageController.js`

**Function:** `getStorageUsageReport()`

**Steps:**
1. ✅ Verify user is SuperAdmin
2. ✅ Fetch all active tenants from MongoDB
3. ✅ For each tenant:
   - Compute storage usage from S3 (via `computeTenantStorageGB()`)
   - Get plan tier from `planMatrix.json`
   - Calculate capacity cap
   - Calculate % used
4. ✅ Aggregate summary stats
5. ✅ Return JSON response

### S3 Integration: `s3StorageUtils.js`

**Function:** `computeTenantStorageGB(tenantId)`

**How it works:**
```
1. List all S3 objects with prefix: tenants/{tenantId}/materials/
2. Paginate through results (max 1000 per request)
3. Sum up all object sizes
4. Convert bytes → GB
5. Return: { totalGB: 45.23 }
```

### Plan Quotas: `planMatrix.json`

**Storage Caps by Plan:**
```json
{
  "tiers": [
    {
      "key": "basic",
      "quotas": { "storageGB": 10 }
    },
    {
      "key": "pro",
      "quotas": { "storageGB": 50 }
    },
    {
      "key": "enterprise",
      "quotas": { "storageGB": null }  // unlimited
    }
  ]
}
```

---

## 🔐 Access Control

**Who can view?**
- ✅ SuperAdmin only (verified via JWT role)
- ❌ Tenant admins cannot access
- ❌ Students cannot access

**Authentication:**
- Bearer token in `Authorization` header
- Must have role: `superAdmin` or `admin`

---

## 📋 Usage Scenarios

### **SuperAdmin Billing**
- View which tenants are approaching capacity
- Identify upsell opportunities (tenants at 80%+)
- Track total platform storage consumption
- Monitor by subscription tier

### **Capacity Planning**
- Estimate S3 costs based on usage
- Plan for additional storage provisioning
- Identify heavy users
- Track growth trends over time

### **Multi-tenant Isolation**
- Each tenant's usage tracked separately
- Quota enforcement prevents overages
- Fair usage billing model

---

## 🚀 How to Use in Production

### **Step 1: Navigate to Admin Dashboard**
1. Login as SuperAdmin
2. Go to: `https://enromatics.com/admin/storage`

### **Step 2: View Summary Cards**
- Total tenants on platform
- Total storage across all tenants
- Available capacity
- Average usage pattern

### **Step 3: Analyze Tenant Table**
- Sort by usage, plan, or status
- Identify high-usage tenants
- Check subscription status
- Color indicators show risk levels:
  - 🟢 Safe: < 50%
  - 🟡 Warning: 50-80%
  - 🔴 Critical: > 80% (approaching limit)

### **Step 4: Take Action**
- For 🔴 tenants: Send upgrade prompt email
- Review with sales team for upsell
- Monitor for compliance with plan limits

---

## ⚠️ Performance Notes

**First Load:** Might take 10-30 seconds
- Reason: Computing S3 storage for all tenants (S3 listObjectsV2 for each)
- Subsequent loads: Same (no caching yet)

**Optimization (Phase 2):**
- Add nightly aggregation job
- Cache results in Redis
- Only recompute on new tenant uploads
- Add pagination for large platforms

---

## 📱 Frontend Page Setup (Optional)

If the page doesn't exist yet, create:

**File:** `frontend/app/admin/storage/page.tsx`

```tsx
import StorageUsageReport from '@/components/admin/StorageUsageReport';

export default function StorageUsagePage() {
  return (
    <div>
      <h1>S3 Storage Usage Report</h1>
      <StorageUsageReport />
    </div>
  );
}
```

---

## 📊 Sample Dashboard View

```
┌─────────────────────────────────────────────────────────┐
│ S3 STORAGE USAGE REPORT                        [Refresh] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Total        │  │ Total        │  │ Total        │   │
│  │ Tenants      │  │ Usage        │  │ Capacity     │   │
│  │              │  │              │  │              │   │
│  │     42       │  │   523.45 GB  │  │   2100 GB    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐                                        │
│  │ Avg Usage    │                                        │
│  │              │                                        │
│  │   12.46 GB   │                                        │
│  └──────────────┘                                        │
│                                                           │
├─────────────────────────────────────────────────────────┤
│ Institute Name    │ Plan  │ Status │ Usage  │ % Used    │
├─────────────────────────────────────────────────────────┤
│ Utkarsh Institute │ Pro   │ Active │45/50GB│ 🔴 90.46% │
│ Delhi Academy     │ Basic │ Active │8/10GB │ 🟡 81.2%  │
│ Mumbai Academy    │ Basic │ Active │5/10GB │ 🟢 50.0%  │
│ ...               │ ...   │ ...    │ ...   │ ...       │
└─────────────────────────────────────────────────────────┘
```

---

**Ready to deploy!** Once Railway is live, this dashboard will show real S3 usage data for all tenants. 📊
