// backend/config/sidebarConfig.js

export const sidebarLinks = [
  // === PRIORITY 1: Home (Staff & Students Only) ===
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["manager", "accountant", "teacher", "marketing", "staff", "counsellor", "adsManager", "student"],
    tenantSpecific: true,
  },

  // === PRIORITY 2: Institute Overview (Tenant Admins) ===
  {
    href: "/dashboard/client/[tenantId]/overview-pro",
    label: "💳 Institute Overview",
    roles: ["tenantAdmin"],
    tenantSpecific: true,
  },

  // === PRIORITY 2B: Enquiry Dashboard (New UI) ===
  {
    href: "/dashboard/client/[tenantId]/enquiry-dashboard",
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
      { label: "📋 All Students", href: "/dashboard/client/[tenantId]/students", roles: ["tenantAdmin", "manager", "accountant"] },
      { label: "➕ Add Student", href: "/dashboard/client/[tenantId]/students/add", roles: ["tenantAdmin", "manager"] },
      { label: "📊 Attendance", href: "/dashboard/client/[tenantId]/students/attendance", roles: ["tenantAdmin", "manager", "student"] },
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
      { label: "🎓 Lessons Planning", href: "/dashboard/client/[tenantId]/academics/lessons-planning", roles: ["tenantAdmin", "manager"] },
      { label: "📦 Batches", href: "/dashboard/client/[tenantId]/academics/batches", roles: ["tenantAdmin", "manager"] },
      {
        label: "📝 Tests",
        href: "#",
        roles: ["tenantAdmin", "manager"],
        children: [
          { label: "📅 Test Schedules", href: "/dashboard/client/[tenantId]/academics/schedules", roles: ["tenantAdmin", "manager"] },
          { label: "📊 Results", href: "/dashboard/client/[tenantId]/academics/results", roles: ["tenantAdmin", "manager"] },
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
      { label: "📖 Overview", href: "/dashboard/client/[tenantId]/lms", roles: ["tenantAdmin", "teacher", "manager", "student"] },
      { label: "📚 Subjects", href: "/dashboard/client/[tenantId]/lms/subjects", roles: ["tenantAdmin", "teacher", "manager"] },
      { label: "📖 Chapters", href: "/dashboard/client/[tenantId]/lms/chapters", roles: ["tenantAdmin", "teacher", "manager"] },
      { label: "❓ Questions (AI)", href: "/dashboard/client/[tenantId]/lms/questions", roles: ["tenantAdmin", "teacher", "manager"] },
      { label: "📝 Tests", href: "/dashboard/client/[tenantId]/lms/tests", roles: ["tenantAdmin", "teacher", "manager", "student"] },
      { label: "🎬 Videos & Lessons", href: "/dashboard/client/[tenantId]/lms/lessons", roles: ["tenantAdmin", "teacher", "manager", "student"] },
      { label: "📊 Student Progress", href: "/dashboard/client/[tenantId]/lms/student-progress", roles: ["tenantAdmin", "teacher", "manager"] },
    ]
  },

  // === PRIORITY 5: Accounts ===
  {
    label: "💰 Accounts",
    href: "#",
    roles: ["tenantAdmin", "accountant"],
    tenantSpecific: true,
    children: [
      { label: "📊 Overview", href: "/dashboard/client/[tenantId]/accounts/overview", roles: ["tenantAdmin", "accountant"] },
      { label: "💳 All Transactions", href: "/dashboard/client/[tenantId]/accounts/transactions", roles: ["tenantAdmin", "accountant"] },
      { label: "🧾 Fee Receipts", href: "/dashboard/client/[tenantId]/accounts/receipts", roles: ["tenantAdmin", "accountant"] },
      { label: "💸 Expenses", href: "/dashboard/client/[tenantId]/accounts/expenses", roles: ["tenantAdmin", "accountant"] },
      { label: "↩️ Refunds", href: "/dashboard/client/[tenantId]/accounts/refunds", roles: ["tenantAdmin", "accountant"] },
      { label: "💼 Student Details", href: "/dashboard/client/[tenantId]/accounts/student-details", roles: ["tenantAdmin", "accountant"] },
    ]
  },

  // === PRIORITY 6: Exams & Scholarships ===
  {
    label: "🎓 Exams & Scholarships",
    href: "#",
    roles: ["tenantAdmin", "counsellor", "staff"],
    tenantSpecific: true,
    children: [
      { label: "📋 All Exams", href: "/dashboard/client/[tenantId]/scholarship-exams", roles: ["tenantAdmin", "counsellor", "staff"] },
      { label: "➕ Create Exam", href: "/dashboard/client/[tenantId]/scholarship-exams/create", roles: ["tenantAdmin"] },
      { label: "👥 Test Management", href: "/dashboard/client/[tenantId]/scholarship-tests", roles: ["tenantAdmin", "staff"] },
      { label: "📊 Results Management", href: "/dashboard/client/[tenantId]/scholarship-results", roles: ["tenantAdmin"] },
      { label: "🏆 Rewards Overview", href: "/dashboard/client/[tenantId]/scholarship-rewards", roles: ["tenantAdmin"] },
    ]
  },

  // === PRIORITY 7: Communication (WhatsApp - Tenant Admins Only) ===
  {
    label: "💬 WhatsApp",
    href: "#",
    roles: ["tenantAdmin"],
    tenantSpecific: true,
    children: [
      {
        label: "📧 Inbox",
        href: "/dashboard/client/[tenantId]/whatsapp/inbox",
        roles: ["tenantAdmin"],
      },
      {
        label: "📋 Templates",
        href: "/dashboard/client/[tenantId]/whatsapp/templates",
        roles: ["tenantAdmin"],
      },
      {
        label: "🤖 Chatbots",
        href: "/dashboard/client/[tenantId]/whatsapp/chatbots",
        roles: ["tenantAdmin"],
      },
      {
        label: "⚙️ Settings",
        href: "/dashboard/client/[tenantId]/whatsapp/settings",
        roles: ["tenantAdmin"],
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
  //{
    //href: "/dashboard/lead",
    //label: "📊 Students Enquiry",
    //roles: ["tenantAdmin", "manager", "counsellor"],
    //tenantSpecific: true,
  //},
  
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
    roles: ["tenantAdmin"],
    children: [
      { label: "👤 Profile", href: "/dashboard/client/[tenantId]/profile", roles: ["tenantAdmin"] },
      { label: "👥 Staff Management", href: "/dashboard/client/[tenantId]/settings/staff", roles: ["tenantAdmin"] },
      { label: "🔐 Role Manager", href: "/dashboard/client/[tenantId]/settings/roles", roles: ["tenantAdmin"] },
      { label: "💰 My Subscription", href: "/dashboard/client/[tenantId]/my-subscription", roles: ["tenantAdmin"] },
      { label: "💳 Payment History", href: "/dashboard/client/[tenantId]/payments", roles: ["tenantAdmin"] },
      { label: "📱 WhatsApp Events", href: "/dashboard/client/[tenantId]/whatsapp-events", roles: ["tenantAdmin"] },
    ],
  },
];
