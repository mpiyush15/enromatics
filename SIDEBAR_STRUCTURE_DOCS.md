# 📚 SIDEBAR STRUCTURE & PAGE DOCUMENTATION

> **Last Updated**: 21 December 2025  
> **Status**: Complete documentation of all sidebar links and page functionality

---

## 🏗️ SIDEBAR ARCHITECTURE

### **How it Works:**
1. **Backend Configuration** (`backend/src/config/sidebarConfig.js`)
   - Defines all sidebar links with role-based access
   - Auto-injects `[tenantId]` for tenant-specific routes
   - Supports nested sections with children

2. **API Route** (`/api/ui/sidebar`)
   - Fetches sidebar config based on user role
   - Returns filtered links user has access to
   - Cached for 30 minutes via SWR

3. **Frontend Component** (`components/dashboard/Sidebar.tsx`)
   - Renders sidebar dynamically from API
   - Auto-expands sections with active pages
   - Mobile responsive with slide-in/out

### **Features:**
- ✅ Role-based access control
- ✅ Automatic tenantId injection
- ✅ Exact match highlighting (no double highlights)
- ✅ Auto-expand active sections
- ✅ 30-minute client-side cache
- ✅ Mobile responsive
- ✅ Logout button at bottom

---

## 📋 SIDEBAR SECTIONS & PAGES

### **🏠 PRIORITY 1: Dashboard Home**
**Access**: All roles (SuperAdmin, Admin, employee, adsManager, student, tenantAdmin, teacher, staff)

| Label | Route | What It Does |
|-------|-------|--------------|
| 🏠 Dashboard | `/dashboard/home` | Main analytics dashboard - shows overview stats, charts, and KPIs for the user's role |

---

### **📊 PRIORITY 2: Institute Overview**
**Access**: `tenantAdmin` only

| Label | Route | What It Does |
|-------|-------|--------------|
| 📊 Institute Overview | `/dashboard/client/[tenantId]/institute-overview` | Shows comprehensive institute statistics - total students, revenue, attendance rates, upcoming events |

---

### **🎓 PRIORITY 3: Core Modules**

#### **1. Students Module**
**Access**: `tenantAdmin`, `teacher`, `staff`, `student`

| Label | Route | What It Does | Access |
|-------|-------|--------------|--------|
| 📋 All Students | `/dashboard/client/[tenantId]/students` | List all students with search/filter, view profiles, edit details | tenantAdmin, teacher, staff |
| ➕ Add Student | `/dashboard/client/[tenantId]/students/add` | Form to add new student - personal info, academic details, contact info | tenantAdmin, teacher, staff |
| 📅 Attendance | `/dashboard/client/[tenantId]/students/attendance` | Mark daily attendance by date/batch, upload CSV bulk attendance | tenantAdmin, teacher, staff |
| 👤 My Profile | `/student/dashboard` | Student's personal dashboard - view own profile, grades, attendance | student only |

---

#### **2. Academics Module**
**Access**: `tenantAdmin`, `teacher`, `staff`, `student`

| Label | Route | What It Does | Access |
|-------|-------|--------------|--------|
| 📦 Batches | `/dashboard/client/[tenantId]/academics/batches` | Create/manage batches - group students by course/batch/section | tenantAdmin only |
| 📅 Test Schedules | `/dashboard/client/[tenantId]/academics/schedules` | Create tests with name, date, subject, course, batch, total marks | tenantAdmin, teacher, staff |
| 📝 Marks Entry | `/dashboard/client/[tenantId]/academics/marks` | Select test → Enter marks for each student, calculate percentages | tenantAdmin, teacher, staff |
| 📊 Test Reports | `/dashboard/client/[tenantId]/academics/reports` | View test performance - toppers, averages, pass/fail rates | All |
| ✅ Test Attendance | `/dashboard/client/[tenantId]/academics/attendance` | **NEW UI**: Professional attendance page with filters (test/batch/roll), toggle present/absent, stats dashboard | tenantAdmin, teacher, staff |
| 📖 My Tests | `/dashboard/client/[tenantId]/academics/my-tests` | Student view - see their own test scores and attendance | student only |

