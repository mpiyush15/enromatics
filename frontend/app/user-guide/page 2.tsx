"use client";

import { useState } from "react";
import Link from "next/link";

export default function UserGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("getting-started");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sections = [
    {
      id: "dashboard",
      title: "📊 Dashboard Overview",
      description: "Your central hub for managing everything",
      features: [
        "Real-time analytics and statistics",
        "Quick access to key metrics",
        "Recent activity feed",
        "Performance indicators at a glance",
      ],
    },
    {
      id: "add-single-student",
      title: "👤 Add Single Student",
      description: "Step-by-step guide to add one student manually",
      features: [
        "1. Click 'Add Student' button from Students section",
        "2. Fill in student details: Name, Email, Phone, Class/Grade",
        "3. Set enrollment date and plan/subscription",
        "4. Add guardian information (optional)",
        "5. Click 'Save' to create the student profile",
        "6. Student receives welcome email with login credentials",
        "7. You can edit details anytime from student profile",
      ],
    },
    {
      id: "bulk-upload",
      title: "📤 Bulk Upload Students (CSV)",
      description: "Import multiple students at once using CSV file",
      features: [
        "1. Go to Students section → Click 'Bulk Import'",
        "2. Download the CSV template provided",
        "3. Fill the template with student data (Name, Email, Phone, Class, etc.)",
        "4. Save the CSV file on your computer",
        "5. Upload the CSV file in the import dialog",
        "6. Preview and verify the data before importing",
        "7. Click 'Import' to add all students at once",
        "8. System will show import summary with success/error counts",
        "9. Check email notifications for import completion status",
      ],
    },
    {
      id: "students",
      title: "👥 Student Management",
      description: "Manage student records and information",
      features: [
        "Add and manage student profiles",
        "Track student progress and performance",
        "Attendance monitoring",
        "Bulk upload student data via CSV",
        "View student enrollment status",
        "Communication history with students",
      ],
    },
    {
      id: "update-students",
      title: "✏️ Update Student Information",
      description: "Edit and manage existing student records",
      features: [
        "1. Go to Students list and search for the student",
        "2. Click on student name to open their profile",
        "3. Click 'Edit' button to modify information",
        "4. Update fields like name, email, phone, class, etc.",
        "5. Change subscription/plan if needed",
        "6. Update guardian contact information",
        "7. Add notes or remarks about the student",
        "8. Click 'Save Changes' to update",
        "9. System will show confirmation message",
        "10. For bulk updates, use 'Bulk Upload' with same student emails",
      ],
    },
    {
      id: "print-guide",
      title: "🖨️ Print & Export Features",
      description: "Print reports, certificates, and export data",
      features: [
        "STUDENT LISTS: Click Print icon → Select format (PDF/Excel) → Customize columns → Print",
        "CERTIFICATES: Go to Reports → Select Attendance/Completion → Generate → Print",
        "REPORTS: Dashboard → Select report → Click Export → Choose format (PDF/Excel) → Download",
        "ATTENDANCE: Attendance page → Date range → Generate report → Print or Export",
        "TEST RESULTS: Test Analytics → Select test → Export results → Choose format → Print",
        "PAYMENT RECEIPTS: Payments section → Select payment → View receipt → Print",
        "BATCH PRINTING: Select multiple students → Bulk action → Print certificates",
        "CUSTOM HEADERS: Settings → Customize report headers with your logo",
      ],
    },
    {
      id: "tests",
      title: "📝 Test Management",
      description: "Create and manage online tests/exams",
      features: [
        "Create new tests with multiple question types",
        "Set time limits and scoring rules",
        "View test results and analytics",
        "Generate detailed performance reports",
        "Schedule tests and manage test availability",
        "Create question banks for reuse",
      ],
    },
    {
      id: "attendance",
      title: "✅ Attendance Tracking",
      description: "Monitor and manage attendance records",
      features: [
        "Mark attendance quickly and easily",
        "View attendance reports by student or class",
        "Generate attendance certificates",
        "Set attendance thresholds and alerts",
        "Export attendance data",
        "Track absent students and follow up",
      ],
    },
    {
      id: "revenue",
      title: "💰 Revenue & Payments",
      description: "Track finances and manage payments",
      features: [
        "Monitor revenue by plan and student",
        "View subscription status and renewals",
        "Payment history and invoicing",
        "Refund management",
        "Financial analytics and reports",
        "Payment gateway integration",
      ],
    },
    {
      id: "marketing",
      title: "📱 Marketing & Campaigns",
      description: "Reach out to your audience effectively",
      features: [
        "Facebook & Instagram marketing integration",
        "Create and schedule marketing campaigns",
        "View campaign performance metrics",
        "Audience targeting options",
        "WhatsApp messaging capabilities",
        "Track conversion and ROI",
      ],
    },
    {
      id: "analytics",
      title: "📈 Analytics & Reports",
      description: "Deep insights into your platform usage",
      features: [
        "Customizable dashboards",
        "Real-time performance metrics",
        "Student engagement analytics",
        "Revenue trends and forecasting",
        "Export reports in multiple formats",
        "Schedule automated reports",
      ],
    },
    {
      id: "settings",
      title: "⚙️ Settings & Configuration",
      description: "Customize your platform experience",
      features: [
        "Manage user roles and permissions",
        "Configure branding (logo, colors)",
        "Email and notification settings",
        "API key management",
        "Two-factor authentication",
        "Data backup and security settings",
      ],
    },
    {
      id: "support",
      title: "🆘 Help & Support",
      description: "Get help when you need it",
      features: [
        "In-app help documentation",
        "FAQ section for common issues",
        "Contact support team directly",
        "Check system status and updates",
        "View tips and best practices",
        "Access video tutorials",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Dashboard User Guide</h1>
          <p className="text-lg text-blue-100">
            Learn how to use every feature of our platform to manage your institution effectively
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Quick Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className={`p-3 rounded-lg text-sm font-medium transition ${
                  expandedSection === section.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {section.title.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{section.description}</p>
                </div>
                <span
                  className={`text-2xl transition-transform ${
                    expandedSection === section.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedSection === section.id && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h3>
                  <ul className="space-y-2">
                    {section.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Best Practices Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💡 Best Practices</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Security Tips</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✓ Change your password regularly</li>
                <li>✓ Enable two-factor authentication</li>
                <li>✓ Don't share your login credentials</li>
                <li>✓ Keep your software updated</li>
              </ul>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Performance Tips</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✓ Regularly backup your data</li>
                <li>✓ Use bulk import for large datasets</li>
                <li>✓ Monitor analytics regularly</li>
                <li>✓ Keep student information up to date</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Productivity Hacks</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✓ Use keyboard shortcuts for faster navigation</li>
                <li>✓ Set up automated reports</li>
                <li>✓ Customize your dashboard layout</li>
                <li>✓ Use filters to find data quickly</li>
              </ul>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Support Resources</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✓ Check FAQ for common questions</li>
                <li>✓ Watch video tutorials</li>
                <li>✓ Contact support team anytime</li>
                <li>✓ Join our community forum</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-8 mt-12">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">🚀 Getting Started</h2>
          <ol className="space-y-3 text-blue-800 dark:text-blue-200">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Log in to your account using your credentials</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Complete your profile and organization setup in Settings</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Add students using the bulk import CSV feature</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Create your first test or exam</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">5.</span>
              <span>Set up marketing campaigns to reach your students</span>
            </li>
          </ol>
        </div>

        {/* Detailed How-To Guides */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">📚 Detailed How-To Guides</h2>
          
          {/* How to Add Students */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Add Students</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">Method 1: Add Single Student</h4>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>1️⃣ Navigate to <strong>Students</strong> from the sidebar menu</li>
                  <li>2️⃣ Click the <strong>"+ Add Student"</strong> button</li>
                  <li>3️⃣ Fill in the following details:</li>
                  <ul className="ml-6 space-y-1 text-sm mt-2 mb-2">
                    <li>• Student Name (Full Name)</li>
                    <li>• Email Address (for login)</li>
                    <li>• Phone Number</li>
                    <li>• Class/Grade/Batch</li>
                    <li>• Enrollment Date</li>
                    <li>• Subscription Plan</li>
                    <li>• Guardian Name & Contact (optional)</li>
                  </ul>
                  <li>4️⃣ Click <strong>"Save Student"</strong> button</li>
                  <li>5️⃣ System generates login credentials and sends welcome email</li>
                  <li>6️⃣ You'll see confirmation: "Student added successfully ✓"</li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">Method 2: Bulk Upload (Recommended for Multiple Students)</h4>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>1️⃣ Go to <strong>Students</strong> section</li>
                  <li>2️⃣ Click <strong>"Bulk Import"</strong> or <strong>"Upload CSV"</strong> button</li>
                  <li>3️⃣ Click <strong>"Download Template"</strong> to get the CSV format</li>
                  <li>4️⃣ Open the template in Excel or Google Sheets</li>
                  <li>5️⃣ Fill in student data in each column:</li>
                  <ul className="ml-6 space-y-1 text-sm mt-2 mb-2">
                    <li>• Column A: First Name</li>
                    <li>• Column B: Last Name</li>
                    <li>• Column C: Email</li>
                    <li>• Column D: Phone</li>
                    <li>• Column E: Class</li>
                    <li>• Column F: Plan (Optional)</li>
                    <li>• Column G: Guardian Name (Optional)</li>
                  </ul>
                  <li>6️⃣ Save the file as <strong>CSV format</strong></li>
                  <li>7️⃣ Upload the CSV file in the import dialog</li>
                  <li>8️⃣ Click <strong>"Preview"</strong> to verify data (you can fix errors here)</li>
                  <li>9️⃣ Click <strong>"Import"</strong> button to add all students</li>
                  <li>🔟 Wait for completion message - you'll see: "Successfully imported X students"</li>
                </ol>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold">⚠️ Important Tips:</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 mt-2">
                  <li>• Use unique email addresses for each student</li>
                  <li>• Ensure phone numbers are in correct format</li>
                  <li>• Class names should match your existing classes</li>
                  <li>• Remove blank rows from CSV file</li>
                  <li>• For large imports (1000+), contact support for optimization</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Update Students */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Update Student Information</h3>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <ol className="space-y-2 ml-4">
                <li>1️⃣ Go to <strong>Students</strong> section</li>
                <li>2️⃣ Find the student using <strong>Search bar</strong> (name or email)</li>
                <li>3️⃣ Click on student name to open their profile</li>
                <li>4️⃣ Click the <strong>"Edit"</strong> button (pencil icon)</li>
                <li>5️⃣ Update any of these fields:</li>
                <ul className="ml-6 space-y-1 text-sm mt-2 mb-2">
                  <li>• Name</li>
                  <li>• Email address</li>
                  <li>• Phone number</li>
                  <li>• Class/Grade</li>
                  <li>• Subscription plan</li>
                  <li>• Guardian information</li>
                  <li>• Status (Active/Inactive)</li>
                </ul>
                <li>6️⃣ Click <strong>"Save Changes"</strong></li>
                <li>7️⃣ See success notification: "Student updated successfully ✓"</li>
              </ol>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-blue-800 dark:text-blue-200 font-semibold">💡 Bulk Update (for multiple students):</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Export student list → Edit in Excel/Sheets → Upload updated CSV → System will update existing records automatically
                </p>
              </div>
            </div>
          </div>

          {/* How to Print & Export */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Print & Export Data</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-3">Print Student List</h4>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>1️⃣ Go to <strong>Students</strong> section</li>
                  <li>2️⃣ Select students you want to print (use checkboxes)</li>
                  <li>3️⃣ Click <strong>"Print"</strong> icon from toolbar</li>
                  <li>4️⃣ Choose print format: <strong>List / Table / Cards</strong></li>
                  <li>5️⃣ Select columns to include in print</li>
                  <li>6️⃣ Click <strong>"Print"</strong> button</li>
                  <li>7️⃣ Select your printer and click <strong>"Print"</strong></li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">Export to Excel/CSV</h4>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>1️⃣ Navigate to any data section (Students, Attendance, Tests, etc.)</li>
                  <li>2️⃣ Apply filters if you want specific data only</li>
                  <li>3️⃣ Click <strong>"Export"</strong> button</li>
                  <li>4️⃣ Choose format: <strong>Excel (.xlsx)</strong> or <strong>CSV (.csv)</strong></li>
                  <li>5️⃣ Click <strong>"Download"</strong> - file will download to your computer</li>
                  <li>6️⃣ Open in Excel/Google Sheets for further analysis</li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-3">Generate & Print Certificates</h4>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>1️⃣ Go to <strong>Reports</strong> section</li>
                  <li>2️⃣ Click <strong>"Certificates"</strong></li>
                  <li>3️⃣ Select certificate type: <strong>Attendance / Completion / Achievement</strong></li>
                  <li>4️⃣ Choose date range or course</li>
                  <li>5️⃣ Click <strong>"Generate"</strong> button</li>
                  <li>6️⃣ Preview certificates for all eligible students</li>
                  <li>7️⃣ Click <strong>"Print All"</strong> to print all at once</li>
                  <li>8️⃣ Or <strong>"Download PDF"</strong> to save on computer</li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3">Print Reports</h4>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>1️⃣ Go to <strong>Reports & Analytics</strong></li>
                  <li>2️⃣ Select report type: <strong>Attendance / Revenue / Performance / etc.</strong></li>
                  <li>3️⃣ Set date range and filters</li>
                  <li>4️⃣ Click <strong>"Generate Report"</strong></li>
                  <li>5️⃣ Review the report on screen</li>
                  <li>6️⃣ Click <strong>"Print"</strong> or <strong>"Download PDF"</strong></li>
                  <li>7️⃣ Choose print destination and settings</li>
                  <li>8️⃣ Click <strong>"Print"</strong> to complete</li>
                </ol>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4">
                <p className="text-indigo-800 dark:text-indigo-200 font-semibold">🖨️ Printer Settings Tips:</p>
                <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1 mt-2">
                  <li>• Set page orientation to <strong>Landscape</strong> for tables</li>
                  <li>• Adjust margins to fit more content</li>
                  <li>• Enable <strong>"Print background colors"</strong> for better appearance</li>
                  <li>• Use <strong>PDF printer</strong> if you want to save as PDF</li>
                  <li>• For certificates, use <strong>thick paper</strong> for professional look</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Common Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">⚡ Common Quick Tasks</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Mark Attendance</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Attendance → Select Class → Today's Date → Check students → Click "Mark Attendance"
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Create Test</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Tests → Add New Test → Add Questions → Set Time Limit → Publish → Share Link
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">View Performance</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Analytics → Dashboard → View graphs → Click on specific metric for details
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Send Messages</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Campaigns → Create Campaign → Select Students → Write Message → Schedule/Send
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Generate Invoice</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Payments → Select Student → Click "Invoice" → Download/Print
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Backup Data</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Settings → Backup → Click "Backup Now" → Download backup file to safe location
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Contact Support
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
