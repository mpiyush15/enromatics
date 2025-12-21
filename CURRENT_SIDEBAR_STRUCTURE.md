# Current Sidebar Navigation Structure
*Generated from: backend/src/config/sidebarConfig.js*
*Last Updated: 21 December 2025*

---

## 🔵 TENANT ADMIN SIDEBAR (tenantAdmin)

```
🏠 Dashboard
📊 Institute Overview

🎓 Students
   ├─ 📋 All Students
   ├─ ➕ Add Student
   └─ 📅 Attendance

📚 Academics
   ├─ 📦 Batches
   ├─ 📅 Test Schedules
   ├─ 📝 Marks Entry
   ├─ 📊 Test Reports
   └─ ✅ Test Attendance

💰 Accounts
   ├─ 📊 Overview
   ├─ 🧾 Fee Receipts
   ├─ 💸 Expenses
   ├─ ↩️ Refunds
   └─ 📈 Reports

🎓 Scholarship Exams
   ├─ 📋 All Exams
   ├─ ➕ Create Exam
   ├─ 👥 Test Management
   ├─ 📊 Results Management
   └─ 🏆 Rewards Overview

📱 Social Media
   ├─ 🏠 Dashboard
   ├─ 📊 Campaigns
   ├─ 📊 Analytics
   ├─ 🎯 Create Ads
   ├─ 📅 Content Planner
   ├─ 🏢 Business Assets
   └─ ⚙️ Settings

💬 WhatsApp
   ├─ 📊 Dashboard
   ├─ 📨 Campaigns
   ├─ 👥 Contacts
   ├─ 📈 Reports
   └─ ⚙️ Settings

⚙️ Settings
   ├─ 👤 Profile
   ├─ 👥 Staff Management
   ├─ 📄 My Subscription
   ├─ 💳 Payment History
   ├─ 📋 View Plan
   └─ ❌ Cancel Subscription
```

**Total Sections: 9 | Total Links: 35**

---

## 🟢 TEACHER/STAFF SIDEBAR (teacher, staff)

```
🏠 Dashboard

🎓 Students
   ├─ 📋 All Students
   ├─ ➕ Add Student
   └─ 📅 Attendance

📚 Academics
   ├─ 📅 Test Schedules
   ├─ 📝 Marks Entry
   ├─ 📊 Test Reports
   └─ ✅ Test Attendance

🎓 Scholarship Exams
   ├─ 📋 All Exams
   └─ 👥 Test Management

💬 WhatsApp
   ├─ 📊 Dashboard
   ├─ 📨 Campaigns
   ├─ 👥 Contacts
   └─ 📈 Reports
```

**Total Sections: 5 | Total Links: 13**

---

## 🟣 STUDENT SIDEBAR (student)

```
🏠 Dashboard

🎓 Students
   └─ 👤 My Profile

📚 Academics
   ├─ 📊 Test Reports
   └─ 📖 My Tests
```

**Total Sections: 3 | Total Links: 4**

---

## 🔴 SUPERADMIN SIDEBAR (SuperAdmin)

```
🏠 Dashboard

📱 Social Media
   ├─ 🏠 Dashboard
   ├─ 📊 Campaigns
   ├─ 📊 Analytics
   ├─ 🎯 Create Ads
   ├─ 📅 Content Planner
   ├─ 🏢 Business Assets
   └─ ⚙️ Settings

💬 WhatsApp
   ├─ 📊 Dashboard
   ├─ 📨 Campaigns
   ├─ 👥 Contacts
   ├─ 📈 Reports
   └─ ⚙️ Settings

📋 Leads
👤 Tenants

💳 Billing
   ├─ 📄 Invoices
   ├─ 💰 Payments
   ├─ 📊 Subscribers
   └─ 💾 Storage Usage

📅 Demo Requests

⚙️ Settings
   ├─ 👤 Profile
   ├─ 📋 View Plan
   └─ ❌ Cancel Subscription
```

**Total Sections: 8 | Total Links: 22**

---

## 🟡 ACCOUNTANT SIDEBAR (accountant)

```
🏠 Dashboard

💰 Accounts
   ├─ 📊 Overview
   ├─ 🧾 Fee Receipts
   ├─ 💸 Expenses
   ├─ ↩️ Refunds
   └─ 📈 Reports

💬 WhatsApp
   ├─ 📊 Dashboard
   ├─ 📨 Campaigns
   └─ 📈 Reports
```

**Total Sections: 3 | Total Links: 9**

---

## 🟠 ADS MANAGER SIDEBAR (adsManager)

```
🏠 Dashboard

📱 Social Media
   ├─ 🏠 Dashboard
   ├─ 📊 Campaigns
   ├─ 📊 Analytics
   ├─ 🎯 Create Ads
   ├─ 📅 Content Planner
   ├─ 🏢 Business Assets
   └─ ⚙️ Settings

⚙️ Settings
   ├─ 👤 Profile
   ├─ 📋 View Plan
   └─ ❌ Cancel Subscription
```