**✨ RECENT UPDATES (Test Attendance):**
- ✅ Redesigned with professional UI (4-card stats dashboard)
- ✅ Search by name/roll number/email
- ✅ Filter by batch dropdown
- ✅ Filter by status (all/present/absent)
- ✅ Quick actions: Mark All Present, Mark All Absent
- ✅ Large toggle buttons (Present/Absent) with gradient colors
- ✅ Shows attendance percentage in real-time
- ✅ Fixed infinite re-fetch loop bug
- ✅ Fixed boolean logic bugs (using `??` operator)
- ✅ Fixed batch name display issue

---

#### **3. Accounts Module**
**Access**: `tenantAdmin`, `accountant`

| Label | Route | What It Does |
|-------|-------|--------------|
| 📊 Overview | `/dashboard/client/[tenantId]/accounts/overview` | Dashboard showing total revenue, expenses, pending fees, profit/loss |
| 🧾 Fee Receipts | `/dashboard/client/[tenantId]/accounts/receipts` | Generate fee receipts - student selection, amount, payment mode |
| 💸 Expenses | `/dashboard/client/[tenantId]/accounts/expenses` | Record expenses - category, amount, date, description, receipts |
| ↩️ Refunds | `/dashboard/client/[tenantId]/accounts/refunds` | Process refunds - student selection, reason, refund amount |
| 📈 Reports | `/dashboard/client/[tenantId]/accounts/reports` | Financial reports - monthly revenue, expense breakdown, profit margins |

---

#### **4. Scholarship Exams Module**
**Access**: `tenantAdmin`, `counsellor`, `teacher`, `staff`

| Label | Route | What It Does | Access |
|-------|-------|--------------|--------|
| 📋 All Exams | `/dashboard/client/[tenantId]/scholarship-exams` | List all scholarship exams - view details, registrations, status | All |
| ➕ Create Exam | `/dashboard/client/[tenantId]/scholarship-exams/create` | Create new scholarship exam - name, date, eligibility, rewards | tenantAdmin |
| 👥 Test Management | `/dashboard/client/[tenantId]/scholarship-tests` | Manage exam papers - question sets, time limits, marking schemes | tenantAdmin, teacher, staff |
| 📊 Results Management | `/dashboard/client/[tenantId]/scholarship-results` | Publish results, assign ranks, calculate percentiles | tenantAdmin, teacher |
| 🏆 Rewards Overview | `/dashboard/client/[tenantId]/scholarship-rewards` | Manage scholarships - amount, criteria, awarded students | tenantAdmin |

---

### **📱 PRIORITY 4: Marketing & Communication**

#### **5. Social Media Module**
**Access**: `employee`, `adsManager`, `Admin`, `SuperAdmin`, `tenantAdmin`

| Label | Route (Tenant) | Route (SuperAdmin) | What It Does |
|-------|----------------|---------------------|--------------|
| 📊 Dashboard | `/dashboard/client/[tenantId]/social` | `/dashboard/social` | Social media analytics - reach, engagement, follower growth across platforms |
| 🎯 Campaigns | `/dashboard/client/[tenantId]/social/campaigns` | `/dashboard/social/campaigns` | Create/manage ad campaigns - Facebook, Instagram ad sets with targeting |
| 📊 Analytics | `/dashboard/client/[tenantId]/social/analytics` | `/dashboard/social/analytics` | Deep dive analytics - post performance, demographics, best posting times |
| 🎯 Create Ads | `/dashboard/client/[tenantId]/social/create-ads` | `/dashboard/social/create-ads` | Ad creation wizard - design ads, set budget, choose audience, schedule |
| 📅 Content Planner | `/dashboard/client/[tenantId]/social/content-planner` | `/dashboard/social/content-planner` | Schedule posts across platforms - calendar view, bulk upload, auto-post |
| 🏢 Business Assets | `/dashboard/client/[tenantId]/social/business-assets` | `/dashboard/social/business-assets` | Manage connected accounts - Facebook Pages, Instagram Business profiles |
| ⚙️ Settings | `/dashboard/client/[tenantId]/social/settings` | `/dashboard/social/settings` | Connect/disconnect social accounts, API tokens, permissions |

