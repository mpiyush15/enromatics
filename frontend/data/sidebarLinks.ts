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
        label: "📝 Posts",
        href: "/dashboard/social/posts",
      },
      {
        label: "📅 Content Plan",
        href: "/dashboard/social/plan",
      },
      {
        label: "📊 Reports",
        href: "/dashboard/social/reports",
      },
      {
        label: "⚙️ Connect Facebook",
        href: "/dashboard/settings/facebook",
      },
    ],
  },
  {
    label: "💬 WhatsApp",
    href: "#",
    roles: ["subscriber", "admin", "tenantAdmin"],
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
];