**Total Sections: 3 | Total Links: 11**

---

## 🟤 COUNSELLOR SIDEBAR (counsellor)

```
🏠 Dashboard

🎓 Scholarship Exams
   └─ 📋 All Exams
```

**Total Sections: 2 | Total Links: 2**

---

## ⚙️ SIDEBAR TECHNICAL FEATURES

### Dynamic Features
- ✅ **Role-Based Filtering**: 8 roles supported (SuperAdmin, tenantAdmin, teacher, staff, student, accountant, adsManager, counsellor)
- ✅ **Tenant-Specific URLs**: Auto-replaces `[tenantId]` with actual tenant ID
- ✅ **Module-Based Visibility**: Links filtered by tenant's enabled modules
- ✅ **Dual Routing**: Separate `superAdminHref` and regular `href` for same feature

### UX Features
- ✅ **Auto-Expand**: Sections with active child automatically expand
- ✅ **Exact Match Highlighting**: Only active page highlighted (fixed double-highlight bug)
- ✅ **Collapsible Sections**: Click to expand/collapse
- ✅ **Mobile Responsive**: Slide-out on mobile, fixed on desktop
- ✅ **Loading States**: Shows skeleton while fetching

### Performance Features
- ✅ **SWR Caching**: 30-minute cache with no refetch on focus
- ✅ **Lazy Loading**: Links fetched only when needed
- ✅ **Dedupe Requests**: Prevents duplicate API calls

---

## 📂 Page Descriptions

### 🏠 Dashboard
- **Tenant**: Institute overview with student/revenue/attendance stats
- **SuperAdmin**: Platform-wide metrics, all tenants overview
- **Student**: Personal dashboard with upcoming tests and recent scores

### 📊 Institute Overview (Tenant Admin Only)
- Institute-specific analytics
- Revenue trends, student enrollment graphs
- Quick actions and recent activities

### 🎓 Students Section
- **All Students**: Search, filter, view student list
- **Add Student**: Registration form with auto roll number
- **Attendance**: Date-based attendance marking with filters
- **My Profile** (Student): View personal details, documents

### 📚 Academics Section
- **Batches**: Create/manage batches per course
- **Test Schedules**: Create tests with date/time/course/batch
- **Marks Entry**: Enter marks with auto-grading
- **Test Reports**: Analytics, class average, grade distribution
- **Test Attendance**: Mark who appeared for test
- **My Tests** (Student): View upcoming tests and scores

### 💰 Accounts Section
- **Overview**: Financial dashboard with revenue/expenses
- **Fee Receipts**: Generate receipts with QR codes
- **Expenses**: Track expenses by category
- **Refunds**: Process refunds with approval workflow
- **Reports**: Financial reports and trends

### 🎓 Scholarship Exams
- **All Exams**: List scholarship exams with filters
- **Create Exam**: Set up scholarship exam with rules
- **Test Management**: Create/manage scholarship tests
- **Results Management**: Publish results, declare winners
- **Rewards Overview**: Track rewards distribution

### 📱 Social Media
- **Dashboard**: Facebook/Instagram overview
- **Campaigns**: Create/manage social campaigns
- **Analytics**: Performance metrics, reach, engagement
- **Create Ads**: Ad creation wizard
- **Content Planner**: Schedule posts
- **Business Assets**: Manage FB/Instagram pages
- **Settings**: Connect/disconnect accounts

### 💬 WhatsApp
- **Dashboard**: WhatsApp Business API overview
- **Campaigns**: Send bulk messages using templates
- **Contacts**: Manage student/lead contacts
- **Reports**: Delivery status, read rates
- **Settings**: API configuration, webhook setup

### 📋 Leads (SuperAdmin)
- Lead management system
- Track demo requests and conversions

### 👤 Tenants (SuperAdmin)
- Manage all institutes
- View subscriptions, usage, billing

### 💳 Billing (SuperAdmin)
- **Invoices**: All generated invoices
- **Payments**: Payment tracking via Cashfree
- **Subscribers**: Active subscriptions list
- **Storage Usage**: S3 storage per tenant

### 📅 Demo Requests (SuperAdmin)
- View/manage demo requests from website
- Assign to sales team

### ⚙️ Settings
- **Profile**: Edit user profile
- **Staff Management**: Add/edit staff with role assignment
- **My Subscription**: View current plan details
- **Payment History**: Past payments
- **View Plan**: Plan features and limits
- **Cancel Subscription**: Cancel with confirmation

---

## 🔧 Implementation Details

**Backend Config**: `backend/src/config/sidebarConfig.js`
**Frontend Component**: `frontend/components/dashboard/Sidebar.tsx`
**API Route**: `/api/ui/sidebar` (with auth)
**Controller**: `backend/src/controllers/uiController.js`

**URL Pattern Examples**:
- Tenant User: `/dashboard/client/[tenantId]/students`
- SuperAdmin: `/dashboard/students` or `/dashboard/social`
- Student: `/student/dashboard`

---

**Last Verified**: 21 December 2025
**Source**: Live backend configuration