**🔑 KEY FEATURE**: Dual routing - tenant-specific paths for institutes, global paths for SuperAdmin

---

#### **6. WhatsApp Module**
**Access**: `SuperAdmin`, `tenantAdmin`, `teacher`, `accountant`

| Label | Route | What It Does |
|-------|-------|--------------|
| 📊 Dashboard | `/dashboard/client/[tenantId]/whatsapp` | WhatsApp Business API dashboard - message stats, delivery rates |
| 📨 Campaigns | `/dashboard/client/[tenantId]/whatsapp/campaigns` | Bulk WhatsApp messaging - templates, student/parent groups, scheduling |
| 👥 Contacts | `/dashboard/client/[tenantId]/whatsapp/contacts` | Manage WhatsApp contacts - import students, parents, staff numbers |
| 📈 Reports | `/dashboard/client/[tenantId]/whatsapp/reports` | Campaign reports - sent, delivered, read, replied messages |
| ⚙️ Settings | `/dashboard/client/[tenantId]/whatsapp/settings` | WhatsApp Business API setup - phone number, verification, templates |

---

### **⚙️ PRIORITY 5: Admin Management**
**Access**: `SuperAdmin`, `Admin` (platform-level management)

| Label | Route | What It Does | Access |
|-------|-------|--------------|--------|
| 📋 Leads | `/dashboard/lead` | CRM for managing trial requests - follow-ups, conversion tracking | SuperAdmin, Admin |
| 👤 Tenants | `/dashboard/tenants` | Manage all institutes - view plans, suspend accounts, usage stats | SuperAdmin, Admin |

---

#### **💳 Billing (Sub-section)**
**Access**: `SuperAdmin` only

| Label | Route | What It Does |
|-------|-------|--------------|
| 📄 Invoices | `/dashboard/invoices` | Generate invoices for tenants - subscription fees, add-ons |
| 💰 Payments | `/dashboard/payments` | Track payments - Razorpay/Cashfree integration, payment history |
| 📊 Subscribers | `/dashboard/subscribers` | Manage subscriptions - active/expired plans, renewals |
| 💾 Storage Usage | `/dashboard/storage` | Monitor S3 storage - per-tenant usage, cost breakdown |

---

| Label | Route | What It Does |
|-------|-------|--------------|
| 📅 Demo Requests | `/dashboard/demo-requests` | View demo requests from website - schedule calls, mark completed |

---

### **🔧 PRIORITY 6: User Settings**

#### **⚙️ Settings (Sub-section)**
**Access**: `employee`, `student`, `adsManager`, `tenantAdmin`, `Admin`

| Label | Route | What It Does | Access |
|-------|-------|--------------|--------|
| 👤 Profile | `/dashboard/profile` | Edit personal profile - name, email, password, avatar | All |
| 👥 Staff Management | `/dashboard/client/[tenantId]/settings/staff` | Add/remove staff - assign roles (teacher, accountant, counsellor) | tenantAdmin, Admin |
| 📄 My Subscription | `/dashboard/client/[tenantId]/my-subscription` | View current plan - features, limits, renewal date | tenantAdmin |
| 💳 Payment History | `/dashboard/client/[tenantId]/payments` | View payment history - invoices, receipts, download PDFs | tenantAdmin |
| 📋 View Plan | `/dashboard/subscription/view` | Compare plans - features, pricing, upgrade options | All |
| ❌ Cancel Subscription | `/dashboard/subscription/cancel` | Cancel subscription - feedback form, retention offers | All |

---

## 🔐 ROLE-BASED ACCESS CONTROL

### **Role Hierarchy:**

```
SuperAdmin (Platform Owner)
├── Admin (Platform Manager)
├── tenantAdmin (Institute Owner)
│   ├── teacher
│   ├── staff
│   ├── accountant
│   ├── counsellor
│   └── student
├── adsManager (Marketing)
└── employee (Platform Staff)
```

### **Access Summary:**

