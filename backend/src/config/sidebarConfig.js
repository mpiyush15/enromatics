// backend/config/sidebarConfig.js

export const sidebarLinks = [
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["SuperAdmin", "Admin", "employee", "student", "adsManager"],
  },
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
  {
    href: "/dashboard/institute-overview",
    label: "💳 Institute Overview",
    roles: ["tenantAdmin"],
  },
  {
    label: "📦 Subscription",
    href: "#",
    roles: ["employee", "student", "adsManager", "tenantAdmin"],
    children: [
      { label: "🔁 My Subscription", href: "/dashboard/my-subscription" },
      { label: "❌ Cancel Subscription", href: "/dashboard/subscription/cancel" },
      { label: "📄 View Plan", href: "/dashboard/subscription/view" },
    ],
  },
  {
    label: "📱 Social Media",
    href: "#",
    roles: ["employee", "student", "adsManager", "Admin", "SuperAdmin", "tenantAdmin"],
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
    roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant", "staff"],
    tenantSpecific: true,
    children: [
      { label: "📊 Dashboard", href: "/dashboard/whatsapp", roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant", "staff"] },
      { label: "📨 Campaigns", href: "/dashboard/whatsapp/campaigns", roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant", "staff"] },
      { label: "👥 Contacts", href: "/dashboard/whatsapp/contacts", roles: ["SuperAdmin", "tenantAdmin", "teacher", "staff"] },
      { label: "📈 Reports", href: "/dashboard/whatsapp/reports", roles: ["SuperAdmin", "tenantAdmin", "teacher", "accountant", "staff"] },
      { label: "⚙️ Settings", href: "/dashboard/whatsapp/settings", roles: ["SuperAdmin", "tenantAdmin"] },
    ],
  },
  {
    href: "/dashboard/profile",
    label: "🧑‍💻 Profile",
    roles: ["Admin", "employee", "student", "adsManager", "tenantAdmin"],
  },
  {
    href: "/dashboard/client/{tenantId}/settings/staff-management",
    label: "👥 Staff Management",
    roles: ["tenantAdmin"],
    tenantSpecific: true,
  },

  {
  label: "🎓 Students",
  href: "/dashboard/students",
  roles: ["tenantAdmin", "teacher", "staff", "student"],
  tenantSpecific: true,
  children: [
    { label: "➕ Add Student", href: "/dashboard/students/add", roles: ["tenantAdmin", "teacher", "staff"] },
    { label: "📋 View Students", href: "/dashboard/students", roles: ["tenantAdmin", "teacher", "staff"] },
    { label: "📅 Attendance", href: "/dashboard/students/attendance", roles: ["tenantAdmin", "teacher", "staff"] },
    { label: "👤 My Profile", href: "/student/dashboard", roles: ["student"] },
    { label: "💳 Pay Fees", href: "/student/dashboard", roles: ["student"] },
  ]
},
  {
  label: "💰 Accounts",
  href: "#",
  roles: ["tenantAdmin", "accountant", "staff"],
  tenantSpecific: true,
  children: [
    { label: "📊 Overview", href: "/dashboard/accounts/overview", roles: ["tenantAdmin", "accountant", "staff"] },
    { label: "🧾 Fee Receipts", href: "/dashboard/accounts/receipts", roles: ["tenantAdmin", "accountant", "staff"] },
    { label: "💸 Expenses", href: "/dashboard/accounts/expenses", roles: ["tenantAdmin", "accountant", "staff"] },
    { label: "↩️ Refunds", href: "/dashboard/accounts/refunds", roles: ["tenantAdmin", "accountant"] },
    { label: "📈 Reports", href: "/dashboard/accounts/reports", roles: ["tenantAdmin", "accountant"] },
  ]
},
  {
  label: "📚 Academics",
  href: "#",
  roles: ["tenantAdmin", "teacher", "staff", "student"],
  tenantSpecific: true,
  children: [
    { label: "📅 Test Schedules", href: "/dashboard/academics/schedules", roles: ["tenantAdmin", "teacher", "staff"] },
    { label: "✅ Test Attendance", href: "/dashboard/academics/attendance", roles: ["tenantAdmin", "teacher", "staff"] },
    { label: "📝 Marks Entry", href: "/dashboard/academics/marks", roles: ["tenantAdmin", "teacher", "staff"] },
    { label: "📊 Test Reports", href: "/dashboard/academics/reports", roles: ["tenantAdmin", "teacher", "staff", "student"] },
    { label: "📖 My Tests", href: "/dashboard/academics/my-tests", roles: ["student"] },
  ]
}

];
