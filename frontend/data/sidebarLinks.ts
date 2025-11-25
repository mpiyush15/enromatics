export const sidebarLinks = [
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["SuperAdmin","admin", "user", "subscriber"],
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
    href: "/dashboard/institute-overview",
    label: "💳 Institute Overview",
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
    roles: ["subscriber", "admin" , "user", "tenantAdmin", "SuperAdmin"],
    children: [
      {
        label: "� Dashboard",
        href: "/dashboard/client/[tenantId]/social",
      },
      {
        label: "🎨 Business Assets",
        href: "/dashboard/client/[tenantId]/social/assets",
      },
      {
        label: "� Posts Manager",
        href: "/dashboard/client/[tenantId]/social/posts",
      },
      {
        label: "� Reports & Analytics",
        href: "/dashboard/client/[tenantId]/social/reports",
      },
      {
        label: "🎯 Campaign Planner",
        href: "/dashboard/client/[tenantId]/social/campaigns",
      },
      {
        label: "⚙️ Facebook Settings",
        href: "/dashboard/client/[tenantId]/settings/facebook",
      },
    ],
  },
  {
    label: "💬 WhatsApp",
    href: "#",
    roles: ["subscriber", "admin", "tenantAdmin", "SuperAdmin"],
    children: [
      {
        label: "📨 Campaigns",
        href: "/dashboard/whatsapp/campaigns",
      },
      {
        label: "👥 Contacts",
        href: "/dashboard/whatsapp/contacts",
      },
      {
        label: "📈 Reports",
        href: "/dashboard/whatsapp/reports",
      },
      {
        label: "⚙️ Settings",
        href: "/dashboard/whatsapp/settings",
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
        label: "📅 Test Schedules",
        href: "/dashboard/academics/schedules",
      },
      {
        label: "✅ Test Attendance",
        href: "/dashboard/academics/attendance",
      },
      {
        label: "📝 Marks Entry",
        href: "/dashboard/academics/marks",
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