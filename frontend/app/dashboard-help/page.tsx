'use client';

import { useState } from 'react';
import { ChevronRight, Home, Users, BookOpen, DollarSign, Megaphone, MessageSquare, Trophy, Settings, HelpCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  content: string;
  steps?: string[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    icon: <Home className="w-5 h-5" />,
    label: 'Home Dashboard',
    topics: [
      {
        id: 'home-overview',
        title: 'Dashboard Overview',
        content: 'Your home dashboard displays quick statistics of your institute including total students, active batches, monthly revenue, and pending fees.',
        steps: [
          'Log in to your account',
          'You'll automatically land on the Home Dashboard',
          'View key metrics in the statistics cards',
          'Check recent activities at the bottom'
        ]
      },
      {
        id: 'home-widgets',
        title: 'Understanding Widgets',
        content: 'The dashboard has several important widgets that show your institute performance at a glance.',
        steps: [
          'Statistics Cards: Shows total students, batches, revenue, pending fees',
          'Analytics Chart: Monthly trends for enrollment and revenue',
          'Recent Activities: Latest updates in your institute'
        ]
      }
    ]
  },
  {
    id: 'academics',
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Academics',
    topics: [
      {
        id: 'academics-batches',
        title: 'Manage Batches',
        content: 'Create and manage your teaching batches/groups. Each batch can have multiple students, teachers, and schedules.',
        steps: [
          'Go to Academics → Batches',
          'Click "Create Batch" button',
          'Enter batch name (e.g., "JEE Prep - Jan 2026")',
          'Select subject and level',
          'Add teachers and set seat capacity',
          'Click "Create"'
        ]
      },
      {
        id: 'academics-attendance',
        title: 'Mark Attendance',
        content: 'Track student attendance for each class. Mark students as present, absent, or late.',
        steps: [
          'Go to Academics → Attendance',
          'Select the date and batch',
          'Click "Mark Attendance"',
          'Check ✓ for present students',
          'Add remarks if needed',
          'Click "Save Attendance"'
        ]
      },
      {
        id: 'academics-schedule',
        title: 'Create Class Schedule',
        content: 'Plan your class timings and create a schedule that students can view.',
        steps: [
          'Go to Academics → Schedules',
          'Click "New Schedule"',
          'Select the batch',
          'Add classes with day, time, and teacher',
          'Save the schedule'
        ]
      },
      {
        id: 'academics-marks',
        title: 'Add & Manage Marks',
        content: 'Record test results and student performance. View reports and track improvement.',
        steps: [
          'Go to Academics → Marks',
          'Click "Add Test"',
          'Enter test details (name, subject, total marks, date)',
          'Enter marks for each student',
          'Add remarks if needed',
          'Save marks'
        ]
      }
    ]
  },
  {
    id: 'students',
    icon: <Users className="w-5 h-5" />,
    label: 'Student Management',
    topics: [
      {
        id: 'students-add-single',
        title: 'Add Single Student',
        content: 'Add students one by one through the student registration form.',
        steps: [
          'Go to Students → Add Student',
          'Fill basic information (name, email, phone)',
          'Add parent contact details',
          'Enter address information',
          'Select batch and set fees',
          'Click "Create Student Account"',
          'System generates login credentials automatically'
        ]
      },
      {
        id: 'students-bulk-upload',
        title: 'Bulk Upload Students',
        content: 'Add multiple students at once using a CSV file for faster enrollment.',
        steps: [
          'Go to Students → Bulk Upload',
          'Download the CSV template',
          'Fill in student data (Name, Email, Phone, etc.)',
          'Upload the CSV file',
          'Review data and confirm',
          'All students created with auto-generated credentials'
        ]
      },
      {
        id: 'students-manage',
        title: 'Manage Student Profile',
        content: 'View, edit, and manage individual student information and access.',
        steps: [
          'Go to Students → Search Student',
          'Click on the student name',
          'View tabs: Personal Info, Attendance, Marks, Payments',
          'Click "Edit" to change information',
          'Share credentials for student portal access',
          'Save changes'
        ]
      },
      {
        id: 'students-portal',
        title: 'Student Portal Access',
        content: 'Students can view their own information through the student portal.',
        steps: [
          'Generate login credentials for student',
          'Share email and password',
          'Student logs in at portal.enromatics.com',
          'Student can view marks, attendance, fees, and schedule'
        ]
      }
    ]
  },
  {
    id: 'accounts',
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Accounts & Finance',
    topics: [
      {
        id: 'accounts-payment',
        title: 'Record Payment',
        content: 'Record student fee payments whether cash, card, or bank transfer.',
        steps: [
          'Go to Accounts → Payments',
          'Click "Add Payment"',
          'Select student',
          'Enter amount and payment method',
          'Add transaction ID for online payments',
          'Receipt is generated automatically'
        ]
      },
      {
        id: 'accounts-fees',
        title: 'Set Fee Structure',
        content: 'Define fee plans for different batches and payment options.',
        steps: [
          'Go to Accounts → Fee Configuration',
          'Click "Create Fee Plan"',
          'Enter monthly, quarterly, and annual fees',
          'Set payment due date',
          'Assign to batches',
          'Save plan'
        ]
      },
      {
        id: 'accounts-pending',
        title: 'View Pending Fees',
        content: 'See which students have outstanding fees and send reminders.',
        steps: [
          'Go to Accounts → Fees Pending',
          'View all students with amount due',
          'Click student to record payment',
          'Generate payment reminder',
          'Track overdue payments'
        ]
      },
      {
        id: 'accounts-reports',
        title: 'Financial Reports',
        content: 'Generate reports on income, expenses, and financial status.',
        steps: [
          'Go to Accounts → Reports',
          'Select report type (Daily/Monthly/Quarterly)',
          'Choose date range',
          'View total collected, pending, defaulters',
          'Export as PDF or CSV'
        ]
      },
      {
        id: 'accounts-expenses',
        title: 'Track Expenses',
        content: 'Record and categorize expenses for your institute.',
        steps: [
          'Go to Accounts → Expenses',
          'Click "Add Expense"',
          'Enter category (Rent, Supplies, Salary, etc.)',
          'Add amount, date, and description',
          'Upload receipt if available',
          'Save expense'
        ]
      }
    ]
  },
  {
    id: 'leads',
    icon: <Megaphone className="w-5 h-5" />,
    label: 'Leads & Marketing',
    topics: [
      {
        id: 'leads-add',
        title: 'Add New Lead',
        content: 'Track potential students who have inquired about your institute.',
        steps: [
          'Go to Leads → Add Lead',
          'Fill name, phone, and email',
          'Select inquiry source (Website, WhatsApp, Referral)',
          'Choose interested subject',
          'Set initial status',
          'Add notes and save'
        ]
      },
      {
        id: 'leads-track',
        title: 'Track Lead Progress',
        content: 'Manage leads through different stages from inquiry to enrollment.',
        steps: [
          'Go to Leads → All Leads',
          'View Kanban board with lead statuses',
          'Drag leads to update status',
          'New → Contacted → Interested → Negotiating → Converted',
          'Click lead to add follow-up notes'
        ]
      },
      {
        id: 'leads-convert',
        title: 'Convert Lead to Student',
        content: 'When a lead decides to join, convert them to a student account.',
        steps: [
          'Open the lead details',
          'Click "Convert to Student"',
          'System pre-fills information',
          'Complete student enrollment',
          'Lead marked as "Converted"',
          'Student account is created'
        ]
      }
    ]
  },
  {
    id: 'whatsapp',
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'WhatsApp Integration',
    topics: [
      {
        id: 'whatsapp-send',
        title: 'Send Messages',
        content: 'Send direct WhatsApp messages to students and parents.',
        steps: [
          'Go to WhatsApp → Send Message',
          'Select recipient (student or parent)',
          'Type your message',
          'Click "Send"',
          'Message delivered via WhatsApp'
        ]
      },
      {
        id: 'whatsapp-campaigns',
        title: 'Create Campaigns',
        content: 'Send bulk messages to groups of students at scheduled times.',
        steps: [
          'Go to WhatsApp → Campaigns',
          'Click "Create Campaign"',
          'Select recipient group (All Students/Specific Batch)',
          'Choose or create message template',
          'Schedule date and time',
          'Click "Send Campaign"'
        ]
      },
      {
        id: 'whatsapp-chatbot',
        title: 'Setup Chatbot',
        content: 'Configure automated responses for common student questions.',
        steps: [
          'Go to WhatsApp → Chatbots',
          'Click "Create Chatbot"',
          'Set bot name',
          'Enable welcome message',
          'Add keywords and auto-responses',
          'Example: Keyword "fees" → Response "Fee structure is..."',
          'Save chatbot'
        ]
      }
    ]
  },
  {
    id: 'exams',
    icon: <Trophy className="w-5 h-5" />,
    label: 'Exams & Scholarships',
    topics: [
      {
        id: 'exams-create',
        title: 'Create Online Exam',
        content: 'Create and conduct online tests and scholarship exams.',
        steps: [
          'Go to Exams → Create Exam',
          'Enter exam name, subject, duration',
          'Set total marks and passing marks',
          'Set exam date and time',
          'Save exam'
        ]
      },
      {
        id: 'exams-questions',
        title: 'Add Questions',
        content: 'Add multiple choice, short answer, or essay questions to your exam.',
        steps: [
          'Open exam → Click "Add Questions"',
          'For each question enter:',
          '- Question type (MCQ/Short/Essay)',
          '- Question text and options',
          '- Correct answer and marks',
          'Save all questions'
        ]
      },
      {
        id: 'exams-results',
        title: 'Publish Results',
        content: 'Grade exams and publish results for students to view.',
        steps: [
          'After exam ends, go to Results',
          'System auto-grades MCQ questions',
          'Review essay answers manually',
          'Click "Publish Results"',
          'Students see scores immediately'
        ]
      }
    ]
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings',
    topics: [
      {
        id: 'settings-institute',
        title: 'Edit Institute Info',
        content: 'Update your institute name, logo, contact details, and branding.',
        steps: [
          'Go to Settings → Institute Details',
          'Update institute name and description',
          'Upload logo and favicon',
          'Add contact phone and email',
          'Enter address and website',
          'Set timezone and currency',
          'Save changes'
        ]
      },
      {
        id: 'settings-branding',
        title: 'Customize Branding',
        content: 'Customize colors and appearance to match your institute branding.',
        steps: [
          'Go to Settings → Branding',
          'Upload logo and favicon',
          'Set primary and secondary colors',
          'Preview changes in real-time',
          'Save branding'
        ]
      },
      {
        id: 'settings-staff',
        title: 'Manage Staff',
        content: 'Add staff members and assign roles and permissions.',
        steps: [
          'Go to Settings → Staff',
          'Click "Add Staff"',
          'Enter name, email, phone',
          'Select role (Admin/Manager/Teacher)',
          'Assign batches if applicable',
          'Send invite - staff sets own password'
        ]
      },
      {
        id: 'settings-permissions',
        title: 'Role Permissions',
        content: 'Control what different staff roles can do in the system.',
        steps: [
          'Go to Settings → Roles & Permissions',
          'Select a role',
          'Check/uncheck permissions:',
          '- Can View Students',
          '- Can Mark Attendance',
          '- Can View Finances',
          '- Can Send Messages',
          'Save permissions'
        ]
      },
      {
        id: 'settings-security',
        title: 'Security Settings',
        content: 'Change password and enable two-factor authentication.',
        steps: [
          'Go to Profile → Security',
          'Change password or enable 2FA',
          'For 2FA: Scan QR code with Google Authenticator',
          'Enter verification code',
          'Save backup codes',
          '2FA is now enabled'
        ]
      }
    ]
  },
  {
    id: 'subscription',
    icon: <HelpCircle className="w-5 h-5" />,
    label: 'Subscription',
    topics: [
      {
        id: 'subscription-view',
        title: 'View Current Plan',
        content: 'Check your current subscription plan and features.',
        steps: [
          'Go to My Subscription',
          'View current plan (Trial/Basic/Pro/Enterprise)',
          'See included features',
          'Check renewal date and status'
        ]
      },
      {
        id: 'subscription-upgrade',
        title: 'Upgrade Plan',
        content: 'Upgrade to a higher plan to unlock more features.',
        steps: [
          'Go to My Subscription',
          'Click "Upgrade"',
          'Compare all available plans',
          'Click "Upgrade Now" on desired plan',
          'Complete payment',
          'Plan upgraded immediately'
        ]
      },
      {
        id: 'subscription-cancel',
        title: 'Cancel Subscription',
        content: 'Cancel your subscription if no longer needed.',
        steps: [
          'Go to My Subscription',
          'Click "Cancel Plan"',
          'Provide feedback (optional)',
          'Confirm cancellation',
          'Access continues until billing cycle ends'
        ]
      }
    ]
  }
];

