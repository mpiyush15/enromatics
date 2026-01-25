"use client";

import { useState } from "react";
import Link from "next/link";

export default function UserGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("getting-started");
  const [selectedItemId, setSelectedItemId] = useState<string>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const categories = [
    {
      name: "Getting Started",
      id: "getting-started",
      items: [
        { id: "overview", title: "Dashboard Overview" },
        { id: "first-steps", title: "First Steps" },
        { id: "account-setup", title: "Account Setup" },
      ],
    },
    {
      name: "Student Management",
      id: "student-management",
      items: [
        { id: "add-single-student", title: "Add Single Student" },
        { id: "bulk-upload", title: "Bulk Upload (CSV)" },
        { id: "update-student", title: "Update Student Info" },
        { id: "manage-classes", title: "Manage Classes" },
      ],
    },
    {
      name: "Academics",
      id: "academics",
      items: [
        { id: "create-test", title: "Create Tests/Exams" },
        { id: "manage-attendance", title: "Manage Attendance" },
        { id: "view-results", title: "View Test Results" },
        { id: "performance-tracking", title: "Performance Tracking" },
      ],
    },
    {
      name: "Finance & Billing",
      id: "finance",
      items: [
        { id: "manage-payments", title: "Manage Payments" },
        { id: "invoices", title: "Generate Invoices" },
        { id: "subscriptions", title: "Subscription Plans" },
        { id: "financial-reports", title: "Financial Reports" },
      ],
    },
    {
      name: "Marketing & Communication",
      id: "marketing",
      items: [
        { id: "send-campaigns", title: "Send Campaigns" },
        { id: "whatsapp-messaging", title: "WhatsApp Messaging" },
        { id: "email-notifications", title: "Email Notifications" },
        { id: "campaign-analytics", title: "Campaign Analytics" },
      ],
    },
    {
      name: "Reports & Export",
      id: "reports-export",
      items: [
        { id: "print-guide", title: "Print & Export Data" },
        { id: "generate-reports", title: "Generate Reports" },
        { id: "export-formats", title: "Export Formats" },
        { id: "certificates", title: "Generate Certificates" },
      ],
    },
    {
      name: "Settings",
      id: "settings",
      items: [
        { id: "account-settings", title: "Account Settings" },
        { id: "security", title: "Security & Privacy" },
        { id: "user-roles", title: "User Roles & Permissions" },
        { id: "integrations", title: "Integrations" },
      ],
    },
    {
      name: "Troubleshooting",
      id: "troubleshooting",
      items: [
        { id: "common-issues", title: "Common Issues" },
        { id: "contact-support", title: "Contact Support" },
        { id: "faqs", title: "Frequently Asked Questions" },
      ],
    },
  ];

  const contentSections = {
    // Getting Started
    overview: {
      title: "Dashboard Overview",
      category: "Getting Started",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to your Enromatics Dashboard! This is your central hub for managing students, tests, attendance, and more.
          </p>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Sections:</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>📊 <strong>Dashboard</strong> - Real-time analytics and quick metrics</li>
              <li>👥 <strong>Students</strong> - Add, manage, and track student records</li>
              <li>📝 <strong>Tests</strong> - Create and manage exams</li>
              <li>✅ <strong>Attendance</strong> - Track daily attendance</li>
              <li>💰 <strong>Payments</strong> - Manage subscriptions and invoices</li>
              <li>📱 <strong>Marketing</strong> - Send campaigns and communications</li>
              <li>📈 <strong>Analytics</strong> - View detailed reports</li>
              <li>⚙️ <strong>Settings</strong> - Configure your account</li>
            </ul>
          </div>
        </div>
      ),
    },
    "first-steps": {
      title: "Your First Steps",
      category: "Getting Started",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Complete your profile in Settings</li>
            <li>Set up your organization/institution name and logo</li>
            <li>Create classes/batches for your students</li>
            <li>Add your first batch of students (single or bulk)</li>
            <li>Create your first test or exam</li>
            <li>Set up communication templates</li>
            <li>Configure payment settings</li>
          </ol>
        </div>
      ),
    },
    "account-setup": {
      title: "Account Setup Guide",
      category: "Getting Started",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Step 1: Basic Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Go to Settings → Profile</p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
              <li>• Organization name</li>
              <li>• Admin contact email</li>
              <li>• Phone number</li>
              <li>• Location/Address</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Step 2: Branding</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Go to Settings → Branding</p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
              <li>• Upload your logo</li>
              <li>• Choose primary color</li>
              <li>• Customize footer text</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Step 3: Create Classes</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Go to Classes → Add New Class</p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
              <li>• Class name (e.g., Class 10-A, Grade 8)</li>
              <li>• Academic year</li>
              <li>• Assign teachers/instructors</li>
            </ul>
          </div>
        </div>
      ),
    },
    // Student Management
    "add-single-student": {
      title: "Add Single Student",
      category: "Student Management",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-800 dark:text-blue-200">Best for: Adding one student at a time manually</p>
          </div>
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Students</strong> section from the sidebar</li>
            <li>Click the <strong>"+ Add Student"</strong> button</li>
            <li>Fill in the following information:
              <ul className="mt-2 ml-4 space-y-1">
                <li>• Student Name (Full Name)</li>
                <li>• Email Address (for login credentials)</li>
                <li>• Phone Number</li>
                <li>• Class/Grade/Batch</li>
                <li>• Enrollment Date</li>
                <li>• Subscription Plan</li>
                <li>• Guardian Name (optional)</li>
                <li>• Guardian Phone (optional)</li>
              </ul>
            </li>
            <li>Click <strong>"Save Student"</strong></li>
            <li>System generates login credentials and sends welcome email</li>
          </ol>
        </div>
      ),
    },
    "bulk-upload": {
      title: "Bulk Upload Students (CSV)",
      category: "Student Management",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-green-800 dark:text-green-200"><strong>Recommended for:</strong> Adding 10+ students at once</p>
          </div>
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Students</strong> → Click <strong>"Bulk Import"</strong> button</li>
            <li>Click <strong>"Download CSV Template"</strong></li>
            <li>Open the template in Excel or Google Sheets</li>
            <li>Fill in student data:
              <table className="mt-2 w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border p-2 text-left">Column</th>
                    <th className="border p-2 text-left">Format</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr><td className="border p-2">First Name</td><td className="border p-2">Required</td></tr>
                  <tr><td className="border p-2">Last Name</td><td className="border p-2">Required</td></tr>
                  <tr><td className="border p-2">Email</td><td className="border p-2">Unique email address</td></tr>
                  <tr><td className="border p-2">Phone</td><td className="border p-2">Format: 1234567890</td></tr>
                  <tr><td className="border p-2">Class</td><td className="border p-2">Must match existing classes</td></tr>
                  <tr><td className="border p-2">Plan</td><td className="border p-2">Optional</td></tr>
                </tbody>
              </table>
            </li>
            <li>Save the file as <strong>CSV format</strong></li>
            <li>Upload the CSV file</li>
            <li>Review the preview and fix any errors</li>
            <li>Click <strong>"Import"</strong> to add all students</li>
            <li>Check your email for import completion confirmation</li>
          </ol>
        </div>
      ),
    },
    "update-student": {
      title: "Update Student Information",
      category: "Student Management",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Students</strong> section</li>
            <li>Search for the student using the search bar</li>
            <li>Click on the student's name to view their profile</li>
            <li>Click the <strong>"Edit"</strong> button (pencil icon)</li>
            <li>Update any of these fields:
              <ul className="mt-2 ml-4 space-y-1">
                <li>• Name</li>
                <li>• Email</li>
                <li>• Phone</li>
                <li>• Class</li>
                <li>• Subscription Plan</li>
                <li>• Status (Active/Inactive/Suspended)</li>
              </ul>
            </li>
            <li>Click <strong>"Save Changes"</strong></li>
            <li>See the confirmation message</li>
          </ol>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-yellow-800 dark:text-yellow-200"><strong>💡 Tip:</strong> For bulk updates, export student list, edit in Excel, and re-upload the CSV file.</p>
          </div>
        </div>
      ),
    },
    "manage-classes": {
      title: "Manage Classes",
      category: "Student Management",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Create a New Class</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>Classes</strong></li>
              <li>Click <strong>"+ Add Class"</strong></li>
              <li>Enter class name (e.g., "Class 10-A", "Grade 8")</li>
              <li>Select academic year</li>
              <li>Assign teachers/instructors (optional)</li>
              <li>Click <strong>"Create Class"</strong></li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Edit or Delete a Class</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>Classes</strong></li>
              <li>Find the class in the list</li>
              <li>Click <strong>"Edit"</strong> to modify or <strong>"Delete"</strong> to remove</li>
              <li>Confirm your action</li>
            </ol>
          </div>
        </div>
      ),
    },
    // Academics
    "create-test": {
      title: "Create Tests/Exams",
      category: "Academics",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Tests</strong> section</li>
            <li>Click <strong>"+ Create New Test"</strong></li>
            <li>Fill in test details (name, description, subject, marks, duration)</li>
            <li>Add questions (MCQ, short answer, long answer, true/false)</li>
            <li>Set passing score and weightage</li>
            <li>Choose visibility (Public / Private / By invitation)</li>
            <li>Set start and end dates</li>
            <li>Click <strong>"Save & Publish"</strong></li>
            <li>Share the test link with students</li>
          </ol>
        </div>
      ),
    },
    "manage-attendance": {
      title: "Manage Attendance",
      category: "Academics",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Mark Daily Attendance</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Attendance</strong> section</li>
              <li>Select the class</li>
              <li>Today's date is automatically selected</li>
              <li>Check the checkboxes for present students</li>
              <li>Add remarks if needed (optional)</li>
              <li>Click <strong>"Save Attendance"</strong></li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">View Attendance Report</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Reports</strong> → <strong>"Attendance"</strong></li>
              <li>Select class and date range</li>
              <li>View attendance percentage for each student</li>
              <li>Export or print the report</li>
            </ol>
          </div>
        </div>
      ),
    },
    "view-results": {
      title: "View Test Results",
      category: "Academics",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Tests</strong> section</li>
            <li>Find and click on the test name</li>
            <li>Click <strong>"View Results"</strong> tab</li>
            <li>See all student submissions with scores</li>
            <li>Click on individual student to view detailed answers</li>
            <li>Review marking and provide feedback if needed</li>
            <li>Export results as Excel/PDF</li>
            <li>Use <strong>"Analytics"</strong> tab for performance charts</li>
          </ol>
        </div>
      ),
    },
    "performance-tracking": {
      title: "Performance Tracking",
      category: "Academics",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Individual Student Performance</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Students</strong> section</li>
              <li>Click on student name</li>
              <li>View the <strong>"Performance"</strong> tab</li>
              <li>See test scores, attendance, and progress</li>
              <li>View performance graphs and trends</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Class Performance</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Analytics</strong> → <strong>"Performance"</strong></li>
              <li>Select class and subject</li>
              <li>View average scores and student rankings</li>
              <li>Identify top performers and students needing help</li>
            </ol>
          </div>
        </div>
      ),
    },
    // Finance & Billing
    "manage-payments": {
      title: "Manage Payments",
      category: "Finance & Billing",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Payments</strong> section</li>
            <li>View all student subscriptions and payment status</li>
            <li>Click on student to view payment details</li>
            <li>Process refunds if needed</li>
            <li>View payment method and transaction ID</li>
            <li>Download receipt or invoice</li>
            <li>Set up automatic reminders for pending payments</li>
          </ol>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500 mt-4">
            <p className="text-green-800 dark:text-green-200"><strong>✓ Payment Status:</strong> Active, Expired, Pending, Refunded</p>
          </div>
        </div>
      ),
    },
    invoices: {
      title: "Generate Invoices",
      category: "Finance & Billing",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Payments</strong> → Find student</li>
            <li>Click <strong>"View Invoice"</strong> or <strong>"Generate Invoice"</strong></li>
            <li>Review invoice details</li>
            <li>Click <strong>"Download PDF"</strong> to save invoice</li>
            <li>Click <strong>"Print"</strong> to print</li>
            <li>Send invoice to student email (optional)</li>
            <li>Use <strong>"Bulk Invoice"</strong> for multiple students</li>
          </ol>
        </div>
      ),
    },
    subscriptions: {
      title: "Subscription Plans",
      category: "Finance & Billing",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">View/Edit Plans</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Subscription Plans"</strong></li>
              <li>View all active plans</li>
              <li>Click <strong>"Edit"</strong> to modify</li>
              <li>Click <strong>"Deactivate"</strong> to remove</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Create New Plan</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Click <strong>"+ Add New Plan"</strong></li>
              <li>Enter plan name</li>
              <li>Set pricing</li>
              <li>Define features</li>
              <li>Set trial duration (optional)</li>
              <li>Click <strong>"Save Plan"</strong></li>
            </ol>
          </div>
        </div>
      ),
    },
    "financial-reports": {
      title: "Financial Reports",
      category: "Finance & Billing",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Reports</strong> → <strong>"Finance"</strong></li>
            <li>Select report type (Revenue, Payments, Subscriptions, Refunds)</li>
            <li>Choose date range</li>
            <li>View or export report</li>
            <li>Analyze revenue trends</li>
          </ol>
        </div>
      ),
    },
    // Marketing
    "send-campaigns": {
      title: "Send Campaigns",
      category: "Marketing & Communication",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Marketing</strong> → <strong>"Campaigns"</strong></li>
            <li>Click <strong>"+ Create Campaign"</strong></li>
            <li>Choose type (Email / SMS / Push Notification)</li>
            <li>Name your campaign</li>
            <li>Select target audience</li>
            <li>Compose your message</li>
            <li>Preview before sending</li>
            <li>Schedule or send immediately</li>
            <li>Monitor delivery status</li>
          </ol>
        </div>
      ),
    },
    "whatsapp-messaging": {
      title: "WhatsApp Messaging",
      category: "Marketing & Communication",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Send WhatsApp Messages</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Marketing</strong> → <strong>"WhatsApp"</strong></li>
              <li>Click <strong>"+ New Message"</strong></li>
              <li>Select recipients</li>
              <li>Write your message</li>
              <li>Add media if needed</li>
              <li>Click <strong>"Send"</strong></li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Create Message Template</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Message Templates"</strong></li>
              <li>Click <strong>"+ Create Template"</strong></li>
              <li>Name the template</li>
              <li>Write content with variables</li>
              <li>Save for future use</li>
            </ol>
          </div>
        </div>
      ),
    },
    "email-notifications": {
      title: "Email Notifications",
      category: "Marketing & Communication",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Settings</strong> → <strong>"Email Settings"</strong></li>
            <li>Choose which events trigger emails</li>
            <li>Customize email templates</li>
            <li>Add your signature</li>
            <li>Save settings</li>
          </ol>
        </div>
      ),
    },
    "campaign-analytics": {
      title: "Campaign Analytics",
      category: "Marketing & Communication",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Marketing</strong> → <strong>"Analytics"</strong></li>
            <li>View campaign performance metrics</li>
            <li>See: Sent, Delivered, Opened, Click-through rate</li>
            <li>Click on specific campaign for details</li>
            <li>Export analytics as PDF/Excel</li>
            <li>Optimize future campaigns</li>
          </ol>
        </div>
      ),
    },
    // Reports & Export
    "print-guide": {
      title: "Print & Export Data",
      category: "Reports & Export",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🖨️ Print Student Lists</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Students</strong> section</li>
              <li>Filter students if needed</li>
              <li>Click <strong>"Print"</strong> button</li>
              <li>Choose format</li>
              <li>Select columns to include</li>
              <li>Click <strong>"Print"</strong></li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📊 Export to Excel/CSV</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to any data section</li>
              <li>Apply filters if needed</li>
              <li>Click <strong>"Export"</strong> button</li>
              <li>Choose format (Excel or CSV)</li>
              <li>File downloads to your computer</li>
              <li>Open in Excel/Google Sheets</li>
            </ol>
          </div>
        </div>
      ),
    },
    "generate-reports": {
      title: "Generate Reports",
      category: "Reports & Export",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Reports</strong> section</li>
            <li>Select report type</li>
            <li>Set date range and filters</li>
            <li>Click <strong>"Generate"</strong></li>
            <li>Review report</li>
            <li>Export as needed</li>
            <li>Schedule recurring reports (optional)</li>
          </ol>
        </div>
      ),
    },
    "export-formats": {
      title: "Export Formats",
      category: "Reports & Export",
      content: (
        <div className="space-y-6">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border p-3 text-left">Format</th>
                <th className="border p-3 text-left">Best For</th>
                <th className="border p-3 text-left">Usage</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 dark:text-gray-300">
              <tr>
                <td className="border p-3"><strong>Excel (.xlsx)</strong></td>
                <td className="border p-3">Data analysis</td>
                <td className="border p-3">✓ Sort, filter, calculate</td>
              </tr>
              <tr>
                <td className="border p-3"><strong>CSV (.csv)</strong></td>
                <td className="border p-3">Import to other tools</td>
                <td className="border p-3">✓ Universal format</td>
              </tr>
              <tr>
                <td className="border p-3"><strong>PDF</strong></td>
                <td className="border p-3">Professional reports</td>
                <td className="border p-3">✓ Printing, sharing</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    certificates: {
      title: "Generate Certificates",
      category: "Reports & Export",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Reports</strong> → <strong>"Certificates"</strong></li>
            <li>Select certificate type</li>
            <li>Choose date range or course</li>
            <li>Set eligibility criteria</li>
            <li>Click <strong>"Generate"</strong></li>
            <li>Preview certificates</li>
            <li>Click <strong>"Print All"</strong> or <strong>"Download PDF"</strong></li>
            <li>Print on certificate paper</li>
          </ol>
        </div>
      ),
    },
    // Settings
    "account-settings": {
      title: "Account Settings",
      category: "Settings",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Update Profile</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Profile"</strong></li>
              <li>Update name, email, phone</li>
              <li>Change password</li>
              <li>Upload profile picture</li>
              <li>Save changes</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Organization Settings</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Organization"</strong></li>
              <li>Update organization name</li>
              <li>Add address and contact info</li>
              <li>Upload logo</li>
              <li>Configure timezone</li>
            </ol>
          </div>
        </div>
      ),
    },
    security: {
      title: "Security & Privacy",
      category: "Settings",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Enable Two-Factor Authentication</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Security"</strong></li>
              <li>Click <strong>"Enable 2FA"</strong></li>
              <li>Choose method: SMS or Authenticator App</li>
              <li>Follow verification steps</li>
              <li>Save backup codes</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Manage Privacy</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Privacy"</strong></li>
              <li>Review data collection settings</li>
              <li>Manage cookie preferences</li>
              <li>Set data retention policies</li>
              <li>Download your data</li>
            </ol>
          </div>
        </div>
      ),
    },
    "user-roles": {
      title: "User Roles & Permissions",
      category: "Settings",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Manage Users</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Go to <strong>Settings</strong> → <strong>"Users & Roles"</strong></li>
              <li>Click <strong>"+ Add User"</strong></li>
              <li>Enter user email</li>
              <li>Select role</li>
              <li>Set permissions</li>
              <li>Send invitation</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">User Roles</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Admin:</strong> Full access</li>
              <li><strong>Teacher:</strong> Manage classes and tests</li>
              <li><strong>Support:</strong> Handle student issues</li>
              <li><strong>Accountant:</strong> Manage payments</li>
            </ul>
          </div>
        </div>
      ),
    },
    integrations: {
      title: "Integrations",
      category: "Settings",
      content: (
        <div className="space-y-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-5">
            <li>Go to <strong>Settings</strong> → <strong>"Integrations"</strong></li>
            <li>Choose integration to set up</li>
            <li>Click <strong>"Connect"</strong></li>
            <li>Authorize and provide API keys</li>
            <li>Test the integration</li>
            <li>Save settings</li>
          </ol>
        </div>
      ),
    },
    // Troubleshooting
    "common-issues": {
      title: "Common Issues",
      category: "Troubleshooting",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">❌ Forgot Password</h3>
              <p className="text-gray-700 dark:text-gray-300">Click "Forgot Password" → Enter email → Check inbox for reset link → Create new password</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">❌ Student Can't Login</h3>
              <p className="text-gray-700 dark:text-gray-300">Check email → Verify password → Reset from admin panel → Clear browser cache</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">❌ CSV Import Failed</h3>
              <p className="text-gray-700 dark:text-gray-300">Ensure unique emails → Remove blank rows → Check date format → Use correct class names</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">❌ Payment Not Received</h3>
              <p className="text-gray-700 dark:text-gray-300">Check gateway settings → Verify account is active → Check transaction logs</p>
            </div>
          </div>
        </div>
      ),
    },
    "contact-support": {
      title: "Contact Support",
      category: "Troubleshooting",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📧 Email</h3>
              <p className="text-gray-700 dark:text-gray-300">support@enromatics.com</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📱 WhatsApp</h3>
              <p className="text-gray-700 dark:text-gray-300">+91 XXXXX XXXXX (9 AM - 6 PM IST)</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">💬 In-App Chat</h3>
              <p className="text-gray-700 dark:text-gray-300">Click help icon (?) in bottom right</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📞 Phone</h3>
              <p className="text-gray-700 dark:text-gray-300">Schedule a call: Help → Request Callback</p>
            </div>
          </div>
        </div>
      ),
    },
    faqs: {
      title: "Frequently Asked Questions",
      category: "Troubleshooting",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Q: How many students can I add?</h3>
            <p className="text-gray-700 dark:text-gray-300">A: Unlimited! Add as many as your plan allows.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Q: Can I change my subscription?</h3>
            <p className="text-gray-700 dark:text-gray-300">A: Yes, upgrade or downgrade anytime. Changes take effect at next billing cycle.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Q: Is my data backed up?</h3>
            <p className="text-gray-700 dark:text-gray-300">A: Yes, automatic daily backups. Manual backup available in Settings.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Q: Can teachers create tests?</h3>
            <p className="text-gray-700 dark:text-gray-300">A: Yes! Teachers with permissions can create and manage tests.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Q: How do I export attendance?</h3>
            <p className="text-gray-700 dark:text-gray-300">A: Reports → Attendance → Select range → Export as Excel/PDF</p>
          </div>
        </div>
      ),
    },
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
  const contentData = contentSections[selectedItemId as keyof typeof contentSections] || {
    title: "Welcome",
    category: "Getting Started",
    content: <p>Select a topic to get started</p>,
  };

  // Helper function to get quick tips based on selectedItemId
  const getQuickTip = () => {
    const tips: Record<string, string> = {
      "bulk-upload": "💡 Use CSV format for faster uploads. Download our template for the correct column structure.",
      "manage-attendance": "💡 Save attendance daily to avoid data loss. Use bulk mark feature to save time with large classes.",
      "invoices": "💡 Set up payment reminders automatically. Send invoices 5-7 days before due date for better payment rates.",
      "print-reports": "💡 Choose landscape orientation for better table visibility. Export as PDF for easy sharing.",
      "certificates": "💡 Generate certificates in bulk from Reports → Certificates. Customize templates in Settings.",
      "performance-tracking": "💡 Compare students with class average. Use filters to analyze performance by subject or time period.",
      "financial-reports": "💡 Check monthly financial summary in Reports. Export to Excel for accounting software integration.",
      "custom-campaigns": "💡 Personalize messages with student names. Segment by class or performance for better engagement.",
    };
    return tips[selectedItemId] || "💡 Tip: Take your time exploring features. Check our FAQ section if you need help.";
  };

  // Helper function to get related topics
  const getRelatedTopics = () => {
    const related: Record<string, Array<{ id: string; title: string }>> = {
      "add-single-student": [
        { id: "bulk-upload", title: "Bulk Upload (CSV)" },
        { id: "manage-classes", title: "Manage Classes" },
        { id: "update-student", title: "Update Student Info" },
      ],
      "bulk-upload": [
        { id: "add-single-student", title: "Add Single Student" },
        { id: "update-student", title: "Update Student Info" },
        { id: "faqs", title: "FAQs" },
      ],
      "manage-attendance": [
        { id: "performance-tracking", title: "Performance Tracking" },
        { id: "view-results", title: "View Test Results" },
        { id: "print-reports", title: "Print Reports" },
      ],
      "invoices": [
        { id: "manage-payments", title: "Manage Payments" },
        { id: "subscriptions", title: "Subscription Plans" },
        { id: "financial-reports", title: "Financial Reports" },
      ],
      "print-reports": [
        { id: "manage-attendance", title: "Manage Attendance" },
        { id: "view-results", title: "View Test Results" },
        { id: "performance-tracking", title: "Performance Tracking" },
      ],
    };
    return related[selectedItemId] || [];
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Documentation</h2>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full px-6 py-3 text-left text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {category.name}
              </button>
              {selectedCategory === category.id && (
                <div className="bg-gray-50 dark:bg-gray-900/50">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`block w-full px-6 pl-12 py-2 text-left text-xs transition ${
                        selectedItemId === item.id
                          ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-900/10"
                          : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="sticky top-0 left-0 p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>

        {/* Content Area with Right Sidebar */}
        <div className="flex-1 flex">
          {/* Center Content */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-3xl">
              <div className="mb-6">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{contentData.category}</p>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{contentData.title}</h1>
              </div>

              <div className="prose prose-invert max-w-none dark:prose-invert">{contentData.content}</div>

              {/* Navigation Links */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <Link
                  href="/contact"
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Need Help?
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Dashboard →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Quick Navigation & Tips */}
          <div className="hidden lg:block w-64 overflow-auto bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
            {/* Quick Tip Box */}
            <div className="mb-8">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">{getQuickTip()}</p>
              </div>
            </div>

            {/* Related Topics */}
            {getRelatedTopics().length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Related Topics</h3>
                <nav className="space-y-2">
                  {getRelatedTopics().map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedItemId(topic.id)}
                      className="block w-full text-left px-3 py-2 text-sm rounded transition text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      → {topic.title}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Actions for specific pages */}
            {(selectedItemId === "bulk-upload" || selectedItemId === "manage-attendance" || selectedItemId === "print-reports" || selectedItemId === "invoices") && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {selectedItemId === "bulk-upload" && (
                    <>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        📥 Download CSV Template
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        ⚡ Start Bulk Upload
                      </button>
                    </>
                  )}
                  {selectedItemId === "manage-attendance" && (
                    <>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        📋 Mark Attendance
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        👥 View Reports
                      </button>
                    </>
                  )}
                  {selectedItemId === "print-reports" && (
                    <>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        🖨️ Print Attendance
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        📊 Export as Excel
                      </button>
                    </>
                  )}
                  {selectedItemId === "invoices" && (
                    <>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        💰 Create Invoice
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">
                        📤 Send to Student
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Need Help?</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Can't find what you're looking for?
              </p>
              <Link
                href="/contact"
                className="block w-full px-3 py-2 text-sm text-center rounded bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
