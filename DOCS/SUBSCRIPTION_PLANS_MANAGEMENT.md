# Subscription Plans Management Module - Complete Documentation

## 🎯 Overview
The Subscription Plans Management module allows SuperAdmins to create, read, update, and delete subscription plans directly from the dashboard. This enables dynamic management of pricing, features, quotas, and billing cycles without code changes.

---

## 📁 Architecture

### Backend
- **Model**: `/backend/src/models/SubscriptionPlan.js`
- **Routes**: `/backend/src/routes/subscriptionPlansRoutes.js`

### Frontend
- **BFF Routes**: 
  - `/frontend/app/api/subscription-plans/route.ts` (GET all, POST create)
  - `/frontend/app/api/subscription-plans/[id]/route.ts` (GET single, PUT update, DELETE)
- **UI Page**: `/frontend/app/dashboard/superadmin/plans/page.tsx`

### Navigation
- **Sidebar Config**: `/backend/src/config/sidebarConfig.js`
- **Link**: "💰 Plans Management" → `/dashboard/superadmin/plans`

---

## 📊 Database Schema

### SubscriptionPlan Collection
```javascript
{
  // Basic Info
  name: String (unique) - "Trial", "Basic", "Pro", "Enterprise"
  id: String (unique) - "trial", "basic", "pro", "enterprise"
  description: String
  
  // Pricing
  monthlyPrice: Mixed - number | "Free" | "Custom"
  annualPrice: Mixed - number | "Free" | "Custom"
  
  // Quotas
  quotas: {
    students: Mixed - number | "Unlimited" | "Trial Access"
    staff: Mixed - number | "Unlimited" | "Trial Access"
    storage: String - "Standard", "Enhanced", "Unlimited"
    concurrentTests: Number
  }
  
  // Features
  features: [String]
  highlightFeatures: [String]
  
  // UI Settings
  buttonLabel: String (default: "Get Started")
  popular: Boolean (for badge)
  
  // Status
  status: "active" | "inactive" | "archived"
  isVisible: Boolean
  
  // Metadata
  createdBy: ObjectId (ref: User)
  updatedBy: ObjectId (ref: User)
  timestamps: true (createdAt, updatedAt)
}
```

---

## 🔌 API Endpoints

### All endpoints require SuperAdmin role

#### GET /api/subscription-plans
**List all plans with pagination**
```bash
GET /api/subscription-plans?page=1&limit=10&status=active&isVisible=true
```

**Response:**
```json
{
  "success": true,
  "plans": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "pages": 1
  }
}
```

#### GET /api/subscription-plans/:id
**Get single plan details**
```bash
GET /api/subscription-plans/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "pro",
    "name": "Pro",
    "description": "Advanced features for growing institutes",
    "monthlyPrice": 2499,
    "annualPrice": 20999,
    "quotas": {
      "students": 300,
      "staff": 25,
      "storage": "Enhanced",
      "concurrentTests": 3
    },
    "features": ["Up to 300 students", "Up to 25 staff accounts", ...],
    "highlightFeatures": ["300 Students", "25 Staff", "Mobile App"],
    "popular": true,
    "status": "active",
    "isVisible": true,
    "createdAt": "2025-12-26T10:00:00Z",
    "updatedAt": "2025-12-26T10:00:00Z"
  }
}
```

#### POST /api/subscription-plans
**Create new plan**
```bash
POST /api/subscription-plans
Content-Type: application/json

{
  "name": "Pro",
  "id": "pro",
  "description": "Advanced features for growing institutes",
  "monthlyPrice": 2499,
  "annualPrice": 20999,
  "quotas": {
    "students": 300,
    "staff": 25,
    "storage": "Enhanced",
    "concurrentTests": 3
  },
  "features": ["Up to 300 students", "Up to 25 staff accounts", ...],
  "highlightFeatures": ["300 Students", "25 Staff", "Mobile App"],
  "buttonLabel": "Get Started",
  "popular": true,
  "status": "active",
  "isVisible": true
}
```

**Response:** Created plan with 201 status

#### PUT /api/subscription-plans/:id
**Update existing plan**
```bash
PUT /api/subscription-plans/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "monthlyPrice": 2999,
  "annualPrice": 24999,
  "quotas": {
    "students": 400,
    "staff": 30,
    "storage": "Enhanced",
    "concurrentTests": 3
  }
  // Only fields being updated need to be sent
}
```

**Response:** Updated plan

