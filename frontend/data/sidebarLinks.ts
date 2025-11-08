export const sidebarLinks = [
  {
    href: "/dashboard/home",
    label: "🏠 Home",
    roles: ["admin", "user", "subscriber"],
  },
  {
    href: "/dashboard/lead",
    label: "📋 Leads",
    roles: ["admin"],
  },
  {
    href: "/dashboard/users",
    label: "👤 Users",
    roles: ["admin"],
  },
  {
    href: "/dashboard/subscriptions",
    label: "💳 Subscriptions",
    roles: ["admin"],
  },
  {
    label: "📦 My Subscription",
    href: "#",
    roles: ["user", "subscriber"],
    children: [
      {
        label: "🔁 Renew",
        href: "/dashboard/subscription/renew",
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
    roles: ["subscriber", "admin" , "user"],
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
    roles: ["subscriber", "admin"],
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
];