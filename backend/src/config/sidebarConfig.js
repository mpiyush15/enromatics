// backend/config/sidebarConfig.js

export const sidebarLinks = [
  // === PRIORITY 1: Dashboard Home ===
  {
    href: "/dashboard/home",
    label: "🏠 Dashboard",
    roles: ["SuperAdmin", "Admin", "employee", "student", "adsManager", "tenantAdmin", "teacher", "staff"],
  },
  
  // === PRIORITY 2: Institute Overview (Tenant Admins) ===
  {
    href: "/dashboard/institute-overview",
    label: "📊 Institute Overview",
    roles: ["tenantAdmin"],
    tenantSpecific: true,
  },

  // === PRIORITY 3: Core Modules (Tenant Operations) ===
  {
    label: "🎓 Students",
    href: "#",
    roles: ["tenantAdmin", "teacher", "staff", "student"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Students", href: "/dashboard/students", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "➕ Add Student", href: "/dashboard/students/add", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "📅 Attendance", href: "/dashboard/students/attendance", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "👤 My Profile", href: "/student/dashboard", roles: ["student"] },
    ]
  },

  {
    label: "📚 Academics",
    href: "#",
    roles: ["tenantAdmin", "teacher", "staff", "student"],
    tenantSpecific: true,
    children: [
      { label: "📦 Batches", href: "/dashboard/academics/batches", roles: ["tenantAdmin"] },
      { label: "📅 Test Schedules", href: "/dashboard/academics/schedules", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "📝 Marks Entry", href: "/dashboard/academics/marks", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "📊 Test Reports", href: "/dashboard/academics/reports", roles: ["tenantAdmin", "teacher", "staff", "student"] },
      { label: "✅ Test Attendance", href: "/dashboard/academics/attendance", roles: ["tenantAdmin", "teacher", "staff"] },
      { label: "📖 My Tests", href: "/dashboard/academics/my-tests", roles: ["student"] },
    ]
  },

  {
    label: "💰 Accounts",
    href: "#",
    roles: ["tenantAdmin", "accountant"],
    tenantSpecific: true,
    children: [
      { label: "📊 Overview", href: "/dashboard/accounts/overview", roles: ["tenantAdmin", "accountant"] },
      { label: "�� Fee Receipts", href: "/dashboard/accounts/receipts", roles: ["tenantAdmin", "accountant"] },
      { label: "💸 Expenses", href: "/dashboard/accounts/expenses", roles: ["tenantAdmin", "accountant"] },
      { label: "↩️ Refunds", href: "/dashboard/accounts/refunds", roles: ["tenantAdmin", "accountant"] },
      { label: "📈 Reports", href: "/dashboard/accounts/reports", roles: ["tenantAdmin", "accountant"] },
    ]
  },

  // === PRIORITY 4: Marketing & Communication ===
  {
    label: "📱 Social Media",
    href: "#",
    roles: ["employee", "adsManager", "Admin", "SuperAdmin", "tenantAdmin"],
    children: [
      { label: "📝 Posts", href: "/dashboard/social/posts" },
      { label: "📅 Content Plan", href: "/dashboard/social/plan" },
      { label: "📊 Reports", href: "/dashboard/social/reports" },
      { label: "⚙️ Connect Facebook", href: "/dashboard/settings/facebook" },
    ],
  },

  {
    label: "💬 WhatsApp",
    href: "#",
    roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant"],
    tenantSpecific: true,
    children: [
      { label: "📊 Dashboard", href: "/dashboard/whatsapp", roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant"] },
      { label: "📨 Campaigns", href: "/dashboard/whatsapp/campaigns", roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant"] },
      { label: "👥 Contacts", href: "/dashboard/whatsapp/contacts", roles: ["SuperAdmin", "tenantAdmin", "teacher"] },
      { label: "📈 Reports", href: "/dashboard/whatsapp/reports", roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant"] },
      { label: "⚙️ Settings", href: "/dashboard/whatsapp/settings", roles: ["SuperAdmin", "tenantAdmin"] },
    ],
  },

  // === PRIORITY 5: Admin Management ===
  {
    href: "/dashboard/lead",
    label: "📋 Leads",
    roles: ["SuperAdmin", "Admin"],
  },
  
  {
    href: "/dashboard/tenants",
    label: "👤 Tenants",
    roles: ["SuperAdmin", "Admin"],
  },

  // === PRIORITY 6: User Settings ===
  {
    label: "⚙️ Settings",
    href: "#",
    roles: ["employee", "student", "adsManager", "tenantAdmin", "Admin"],
    children: [
      { label: "👤 Profile", href: "/dashboard/profile" },
      { label: "📦 My Subscription", href: "/dashboard/my-subscription" },
      { label: "📄 View Plan", href: "/dashboard/subscription/view" },
      { label: "❌ Cancel Subscription", href: "/dashboard/subscription/cancel" },
    ],
  },
];
