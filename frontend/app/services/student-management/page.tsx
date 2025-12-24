"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BookDemoModal from "@/components/BookDemoModal";

export default function StudentManagementPage() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const features = [
    {
      icon: "📝",
      title: "Digital Admissions",
      description: "Streamline your admission process with online forms, document uploads, and automated approval workflows."
    },
    {
      icon: "👤",
      title: "Student Profiles",
      description: "Comprehensive student profiles with personal details, academic records, and performance history."
    },
    {
      icon: "📊",
      title: "Performance Tracking",
      description: "Monitor student progress with test scores, assignments, and detailed analytics dashboards."
    },
    {
      icon: "📅",
      title: "Attendance Management",
      description: "Real-time attendance tracking with automated alerts to parents for absences."
    },
    {
      icon: "📱",
      title: "White-Labeled Mobile App",
      description: "Students get your own branded mobile app for attendance, assignments, fee payments, and more."
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Parent Portal",
      description: "Give parents 24/7 access to their child's progress, attendance, and fee status through web and mobile."
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Automated WhatsApp, SMS and push notifications for attendance, fees, exams, and announcements."
    }
  ];

  const benefits = [
    {
      stat: "80%",
      label: "Time Saved",
      description: "Reduce admin work with automation"
    },
    {
      stat: "100%",
      label: "Accuracy",
      description: "Eliminate manual data entry errors"
    },
    {
      stat: "3x",
      label: "Faster",
      description: "Speed up admission process"
    }
  ];

  const useCases = [
    {
      title: "Admission Season",
      description: "Handle 100+ admissions simultaneously with automated workflows, document verification, and instant confirmations.",
      image: "🎓"
    },
    {
      title: "Daily Operations",
      description: "Track attendance, manage student data, and communicate with parents - all from one centralized dashboard.",
      image: "📚"
    },
    {
      title: "Performance Reviews",
      description: "Generate comprehensive reports on student performance, identify struggling students, and take proactive measures.",
      image: "📈"
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30 border-b border-slate-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-8"
          >
            <button onClick={() => router.push("/")} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Home
            </button>
            <span>/</span>
            <button onClick={() => router.push("/services")} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Services
            </button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Student Management</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-6">
                <span className="text-2xl">👥</span>
                Core Service
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Student Management
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Complete student lifecycle management from admission to graduation. Automate administrative tasks, track performance, and engage students with your own branded mobile app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => router.push("/plans")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Free Trial
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setShowDemoModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl font-bold hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300"
                >
                  Book Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-gray-800 p-8 overflow-hidden">
                {/* Student Card Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl">
                      👨‍🎓
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-slate-900 dark:text-white">Rahul Kumar</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Class 10 - Science</div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                      Active
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Performance</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">87%</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="text-2xl mb-2">✅</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Attendance</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">94%</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Activities</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-400">Test completed - 92%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-400">Fee payment received</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="py-16 bg-slate-50 dark:bg-gray-900 border-y border-slate-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {benefit.stat}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {benefit.label}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              Key Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Powerful tools designed to simplify student management and enhance learning outcomes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Highlight Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6">
                📱 Your Own Branded Mobile App
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Empower Students with
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Real-Time Progress Tracking
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Give your students their own branded mobile app to track attendance, view test scores, 
                pay fees, and stay connected with their learning journey - anytime, anywhere.
              </p>

              {/* Key Benefits */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: "📊", title: "Real-Time Dashboards", desc: "Students see live attendance, grades, and progress analytics" },
                  { icon: "🔔", title: "Instant Notifications", desc: "Push alerts for assignments, tests, results, and announcements" },
                  { icon: "💳", title: "Easy Fee Payments", desc: "Secure online payments with instant receipts and history" },
                  { icon: "🏆", title: "Track Success", desc: "Visual progress charts to motivate and achieve goals" },
                  { icon: "🎨", title: "Your Brand", desc: "White-labeled app with your logo, colors, and institute name" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-gray-800 hover:shadow-lg transition-all"
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={() => setShowDemoModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  See Mobile App Demo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.button>
            </motion.div>

            {/* Right - Mobile UI Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-[300px] lg:w-[340px]">
                {/* Phone Frame */}
                <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-8 border-slate-800">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-10"></div>
                  
                  {/* Screen Content */}
                  <div className="bg-white rounded-[2.3rem] overflow-hidden h-[650px] relative">
                    {/* Status Bar */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-12 pb-6">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-blue-100 text-sm">Welcome back,</p>
                          <h3 className="text-white font-bold text-xl">Rahul Sharma</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur">
                          👨‍🎓
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                          <p className="text-white font-bold text-lg">94%</p>
                          <p className="text-blue-100 text-xs">Attendance</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                          <p className="text-white font-bold text-lg">A+</p>
                          <p className="text-blue-100 text-xs">Grade</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                          <p className="text-white font-bold text-lg">12</p>
                          <p className="text-blue-100 text-xs">Tests</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 space-y-4">
                      {/* Recent Activity */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-sm">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">✓</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-medium text-xs">Math Test - 92%</p>
                              <p className="text-gray-500 text-xs">2 hours ago</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">💳</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-medium text-xs">Fee Paid - ₹5,000</p>
                              <p className="text-gray-500 text-xs">1 day ago</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">📚</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-medium text-xs">Assignment Submitted</p>
                              <p className="text-gray-500 text-xs">2 days ago</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Tests */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Upcoming Tests</h4>
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-gray-900 text-xs">Physics Chapter 5</p>
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Tomorrow</span>
                          </div>
                          <p className="text-gray-600 text-xs">10:00 AM • Duration: 2 hours</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-blue-600 text-xl mb-1">🏠</div>
                          <p className="text-xs text-blue-600 font-medium">Home</p>
                        </div>
                        <div className="text-center opacity-40">
                          <div className="text-gray-600 text-xl mb-1">📊</div>
                          <p className="text-xs text-gray-600">Progress</p>
                        </div>
                        <div className="text-center opacity-40">
                          <div className="text-gray-600 text-xl mb-1">📝</div>
                          <p className="text-xs text-gray-600">Tests</p>
                        </div>
                        <div className="text-center opacity-40">
                          <div className="text-gray-600 text-xl mb-1">👤</div>
                          <p className="text-xs text-gray-600">Profile</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  ✓ 94% Attendance
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  🏆 Top Performer
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Real-World Applications
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See how institutes use our platform daily
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-800"
              >
                <div className="text-6xl mb-6 text-center">{useCase.image}</div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Student Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 500+ institutes that are already saving 10+ hours per week with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/plans")}
                className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg"
              >
                Start Free Trial - No Credit Card Required
              </button>
              <button
                onClick={() => router.push("/services")}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition text-lg"
              >
                Explore All Services
              </button>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              ✨ 14-day free trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Book Demo Modal */}
      {showDemoModal && <BookDemoModal onClose={() => setShowDemoModal(false)} />}
    </main>
  );
}
