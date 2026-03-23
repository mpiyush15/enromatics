// backend/config/sidebarConfig.js

export const sidebarLinks = [
  // === SUPERADMIN SECTION ===
  {
    href: "/dashboard/admin",
    label: "🏠 Admin Dashboard",
    roles: ["superadmin"],
  },
  {
    href: "/dashboard/overview",
    label: "📊 Overview",
    roles: ["superadmin"],
  },
  {
    href: "/dashboard/tenants",
    label: "🏢 Tenants",
    roles: ["superadmin"],
  },
  {
    href: "/dashboard/plans",
    label: "💰 Plans",
    roles: ["superadmin"],
  },
  {
    label: "💳 Billing",
    href: "#",
    roles: ["superadmin"],
    children: [
      { label: "📄 Invoices", href: "/dashboard/invoices", roles: ["superadmin"] },
      { label: "💰 Payments", href: "/dashboard/payments", roles: ["superadmin"] },
      { label: "📊 Subscribers", href: "/dashboard/subscribers", roles: ["superadmin"] },
      { label: "💾 Storage Usage", href: "/dashboard/storage", roles: ["superadmin"] },
    ],
  },
  {
    label: "🚀 SuperCRM",
    href: "#",
    roles: ["superadmin"],
    children: [
      { label: "📊 CRM Dashboard", href: "/dashboard/supercrm", roles: ["superadmin"] },
      { label: "📧 Form Leads", href: "/dashboard/supercrm/form-leads", roles: ["superadmin"] },
      { label: "📅 Demo Requests", href: "/dashboard/supercrm/demo-requests", roles: ["superadmin"] },
      { label: "📋 All Leads", href: "/dashboard/supercrm/all-leads", roles: ["superadmin"] },
    ],
  },
  {
    label: "📱 Social Media",
    href: "#",
    roles: ["superadmin"],
    children: [
      { label: "📊 Dashboard", href: "/dashboard/social", roles: ["superadmin"] },
      { label: "📊 Campaigns", href: "/dashboard/social/campaigns", roles: ["superadmin"] },
      { label: "📊 Analytics", href: "/dashboard/social/reports", roles: ["superadmin"] },
      { label: "✨ Create Ads", href: "/dashboard/social/ads", roles: ["superadmin"] },
      { label: "📅 Content Planner", href: "/dashboard/social/planner", roles: ["superadmin"] },
      { label: "📱 Business Assets", href: "/dashboard/social/assets", roles: ["superadmin"] },
      { label: "⚙️ Settings", href: "/dashboard/social/settings", roles: ["superadmin"] },
    ],
  },
  {
    href: "/dashboard/website-analytics",
    label: "📈 Website Analytics",
    roles: ["superadmin"],
  },

  // === TENANT ADMIN SECTION ===
  // === PRIORITY 1: Home (Staff & Students Only) ===
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["manager", "accountant", "teacher", "marketing", "staff", "counsellor", "adsManager", "student"],
    tenantSpecific: true,
  },

  // === PRIORITY 2: Institute Overview (Tenant Admins) ===
  {
    href: "/dashboard/institute-overview",
    label: "💳 Institute Overview",
    roles: ["tenantAdmin"],
    tenantSpecific: true,
  },

  // === PRIORITY 2B: Enquiry Dashboard (New UI) ===
  {
    href: "/dashboard/enquiry-dashboard",
    label: "🎨 Students Enquiry",
    roles: ["tenantAdmin", "manager", "counsellor"],
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
      { label: "➕ Add Student", href: "/dashboard/students/add", roles: ["tenantAdmin", "manager"] },
      { label: "📊 Attendance", href: "/dashboard/students/attendance", roles: ["tenantAdmin", "manager", "student"] },
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
      { label: "🎓 Lessons Planning", href: "/dashboard/academics/lessons-planning", roles: ["tenantAdmin", "manager"] },
      { label: "📦 Batches", href: "/dashboard/academics/batches", roles: ["tenantAdmin", "manager"] },
      {
        label: "📝 Tests",
        href: "#",
        roles: ["tenantAdmin", "manager"],
        children: [
          { label: "📅 Test Schedules", href: "/dashboard/academics/schedules", roles: ["tenantAdmin", "manager"] },
          { label: "📊 Results", href: "/dashboard/academics/results", roles: ["tenantAdmin", "manager"] },
        ]
      },
    ]
  },

  // === PRIORITY 4A: LMS - Learning Management System (NEW) ===
  {
    label: "🎓 LMS",
    href: "#",
    roles: ["tenantAdmin", "teacher", "manager", "student"],
    tenantSpecific: true,
    children: [
      { label: "📖 Overview", href: "/dashboard/lms", roles: ["tenantAdmin", "teacher", "manager", "student"] },
      { label: "📚 Subjects", href: "/dashboard/lms/subjects", roles: ["tenantAdmin", "teacher", "manager"] },
      { label: "📖 Chapters", href: "/dashboard/lms/chapters", roles: ["tenantAdmin", "teacher", "manager"] },
      { label: "❓ Questions (AI)", href: "/dashboard/lms/questions", roles: ["tenantAdmin", "teacher", "manager"] },
      { label: "📝 Tests", href: "/dashboard/lms/tests", roles: ["tenantAdmin", "teacher", "manager", "student"] },
      { label: "🎬 Videos & Lessons", href: "/dashboard/lms/lessons", roles: ["tenantAdmin", "teacher", "manager", "student"] },
      { label: "📊 Student Progress", href: "/dashboard/lms/student-progress", roles: ["tenantAdmin", "teacher", "manager"] },
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
      { label: "💼 Student Details", href: "/dashboard/accounts/overview", roles: ["tenantAdmin", "accountant"] },
    ]
  },

  // === PRIORITY 6: Exams & Scholarships ===
  {
    label: "🎓 Exams & Scholarships",
    href: "#",
    roles: ["tenantAdmin", "counsellor", "staff"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Exams", href: "/dashboard/scholarship-exams", roles: ["tenantAdmin", "counsellor", "staff"] },
      { label: "➕ Create Exam", href: "/dashboard/scholarship-exams/create", roles: ["tenantAdmin"] },
      { label: "👥 Test Management", href: "/dashboard/scholarship-tests", roles: ["tenantAdmin", "staff"] },
      { label: "📊 Results Management", href: "/dashboard/scholarship-results", roles: ["tenantAdmin"] },
      { label: "🏆 Rewards Overview", href: "/dashboard/scholarship-rewards", roles: ["tenantAdmin"] },
    ]
  },

  // === PRIORITY 13: Institute Settings (Staff + Billing) ===
  {
    label: "⚙️ Institute Settings",
    href: "#",
    roles: ["tenantAdmin"],
    children: [
      { label: "👤 Profile", href: "/dashboard/settings/profile", roles: ["tenantAdmin"] },
      { label: "👥 Staff Management", href: "/dashboard/settings/staff", roles: ["tenantAdmin"] },
      { label: "🔐 Role Manager", href: "/dashboard/settings/roles", roles: ["tenantAdmin"] },
      { label: "💰 My Subscription", href: "/dashboard/settings/subscriptions", roles: ["tenantAdmin"] },
      { label: "💳 Payment History", href: "/dashboard/accounts/add-payment", roles: ["tenantAdmin"] },
    ],
  },
];