#### DELETE /api/subscription-plans/:id
**Delete plan**
```bash
DELETE /api/subscription-plans/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

#### GET /api/subscription-plans/public/all
**Get all public plans (no auth required - for pricing page)**
```bash
GET /api/subscription-plans/public/all
```

---

## 🖥️ Frontend UI Features

### Plans Management Dashboard
**Location:** `/dashboard/superadmin/plans`

#### Features:
1. **List View**
   - Display all plans in a grid/card layout
   - Show plan name, description, prices, quotas
   - Display status (active/inactive) and visibility icons
   - Action buttons: Edit, Delete

2. **Create Plan Form**
   - Plan name (required)
   - Plan ID (required, auto-lowercase, disabled on edit)
   - Description (required)
   - Monthly & annual pricing
   - Quota settings (students, staff)
   - Features list management
   - UI settings (popular badge, button label)
   - Status toggle (active/inactive)
   - Visibility toggle

3. **Edit Plan**
   - Click "Edit" button to populate form
   - All fields updatable except Plan ID
   - Validates name uniqueness (excluding self)

4. **Delete Plan**
   - Confirmation dialog before deletion
   - Removes plan from system permanently

5. **Form Validation**
   - Required field validation
   - Name uniqueness check
   - Toast notifications for success/error

---

## 🔗 BFF Routes

### /api/subscription-plans (route.ts)
- Proxies GET (fetch all) to backend
- Proxies POST (create) to backend
- Includes authentication headers and cookies
- 20 second timeout

### /api/subscription-plans/[id] (route.ts)
- Proxies GET (single) to backend
- Proxies PUT (update) to backend
- Proxies DELETE to backend

---

## 🔐 Security

### Authentication
- All endpoints require authentication via JWT token
- Token passed in cookies and Authorization header

### Authorization
- All plan management endpoints restricted to **SuperAdmin** role
- Public endpoint (`/public/all`) available without authentication

### Validation
- Backend validates all inputs
- Name and ID must be unique
- Status values restricted to enum
- Price fields can be number, "Free", or "Custom"

---

## 📝 Usage Examples

### Creating a New Plan
1. Go to **Dashboard** → **Plans Management**
2. Click **"Create New Plan"** button
3. Fill in plan details:
   - Name: "Premium"
   - ID: "premium"
   - Description: "Premium subscription..."
   - Monthly Price: 3999
   - Annual Price: 39999
   - Max Students: 500
   - Max Staff: 50
   - Storage: "Enhanced"
   - Popular: Yes (toggle on)
4. Click **"Create Plan"** button
5. See success toast and refresh list

### Editing Existing Plan
1. Find plan in list
2. Click **"Edit"** button
3. Modify fields (Plan ID stays locked)
4. Click **"Update Plan"** button
5. Confirm changes

### Deleting a Plan
1. Find plan in list
2. Click **"Delete"** button
3. Confirm deletion
4. Plan removed from system

---

## 🔄 Integration with Pricing Page

The pricing page (`/plans`) can be updated to fetch plans from the database instead of hardcoding them:

```typescript
// Future enhancement:
const fetchPlans = async () => {
  const res = await fetch('/api/subscription-plans/public/all');
  const data = await res.json();
  return data.plans;
};
```

This allows:
- Real-time price updates without redeploying
- A/B testing different pricing strategies
- Regional pricing variations
- Seasonal promotions

---

## 🚀 Next Steps / Future Enhancements

1. **Bulk Operations**
   - Bulk update prices
   - Bulk toggle visibility
   - Bulk change status

2. **Advanced Features**
   - Plan cloning
   - Version history tracking
   - Pricing templates
   - Regional pricing variants

3. **Analytics**
   - Popular plans by region
   - Conversion rates per plan
   - Customer lifetime value by plan

4. **Integration**
   - Auto-sync with payment gateway
   - Integration with offer management
   - Dynamic pricing based on demand

5. **Frontend Updates**
   - Update `/plans` to fetch from database
   - Update `/subscription/checkout` to use DB plans
   - Dynamic feature comparison table

---

## 📚 Related Modules

- **Offers & Promotions** - `/dashboard/admin/offers`
- **Subscribers** - `/dashboard/subscribers`
- **Billing** - `/dashboard/invoices`, `/dashboard/payments`

---

## ✅ Deployment Checklist

- [ ] Backend model deployed
- [ ] Backend routes deployed  
- [ ] BFF routes deployed
- [ ] Frontend UI deployed
- [ ] Sidebar config updated
- [ ] Database migrations run (if needed)
- [ ] Tested create plan flow
- [ ] Tested update plan flow
- [ ] Tested delete plan flow
- [ ] Tested public endpoint
- [ ] Verified SuperAdmin-only access

---

## 🐛 Troubleshooting

### Plans not loading
- Check SuperAdmin role on user
- Verify backend route is deployed
- Check browser console for errors
- Verify authentication tokens

### Can't create plan
- Ensure plan name/ID is unique
- Check all required fields filled
- Verify SuperAdmin permissions
- Check backend logs

### Changes not reflected
- Check plan status is "active" and "isVisible" is true
- Refresh pricing page cache
- Verify update API response

---

**Last Updated:** December 26, 2025
**Module Status:** ✅ Complete & Ready for Production