| Role | Access Level | Typical Routes |
|------|--------------|----------------|
| **SuperAdmin** | Full platform access | All routes - tenants, billing, demo requests |
| **Admin** | Platform management | Leads, tenants, social media |
| **tenantAdmin** | Full institute access | Students, academics, accounts, settings, staff |
| **teacher** | Teaching operations | Students, academics (schedules/marks/attendance), WhatsApp |
| **staff** | Administrative support | Students, academics (read-only in some areas) |
| **accountant** | Financial operations | Accounts, WhatsApp (fee reminders) |
| **counsellor** | Enrollment & exams | Scholarship exams, leads |
| **student** | Personal access | My Profile, My Tests, Test Reports (own) |
| **adsManager** | Marketing operations | Social media module |
| **employee** | Platform operations | Social media, dashboard |

---

## 🔄 TENANT-SPECIFIC ROUTING

### **How It Works:**
Routes with `tenantSpecific: true` automatically inject `[tenantId]`:

**Before (config):**
```javascript
{ href: "/dashboard/students", roles: ["tenantAdmin"] }
```

**After (runtime):**
```javascript
// For tenant user:
"/dashboard/client/12345/students"

// For SuperAdmin:
"/dashboard/students" (no injection)
```

### **Affected Routes:**
- Institute Overview
- Students (all pages)
- Academics (all pages)
- Accounts (all pages)
- Scholarship Exams (all pages)
- WhatsApp (all pages)
- Settings → Staff Management

---

## 🐛 RECENT BUG FIXES

### **1. Infinite Re-fetch Loop** ✅ FIXED
**Issue**: useEffect dependency array included `fetchTestAndStudents` function  
**Solution**: Wrapped with `useCallback`, only depends on `testId`

### **2. Double Sidebar Highlighting** ✅ FIXED
**Issue**: Both `/students` and `/students/attendance` were highlighted  
**Solution**: Changed to exact match only (`pathname === href`)

### **3. Boolean Logic Bugs** ✅ FIXED
**Issue**: `current?.present || false` destroys `false` state  
**Solution**: Use `??` operator instead: `current?.present ?? false`

### **4. Batch Name Not Showing** ✅ FIXED
**Issue**: API returns `batch.name` or `batchName`, interface expects `batch`  
**Solution**: Normalize data: `batch: s.batch?.name || s.batchName || ""`

### **5. Attendance Save 400 Error** ✅ FIXED
**Issue**: testId sent in query string, BFF expects it in body  
**Solution**: Moved testId to POST body: `{ testId, attendanceData }`

---

## 📊 SIDEBAR METRICS

- **Total Sections**: 10 (6 main + 4 nested)
- **Total Pages**: 60+
- **Roles Supported**: 10 different roles
- **Tenant-Specific Routes**: 35+
- **SuperAdmin Exclusive**: 12 pages
- **Student Access**: 4 pages
- **Most Complex Module**: Academics (6 sub-pages)

---

## 🚀 UPCOMING FEATURES

- [ ] AI-powered sidebar search
- [ ] Pinned/favorite pages
- [ ] Recent pages history
- [ ] Custom sidebar themes
- [ ] Drag-and-drop reordering

---

## 💡 BEST PRACTICES

### **For Developers:**
1. Always use `useCallback` for fetch functions in useEffect
2. Use `??` operator for boolean defaults, not `||`
3. Normalize API data immediately after fetching
4. Check role access in both frontend and backend
5. Cache sidebar config (30 min default)

### **For Users:**
1. Sidebar auto-expands to show your current page
2. Click section headers to expand/collapse
3. Active page highlighted in blue
4. Mobile: Swipe to open/close sidebar
5. Logout button always at bottom

---

## 📞 SUPPORT

**Questions about sidebar structure?**
- Check role access in `sidebarConfig.js`
- Verify route exists in file structure
- Test with different roles to see visibility

**Found a bug?**
- Check console for errors
- Verify API response from `/api/ui/sidebar`
- Clear cache and reload (Cmd+Shift+R)

---

**End of Documentation**  
*This is a living document - update as features are added/changed*
