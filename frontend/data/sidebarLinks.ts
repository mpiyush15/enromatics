export const sidebarLinks = [
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
      {
        label: "📄 Invoices",
        href: "/dashboard/invoices",
      },
      {
        label: "💰 Payments",
        href: "/dashboard/payments",
      },
      {
        label: "📊 Subscribers",
        href: "/dashboard/subscribers",
      },
      {
        label: "💾 Storage Usage",
        href: "/dashboard/storage",
      },
    ],
  },
  {
    label: "🚀 SuperCRM",
    href: "#",
    roles: ["superadmin"],
    children: [
      {
        label: "📊 Dashboard",
        href: "/dashboard/supercrm",
      },
      {
        label: "📧 Form Leads",
        href: "/dashboard/supercrm/form-leads",
      },
      {
        label: "📅 Demo Requests",
        href: "/dashboard/supercrm/demo-requests",
      },
      {
        label: "📋 All Leads",
        href: "/dashboard/supercrm/all-leads",
      },
    ],
  },
  {
    label: "📱 Social Media",
    href: "#",
    roles: ["superadmin"],
    children: [
      {
        label: "📊 Dashboard",
        href: "/dashboard/social",
      },
      {
        label: "📊 Campaigns",
        href: "/dashboard/social/campaigns",
      },
      {
        label: "📊 Analytics",
        href: "/dashboard/social/reports",
      },
      {
        label: "✨ Create Ads",
        href: "/dashboard/social/ads",
      },
      {
        label: "📅 Content Planner",
        href: "/dashboard/social/planner",
      },
      {
        label: "📱 Business Assets",
        href: "/dashboard/social/assets",
      },
      {
        label: "⚙️ Settings",
        href: "/dashboard/social/settings",
      },
    ],
  },
  {
    href: "/dashboard/website-analytics",
    label: "📈 Website Analytics",
    roles: ["superadmin"],
  },
  {
    href: "/dashboard",
    label: "💳 Institute Overview",
    roles: ["tenantadmin"],
  },
  {
    href: "/dashboard/enroll-student",
    label: "➕ Enroll Student",
    roles: ["tenantadmin"],
  },
  {
    href: "/dashboard/test-dashboard",
    label: "🧪 Test Dashboard",
    roles: ["tenantadmin"],
  },
  {
    label: "📦 Subscription",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "🔁 My Subscription",
        href: "/dashboard/settings/subscriptions",
      },
      {
        label: "💳 Payment History",
        href: "/dashboard/accounts/add-payment",
      },
    ],
  },
  {
    href: "/dashboard/settings/profile",
    label: "🧑‍💻 Profile",
    roles: ["tenantadmin", "student"],
  },
  {
    href: "/dashboard/settings/subscriptions",
    label: "💰 Subscription & Mobile App",
    roles: ["tenantadmin"],
  },
  {
    label: "⚙️ Institute Settings",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "🧑‍💼 Profile",
        href: "/dashboard/settings/profile",
      },
      {
        label: "👥 Staff Management",
        href: "/dashboard/settings/staff",
      },
      {
        label: "🔐 Role Manager",
        href: "/dashboard/settings/roles",
      },
      {
        label: "💳 Payment History",
        href: "/dashboard/accounts/add-payment",
      },
    ],
  },
  {
    label: "📚 Academics",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "📖 Lessons Planning",
        href: "/dashboard/academics/lessons-planning",
      },
      {
        label: "📦 Batches",
        href: "/dashboard/academics/batches",
      },
      {
        label: "📅 Test Schedules",
        href: "/dashboard/academics/schedules",
      },
      {
        label: "📊 Test Results",
        href: "/dashboard/academics/results",
      },
      {
        label: "📊 Test Reports",
        href: "/dashboard/academics/reports",
      },
      {
        label: "📖 My Tests",
        href: "/dashboard/academics/my-tests",
      },
    ],
  },
  {
    label: "🎓 LMS - Test Management",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "📖 Overview",
        href: "/dashboard/lms",
      },
      {
        label: "📚 Subjects",
        href: "/dashboard/lms/subjects",
      },
      {
        label: "📖 Chapters",
        href: "/dashboard/lms/chapters",
      },
      {
        label: "❓ Questions (AI)",
        href: "/dashboard/lms/questions",
      },
      {
        label: "📝 Tests",
        href: "/dashboard/lms/tests",
      },
      {
        label: "🎬 Videos & Lessons",
        href: "/dashboard/lms/videos",
      },
      {
        label: "📊 Student Progress",
        href: "/dashboard/lms/progress",
      },
    ],
  },
  {
    label: "🎓 Scholarship Tests",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "📋 All Tests",
        href: "/dashboard/scholarship-exams",
      },
      {
        label: "➕ Create Test",
        href: "/dashboard/scholarship-exams/create",
      },
      {
        label: "👥 Manage Tests",
        href: "/dashboard/scholarship-exams",
      },
      {
        label: "📊 Results Management",
        href: "/dashboard/scholarship-results",
      },
      {
        label: "🏆 Rewards Overview",
        href: "/dashboard/scholarship-rewards",
      },
    ],
  },
];