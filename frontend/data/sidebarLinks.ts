export const sidebarLinks = [
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["SuperAdmin","admin", "user", "subscriber"],
  },
  {
    href: "/dashboard/analytics",
    label: "📊 Analytics",
    roles: ["tenantAdmin", "SuperAdmin", "admin"],
  },
  {
    href: "/dashboard/lead",
    label: "📋 Leads",
    roles: ["SuperAdmin","admin"],
  },
  {
    href: "/dashboard/tenants",
    label: "👤 Tenants",
    roles: ["SuperAdmin","admin"],
  },
  {
    href: "/dashboard/client/[tenantId]/overview-pro",
    label: "💳 Institute Overview",
    roles: ["tenantAdmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/ui-test-lab",
    label: "🎨 UI Test Lab",
    roles: ["tenantAdmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/enroll-student",
    label: "➕ Enroll Student",
    roles: ["tenantAdmin"],
  },
  {
    href: "/dashboard/client/[tenantId]/test-dashboard",
    label: "🧪 Test Dashboard",
    roles: ["tenantAdmin"],
  },
  {
    label: "📦 Subscription",
    href: "#",
    roles: ["user", "subscriber", "tenantAdmin"],
    children: [
      {
        label: "🔁 My Subscription",
        href: "/dashboard/my-subscription",
      },
      {
        label: "❌ Cancel Subscription",
        href: "/dashboard/subscription/cancel",
      },
      {
        label: "📄 View Plan",
        href: "/dashboard/subscription/view",
      },
    ],
  },
  {
    label: "📱 Social Media",
    href: "#",
    // 🔒 HIDDEN FROM TENANTS - Still in development. Only SuperAdmin can access.
    roles: ["SuperAdmin"],
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
    roles: ["tenantAdmin"],
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
  {
    href: "/dashboard/profile",
    label: "🧑‍💻 Profile",
    roles: ["admin", "user", "subscriber"],
  },
  {
    href: "/dashboard/subscription",
    label: "💰 Subscription & Mobile App",
    roles: ["tenantAdmin"],
  },
  {
    label: "📚 Academics",
    href: "#",
    roles: ["tenantAdmin", "teacher", "staff", "student"],
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
        href: "/dashboard/academics/reports",
      },
      {
        label: "📖 My Tests",
        href: "/dashboard/academics/my-tests",
      },
    ],
  },
  {
    label: "🎓 Scholarship Tests",
    href: "#",
    roles: ["tenantAdmin", "teacher", "staff"],
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