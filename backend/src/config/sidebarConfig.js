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
    roles: ["tenantadmin"],
    tenantSpecific: true,
  },

  // === PRIORITY 2B: Enquiry Dashboard (New UI) ===
  {
    href: "/dashboard/enquiry-dashboard",
    label: "🎨 Students Enquiry",
    roles: ["tenantadmin", "manager", "counsellor"],
    tenantSpecific: true,
  },

  // === PRIORITY 3: Students ===
  {
    label: "🎓 Students",
    href: "#",
    roles: ["tenantadmin", "manager", "accountant", "student"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Students", href: "/dashboard/students", roles: ["tenantadmin", "manager", "accountant"] },
      { label: "➕ Add Student", href: "/dashboard/students/add", roles: ["tenantadmin", "manager"] },
      { label: "📊 Attendance", href: "/dashboard/students/attendance", roles: ["tenantadmin", "manager", "student"] },
      { label: "👤 My Profile", href: "/student/dashboard", roles: ["student"] },
    ]
  },

  // === PRIORITY 4: Academics (with Tests nested) ===
  {
    label: "📚 Academics",
    href: "#",
    roles: ["tenantadmin", "manager", "student"],
    tenantSpecific: true,
    children: [
      { label: "🎓 Lessons Planning", href: "/dashboard/academics/lessons-planning", roles: ["tenantadmin", "manager"] },
      { label: "📦 Batches", href: "/dashboard/academics/batches", roles: ["tenantadmin", "manager"] },
      {
        label: "📝 Tests",
        href: "#",
        roles: ["tenantadmin", "manager"],
        children: [
          { label: "📅 Test Schedules", href: "/dashboard/academics/schedules", roles: ["tenantadmin", "manager"] },
          { label: "📊 Results", href: "/dashboard/academics/results", roles: ["tenantadmin", "manager"] },
        ]
      },
    ]
  },

  // === PRIORITY 4A: LMS - Learning Management System (NEW) ===
  {
    label: "🎓 LMS",
    href: "#",
    roles: ["tenantadmin", "teacher", "manager", "student"],
    tenantSpecific: true,
    children: [
      { label: "📖 Overview", href: "/dashboard/lms", roles: ["tenantadmin", "teacher", "manager", "student"] },
      { label: "📚 Subjects", href: "/dashboard/lms/subjects", roles: ["tenantadmin", "teacher", "manager"] },
      { label: "📖 Chapters", href: "/dashboard/lms/chapters", roles: ["tenantadmin", "teacher", "manager"] },
      { label: "❓ Questions (AI)", href: "/dashboard/lms/questions", roles: ["tenantadmin", "teacher", "manager"] },
      { label: "📝 Tests", href: "/dashboard/lms/tests", roles: ["tenantadmin", "teacher", "manager", "student"] },
      { label: "🎬 Videos & Lessons", href: "/dashboard/lms/lessons", roles: ["tenantadmin", "teacher", "manager", "student"] },
      { label: "📊 Student Progress", href: "/dashboard/lms/student-progress", roles: ["tenantadmin", "teacher", "manager"] },
    ]
  },

  // === PRIORITY 5: Accounts ===
  {
    label: "💰 Accounts",
    href: "#",
    roles: ["tenantadmin", "accountant"],
    tenantSpecific: true,
    children: [
      { label: "📊 Overview", href: "/dashboard/accounts/overview", roles: ["tenantadmin", "accountant"] },
      { label: "💳 All Transactions", href: "/dashboard/accounts/transactions", roles: ["tenantadmin", "accountant"] },
      { label: "🧾 Fee Receipts", href: "/dashboard/accounts/receipts", roles: ["tenantadmin", "accountant"] },
      { label: "💸 Expenses", href: "/dashboard/accounts/expenses", roles: ["tenantadmin", "accountant"] },
      { label: "↩️ Refunds", href: "/dashboard/accounts/refunds", roles: ["tenantadmin", "accountant"] },
      { label: "💼 Student Details", href: "/dashboard/accounts/overview", roles: ["tenantadmin", "accountant"] },
    ]
  },

  // === PRIORITY 6: Exams & Scholarships ===
  {
    label: "🎓 Exams & Scholarships",
    href: "#",
    roles: ["tenantadmin", "counsellor", "staff"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Exams", href: "/dashboard/scholarship-exams", roles: ["tenantadmin", "counsellor", "staff"] },
      { label: "➕ Create Exam", href: "/dashboard/scholarship-exams/create", roles: ["tenantadmin"] },
      { label: "👥 Test Management", href: "/dashboard/scholarship-tests", roles: ["tenantadmin", "staff"] },
      { label: "📊 Results Management", href: "/dashboard/scholarship-results", roles: ["tenantadmin"] },
      { label: "🏆 Rewards Overview", href: "/dashboard/scholarship-rewards", roles: ["tenantadmin"] },
    ]
  },

  // === PRIORITY 13: Institute Settings (Staff + Billing) ===
  {
    label: "⚙️ Institute Settings",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      { label: "👤 Profile", href: "/dashboard/settings/profile", roles: ["tenantadmin"] },
      { label: "👥 Staff Management", href: "/dashboard/settings/staff", roles: ["tenantadmin"] },
      { label: "🔐 Role Manager", href: "/dashboard/settings/roles", roles: ["tenantadmin"] },
      { label: "💰 My Subscription", href: "/dashboard/settings/subscriptions", roles: ["tenantadmin"] },
      { label: "💳 Payment History", href: "/dashboard/accounts/add-payment", roles: ["tenantadmin"] },
    ],
  },
];
