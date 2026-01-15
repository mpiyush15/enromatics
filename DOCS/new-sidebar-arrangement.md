export const tenantAdminSidebar = [
  {
    label: "Dashboard",
    icon: "Home",
    href: "/dashboard/home",
    roles: ["tenantAdmin"],
    order: 1,
  },

{
    label: "Institute Overview",
    icon: "Home",
    href: "/dashboard/home",
    roles: ["tenantAdmin"],
    order: 1,
  },

  {
    label: "Students",
    icon: "Users",
    order: 2,
    roles: ["tenantAdmin"],
    children: [
      { label: "All Students", href: "/dashboard/client/[tenantId]/students" },
      { label: "Add Student", href: "/dashboard/client/[tenantId]/students/add" },
      { label: "Attendance", href: "/dashboard/client/[tenantId]/students/attendance" },
    ],
  },

  {
    label: "Academics",
    icon: "BookOpen",
    order: 3,
    roles: ["tenantAdmin"],
    children: [
      { label: "Batches", href: "/dashboard/client/[tenantId]/academics/batches" },

      {
        label: "Tests",
        children: [
          { label: "Test Schedules", href: "/dashboard/client/[tenantId]/academics/schedules" },
          { label: "Test Attendance", href: "/dashboard/client/[tenantId]/academics/attendance" },
          { label: "Marks Entry", href: "/dashboard/client/[tenantId]/academics/marks" },
          { label: "Test Reports", href: "/dashboard/client/[tenantId]/academics/reports" },
        ],
      },
    ],
  },

  {
    label: "Accounts",
    icon: "Wallet",
    order: 4,
    roles: ["tenantAdmin"],
    children: [
      { label: "Overview", href: "/dashboard/client/[tenantId]/accounts/overview" },
      { label: "Fee Receipts", href: "/dashboard/client/[tenantId]/accounts/receipts" },
      { label: "Expenses", href: "/dashboard/client/[tenantId]/accounts/expenses" },
      { label: "Refunds", href: "/dashboard/client/[tenantId]/accounts/refunds" },
      { label: "Reports", href: "/dashboard/client/[tenantId]/accounts/reports" },
    ],
  },

  {
    label: "Exams & Scholarships",
    icon: "Award",
    order: 5,
    roles: ["tenantAdmin"],
    children: [
      { label: "All Exams", href: "/dashboard/client/[tenantId]/scholarship-exams" },
      { label: "Create Exam", href: "/dashboard/client/[tenantId]/scholarship-exams/create" },
      { label: "Test Management", href: "/dashboard/client/[tenantId]/scholarship-tests" },
      { label: "Results Management", href: "/dashboard/client/[tenantId]/scholarship-results" },
      { label: "Rewards Overview", href: "/dashboard/client/[tenantId]/scholarship-rewards" },
    ],
  },

  {
    label: "Communication",
    icon: "MessageSquare",
    order: 6,
    roles: ["tenantAdmin"],
    children: [
      {
        label: "WhatsApp",
        children: [
          { label: "Dashboard", href: "/dashboard/client/[tenantId]/whatsapp" },
          { label: "Campaigns", href: "/dashboard/client/[tenantId]/whatsapp/campaigns" },
          { label: "Contacts", href: "/dashboard/client/[tenantId]/whatsapp/contacts" },
          { label: "Reports", href: "/dashboard/client/[tenantId]/whatsapp/reports" },
        ],
      },
      {
        label: "Social Media",
        children: [
          { label: "Dashboard", href: "/dashboard/client/[tenantId]/social" },
          { label: "Campaigns", href: "/dashboard/client/[tenantId]/social/campaigns" },
          { label: "Analytics", href: "/dashboard/client/[tenantId]/social/analytics" },
          { label: "Create Ads", href: "/dashboard/client/[tenantId]/social/create-ads" },
          { label: "Content Planner", href: "/dashboard/client/[tenantId]/social/content-planner" },
          { label: "Business Assets", href: "/dashboard/client/[tenantId]/social/business-assets" },
        ],
      },
    ],
  },

  {
    label: "Institute Settings",
    icon: "Settings",
    order: 7,
    roles: ["tenantAdmin"],
    children: [
      { label: "Institute Overview", href: "/dashboard/client/[tenantId]/institute-overview" },
      { label: "Staff Management", href: "/dashboard/client/[tenantId]/settings/staff" },
      { label: "My Subscription", href: "/dashboard/client/[tenantId]/my-subscription" },
      { label: "Payment History", href: "/dashboard/client/[tenantId]/payments" },
    ],
  },

  {
    label: "Personal",
    icon: "User",
    order: 8,
    roles: ["tenantAdmin"],
    children: [
      { label: "Profile", href: "/dashboard/profile" },
      { label: "View Plan", href: "/dashboard/subscription/view" },
      { label: "Cancel Subscription", href: "/dashboard/subscription/cancel" },
      { label: "Logout", action: "logout" },
    ],
  },
];
