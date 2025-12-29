// backend/config/sidebarConfig.js

export const sidebarLinks = [
  // === PRIORITY 1: Home (Staff & Students Only) ===
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["manager", "accountant", "teacher", "marketing", "staff", "employee", "counsellor", "adsManager", "student"],
    tenantSpecific: true,
  },

  // === PRIORITY 2: Institute Overview (Tenant Admins) ===
  {
    href: "/dashboard/institute-overview",
    label: "📊 Institute Overview",
    roles: ["tenantAdmin"],
    tenantSpecific: true,
  },

  // === PRIORITY 3: Students ===
  {
    label: "🎓 Students",
    href: "#",
    roles: ["tenantAdmin", "manager", "accountant", "student"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Students", href: "/dashboard/students", roles: ["tenantAdmin", "manager", "accountant"] },
      { label: "➕ Add Student", href: "/dashboard/students/add", roles: ["tenantAdmin", "manager", "accountant"] },
      { label: "📅 Attendance", href: "/dashboard/students/attendance", roles: ["tenantAdmin", "manager"] },
      { label: "👤 My Profile", href: "/student/dashboard", roles: ["student"] },
    ]
  },

  // === PRIORITY 4: Academics (with Tests nested) ===
  {
    label: "📚 Academics",
    href: "#",
    roles: ["tenantAdmin", "manager", "student"],
    tenantSpecific: true,
    children: [
      { label: "📦 Batches", href: "/dashboard/academics/batches", roles: ["tenantAdmin", "manager"] },
      {
        label: "📝 Tests",
        href: "#",
        roles: ["tenantAdmin", "manager", "student"],
        children: [
          { label: "📅 Test Schedules", href: "/dashboard/academics/schedules", roles: ["tenantAdmin", "manager"] },
          { label: "✅ Test Attendance", href: "/dashboard/academics/attendance", roles: ["tenantAdmin", "manager"] },
          { label: "📊 Marks Entry", href: "/dashboard/academics/marks", roles: ["tenantAdmin", "manager"] },
          { label: "📊 Test Reports", href: "/dashboard/academics/reports", roles: ["tenantAdmin", "manager", "student"] },
          { label: "📖 My Tests", href: "/dashboard/academics/my-tests", roles: ["student"] },
        ]
      },
    ]
  },

  // === PRIORITY 5: Accounts ===
  {
    label: "💰 Accounts",
    href: "#",
    roles: ["tenantAdmin", "accountant"],
    tenantSpecific: true,
    children: [
      { label: "📊 Overview", href: "/dashboard/accounts/overview", roles: ["tenantAdmin", "accountant"] },
      { label: "💳 All Transactions", href: "/dashboard/accounts/transactions", roles: ["tenantAdmin", "accountant"] },
      { label: "🧾 Fee Receipts", href: "/dashboard/accounts/receipts", roles: ["tenantAdmin", "accountant"] },
      { label: "💸 Expenses", href: "/dashboard/accounts/expenses", roles: ["tenantAdmin", "accountant"] },
      { label: "↩️ Refunds", href: "/dashboard/accounts/refunds", roles: ["tenantAdmin", "accountant"] },
      { label: "📈 Reports", href: "/dashboard/accounts/reports", roles: ["tenantAdmin", "accountant"] },
    ]
  },

  // === PRIORITY 6: Exams & Scholarships ===
  {
    label: "🎓 Exams & Scholarships",
    href: "#",
    roles: ["tenantAdmin", "counsellor", "teacher", "staff"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Exams", href: "/dashboard/client/[tenantId]/scholarship-exams", roles: ["tenantAdmin", "counsellor", "teacher", "staff"] },
      { label: "➕ Create Exam", href: "/dashboard/client/[tenantId]/scholarship-exams/create", roles: ["tenantAdmin"] },
      { label: "👥 Test Management", href: "/dashboard/client/[tenantId]/scholarship-tests", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "📊 Results Management", href: "/dashboard/client/[tenantId]/scholarship-results", roles: ["tenantAdmin", "teacher"] },
      { label: "🏆 Rewards Overview", href: "/dashboard/client/[tenantId]/scholarship-rewards", roles: ["tenantAdmin"] },
    ]
  },

  // === PRIORITY 7: Communication (WhatsApp + Social Media nested) ===
  {
    label: "💬 Communication",
    href: "#",
    roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "manager", "marketing"],
    children: [
      {
        label: "💬 WhatsApp",
        href: "#",
        roles: ["SuperAdmin", "tenantAdmin", "manager", "marketing"],
        children: [
          { label: "� Inbox", href: "/dashboard/whatsapp/inbox", roles: ["SuperAdmin", "tenantAdmin"] },
          { label: "�📊 Dashboard", href: "/dashboard/whatsapp", roles: ["SuperAdmin", "tenantAdmin", "manager", "marketing"] },
          { label: "📨 Campaigns", href: "/dashboard/whatsapp/campaigns", roles: ["SuperAdmin", "tenantAdmin", "manager", "marketing"] },
          { label: "👥 Contacts", href: "/dashboard/whatsapp/contacts", roles: ["SuperAdmin", "tenantAdmin", "manager", "marketing"] },
          { label: "📈 Reports", href: "/dashboard/whatsapp/reports", roles: ["SuperAdmin", "tenantAdmin", "manager", "marketing"] },
          { label: "⚙️ Settings", href: "/dashboard/whatsapp/settings", roles: ["SuperAdmin", "tenantAdmin"] },
        ],
      },
      {
        label: "📱 Social Media",
        href: "#",
        roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"],
        children: [
          { 
            label: "🏠 Dashboard", 
            href: "/dashboard/social", 
            superAdminHref: "/dashboard/social",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
          { 
            label: "📊 Campaigns", 
            href: "/dashboard/client/[tenantId]/social/campaigns", 
            superAdminHref: "/dashboard/social/campaigns",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
          { 
            label: "📊 Analytics", 
            href: "/dashboard/client/[tenantId]/social/analytics", 
            superAdminHref: "/dashboard/social/analytics",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
          { 
            label: "🎯 Create Ads", 
            href: "/dashboard/client/[tenantId]/social/create-ads", 
            superAdminHref: "/dashboard/social/create-ads",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
          { 
            label: "📅 Content Planner", 
            href: "/dashboard/client/[tenantId]/social/content-planner", 
            superAdminHref: "/dashboard/social/content-planner",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
          { 
            label: "🏢 Business Assets", 
            href: "/dashboard/client/[tenantId]/social/business-assets", 
            superAdminHref: "/dashboard/social/business-assets",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
          { 
            label: "⚙️ Settings", 
            href: "/dashboard/client/[tenantId]/social/settings", 
            superAdminHref: "/dashboard/social/settings",
            roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin", "marketing"] 
          },
        ],
      },
    ],
  },

  // === PRIORITY 7A: SuperAdmin Only - Overview ===
  {
    href: "/dashboard/superadmin",
    label: "📊 SuperAdmin Overview",
    roles: ["SuperAdmin"],
  },

  // === PRIORITY 7B: SuperAdmin Only - Plans & Offers (Unified) ===
  {
    label: "💰 Plans & Offers",
    href: "#",
    roles: ["SuperAdmin"],
    children: [
      { label: "📋 Plans Management", href: "/dashboard/superadmin/plans", roles: ["SuperAdmin"] },
      { label: "🎁 All Offers", href: "/dashboard/admin/offers", roles: ["SuperAdmin"] },
      { label: "➕ Create Offer", href: "/dashboard/admin/offers/create", roles: ["SuperAdmin"] },
    ],
  },

  // === PRIORITY 8: CRM / Lead Management (Tenant-specific only) ===
  {
    href: "/dashboard/lead",
    label: "📊 CRM / Leads",
    roles: ["tenantAdmin", "manager", "counsellor"],
    tenantSpecific: true,
  },
  
  // === PRIORITY 9: SuperAdmin Only - Tenants ===
  {
    href: "/dashboard/tenants",
    label: "🏢 Tenants",
    roles: ["SuperAdmin", "Admin"],
  },

  // === PRIORITY 10: SuperAdmin Only - Billing ===
  {
    label: "💳 Billing",
    href: "#",
    roles: ["SuperAdmin"],
    children: [
      { label: "📄 Invoices", href: "/dashboard/invoices", roles: ["SuperAdmin"] },
      { label: "💰 Payments", href: "/dashboard/payments", roles: ["SuperAdmin"] },
      { label: "📊 Subscribers", href: "/dashboard/subscribers", roles: ["SuperAdmin"] },
      { label: "💾 Storage Usage", href: "/dashboard/storage", roles: ["SuperAdmin"] },
    ],
  },

  // === PRIORITY 12: SuperAdmin Only - SuperCRM (Sales Management) ===
  {
    label: "🚀 SuperCRM",
    href: "#",
    roles: ["SuperAdmin"],
    children: [
      { label: "📊 CRM Dashboard", href: "/dashboard/supercrm", roles: ["SuperAdmin"] },
      { label: "📝 Form Leads", href: "/dashboard/supercrm/form-leads", roles: ["SuperAdmin"] },
      { label: "📅 Demo Requests", href: "/dashboard/supercrm/demo-requests", roles: ["SuperAdmin"] },
      { label: "📋 All Leads", href: "/dashboard/supercrm/all-leads", roles: ["SuperAdmin"] },
    ],
  },

  // === PRIORITY 12A: Website Analytics (SuperAdmin & Admins) ===
  {
    href: "/dashboard/website-analytics",
    label: "📈 Website Analytics",
    roles: ["SuperAdmin", "Admin"],
  },

  // === PRIORITY 13: Institute Settings (Staff + Billing) ===
  {
    label: "⚙️ Institute Settings",
    href: "#",
    roles: ["tenantAdmin", "Admin"],
    children: [
      { label: "👥 Staff Management", href: "/dashboard/client/[tenantId]/settings/staff", roles: ["tenantAdmin", "Admin"] },
      { label: "📄 My Subscription", href: "/dashboard/my-subscription", roles: ["tenantAdmin"] },
      { label: "💳 Payment History", href: "/dashboard/payments", roles: ["tenantAdmin"] },
    ],
  },

  // === PRIORITY 14: Personal Settings (Profile + Plan) ===
  {
    label: "👤 Personal",
    href: "#",
    roles: ["employee", "student", "adsManager", "tenantAdmin", "Admin", "teacher", "manager", "accountant", "marketing"],
    children: [
      { label: "👤 Profile", href: "/dashboard/profile", roles: ["employee", "student", "adsManager", "tenantAdmin", "Admin", "teacher", "manager", "accountant", "marketing"] },
      { label: "⚙️ Settings", href: "/dashboard/settings", roles: ["employee", "student", "adsManager", "tenantAdmin", "Admin", "teacher", "manager", "accountant", "marketing"] },
      { label: "📋 View Plan", href: "/dashboard/subscription/view", roles: ["tenantAdmin", "Admin"] },
      { label: "❌ Cancel Subscription", href: "/dashboard/subscription/cancel", roles: ["tenantAdmin", "Admin"] },
    ],
  },
];
