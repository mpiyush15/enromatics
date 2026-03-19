export const sidebarLinks = [
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["superadmin", "tenantadmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/analytics",
    label: "📊 Analytics",
    roles: ["tenantadmin", "superadmin"],
  },
  {
    href: "/dashboard/lead",
    label: "📋 Leads",
    roles: ["superadmin"],
  },
  {
    href: "/dashboard/tenants",
    label: "👤 Tenants",
    roles: ["superadmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/overview-pro",
    label: "💳 Institute Overview",
    roles: ["tenantadmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/ui-test-lab",
    label: "🎨 UI Test Lab",
    roles: ["tenantadmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/enroll-student",
    label: "➕ Enroll Student",
    roles: ["tenantadmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/test-dashboard",
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
        href: "/dashboard/client/[tenantId]/my-subscription",
      },
      {
        label: "💳 Payment History",
        href: "/dashboard/client/[tenantId]/payments",
      },
    ],
  },
  {
    label: "📱 Social Media",
    href: "#",
    // 🔒 HIDDEN FROM TENANTS - Still in development. Only SuperAdmin can access.
    roles: ["superadmin"],
    children: [
      {
        label: "📊 Dashboard",
        superAdminHref: "/dashboard/social",
        href: "/dashboard/client/[tenantId]/social",
      },
      {
        label: "📊 Campaigns",
        superAdminHref: "/dashboard/social/campaigns",
        href: "/dashboard/client/[tenantId]/social/campaigns",
      },
      {
        label: "📊 Analytics",
        superAdminHref: "/dashboard/social/reports",
        href: "/dashboard/client/[tenantId]/social/reports",
      },
      {
        label: "✨ Create Ads",
        superAdminHref: "/dashboard/social/ads",
        href: "/dashboard/client/[tenantId]/social/ads",
      },
      {
        label: "📅 Content Planner",
        superAdminHref: "/dashboard/social/planner",
        href: "/dashboard/client/[tenantId]/social/planner",
      },
      {
        label: "📱 Business Assets",
        superAdminHref: "/dashboard/social/assets",
        href: "/dashboard/client/[tenantId]/social/assets",
      },
      {
        label: "⚙️ Settings",
        superAdminHref: "/dashboard/social/settings",
        href: "/dashboard/client/[tenantId]/social/settings",
      },
    ],
  },
  {
    label: "💬 WhatsApp",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "📧 Inbox",
        href: "/dashboard/client/[tenantId]/whatsapp/inbox",
        roles: ["tenantadmin"],
      },
      {
        label: "📋 Templates",
        href: "/dashboard/client/[tenantId]/whatsapp/templates",
        roles: ["tenantadmin"],
      },
      {
        label: "🤖 Chatbots",
        href: "/dashboard/client/[tenantId]/whatsapp/chatbots",
        roles: ["tenantadmin"],
      },
      {
        label: "⚙️ Settings",
        href: "/dashboard/client/[tenantId]/whatsapp/settings",
        roles: ["tenantadmin"],
      },
    ],
  },
  {
    href: "/dashboard/client/[tenantId]/profile",
    label: "🧑‍💻 Profile",
    roles: ["tenantadmin", "student"],
  },
  {
    href: "/dashboard/client/[tenantId]/my-subscription",
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
        href: "/dashboard/client/[tenantId]/profile",
      },
      {
        label: "👥 Staff Management",
        href: "/dashboard/client/[tenantId]/settings/staff",
      },
      {
        label: "🔐 Role Manager",
        href: "/dashboard/client/[tenantId]/settings/roles",
      },
      {
        label: "💳 Payment History",
        href: "/dashboard/client/[tenantId]/payments",
      },
    ],
  },
  {
    label: "📚 Academics",
    href: "#",
    roles: ["tenantadmin"],
    children: [
      {
        label: "� Lessons Planning",
        href: "/dashboard/client/[tenantId]/academics/lessons-planning",
      },
      {
        label: "📦 Batches",
        href: "/dashboard/client/[tenantId]/academics/batches",
      },
      {
        label: "📅 Test Schedules",
        href: "/dashboard/client/[tenantId]/academics/schedules",
      },
      {
        label: "📊 Test Results",
        href: "/dashboard/client/[tenantId]/academics/results",
      },
      {
        label: "📊 Test Reports",
        href: "/dashboard/client/[tenantId]/academics/reports",
      },
      {
        label: "📖 My Tests",
        href: "/dashboard/client/[tenantId]/academics/my-tests",
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
        href: "/dashboard/client/[tenantId]/lms",
      },
      {
        label: "📚 Subjects",
        href: "/dashboard/client/[tenantId]/lms/subjects",
      },
      {
        label: "📖 Chapters",
        href: "/dashboard/client/[tenantId]/lms/chapters",
      },
      {
        label: "❓ Questions (AI)",
        href: "/dashboard/client/[tenantId]/lms/questions",
      },
      {
        label: "📝 Tests",
        href: "/dashboard/client/[tenantId]/lms/tests",
      },
      {
        label: "🎬 Videos & Lessons",
        href: "/dashboard/client/[tenantId]/lms/videos",
      },
      {
        label: "📊 Student Progress",
        href: "/dashboard/client/[tenantId]/lms/progress",
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
        href: "/dashboard/client/[tenantId]/scholarship-exams",
      },
      {
        label: "➕ Create Test",
        href: "/dashboard/client/[tenantId]/scholarship-exams/create",
      },
      {
        label: "👥 Manage Tests",
        href: "/dashboard/client/[tenantId]/scholarship-exams",
      },
      {
        label: "📊 Results Management",
        href: "/dashboard/client/[tenantId]/scholarship-results",
      },
      {
        label: "🏆 Rewards Overview",
        href: "/dashboard/client/[tenantId]/scholarship-rewards",
      },
    ],
  },
];