export default function DashboardHelp() {
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [selectedTopic, setSelectedTopic] = useState<string>('home-overview');

  const currentMenu = MENU_ITEMS.find(m => m.id === selectedMenu);
  const currentTopic = currentMenu?.topics.find(t => t.id === selectedTopic);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Help & Guide</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Learn how to use every feature of your dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-20 overflow-y-auto max-h-[calc(100vh-120px)]">
              <div className="p-4 space-y-2">
                {MENU_ITEMS.map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => {
                      setSelectedMenu(menu.id);
                      setSelectedTopic(menu.topics[0].id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      selectedMenu === menu.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{menu.icon}</span>
                    <span className="text-sm">{menu.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Sub-menu (Topics) */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="p-4 flex flex-wrap gap-2">
                  {currentMenu?.topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        selectedTopic === topic.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {currentTopic && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {currentTopic.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        {currentTopic.content}
                      </p>
                    </div>

                    {currentTopic.steps && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Step-by-Step Instructions
                        </h3>
                        <ol className="space-y-3">
                          {currentTopic.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                                  {idx + 1}
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 pt-1">
                                {step}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Tips */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>💡 Tip:</strong> Hover over any field or button for additional help. You can also contact support at contact@enromatics.com or WhatsApp +91 8087131777
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Help */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Still need help?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Contact our support team for more assistance:
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <a href="mailto:contact@enromatics.com" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center text-sm">
                  Email Support
                </a>
                <a href="https://wa.me/918087131777" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-center text-sm">
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
