"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BookDemoModal from "@/components/BookDemoModal";

export default function Home() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const features = [
    {
      icon: "👥",
      title: "Student Management",
      description: "Complete student lifecycle management from admission to graduation. Track attendance, performance, and parent communications.",
      highlights: ["Student Profiles", "Attendance Tracking", "Performance Analytics"]
    },
    {
      icon: "💰",
      title: "Payment & Fee Management",
      description: "Automated fee collection, invoice generation, and payment tracking. Never miss a payment with smart reminders.",
      highlights: ["Online Payments", "Auto Invoices", "Payment History"]
    },
    {
      icon: "📊",
      title: "Lead Management",
      description: "Capture, track, and convert leads efficiently. Manage your entire admission funnel from inquiry to enrollment.",
      highlights: ["Lead Tracking", "Follow-up Automation", "Conversion Analytics"]
    },
    {
      icon: "💬",
      title: "WhatsApp Business Integration",
      description: "Send bulk messages, automated reminders, and campaign updates directly to students and parents via WhatsApp.",
      highlights: ["Bulk Messaging", "Template Messages", "Campaign Tracking"]
    },
    {
      icon: "📱",
      title: "Facebook & Meta Ads",
      description: "Run and manage Facebook ad campaigns directly from the dashboard. Track ROI and optimize your marketing spend.",
      highlights: ["Ad Campaign Management", "Lead Generation", "Performance Tracking"]
    },
    {
      icon: "🏢",
      title: "Multi-Tenant Architecture",
      description: "Manage multiple institutes from a single dashboard. Perfect for coaching chains and franchise models.",
      highlights: ["Multiple Branches", "Centralized Control", "Branch-wise Reports"]
    },
    {
      icon: "👨‍💼",
      title: "Staff Management",
      description: "Manage your teaching and non-teaching staff, assign roles, track performance, and handle payroll efficiently.",
      highlights: ["Role-based Access", "Performance Tracking", "Attendance Management"]
    },
    {
      icon: "📈",
      title: "Analytics & Reports",
      description: "Get real-time insights with powerful analytics. Track revenue, student performance, staff efficiency, and marketing ROI.",
      highlights: ["Revenue Reports", "Performance Metrics", "Custom Dashboards"]
    },
    {
      icon: "🔔",
      title: "Automated Notifications",
      description: "Send automated fee reminders, attendance alerts, and exam notifications via WhatsApp, SMS, and email.",
      highlights: ["Fee Reminders", "Attendance Alerts", "Exam Notifications"]
    }
  ];

  const stats = [
    { value: "3000+", label: "Active Students" },
    { value: "50+", label: "Institutes" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-slate-800 dark:text-slate-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                All-in-One Institute Management Platform
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Transform Your Coaching Institute
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Automate operations, boost revenue, and grow faster with our intelligent platform. 
                <span className="font-semibold text-slate-900 dark:text-white"> Save 10+ hours per week.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start">
                <motion.button
                  onClick={() => router.push("/plans")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold overflow-hidden shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Free Trial
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>

                <motion.button
                  onClick={() => setShowDemoModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl font-bold hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 shadow-sm"
                >
                  Book Demo
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main Dashboard Card */}
              <div className="relative group">
                {/* Floating Cards Animation */}
                <motion.div
                  initial={{ opacity: 0, x: -20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -left-4 top-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-4 z-10 w-48"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Revenue</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">₹45.2L</div>
                      <div className="text-xs text-green-600 dark:text-green-400">↑ 23% this month</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="absolute -right-4 top-20 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-4 z-10 w-44"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                      👥
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Students</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">1,234</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Active now</div>
                    </div>
                  </div>
                </motion.div>

                {/* Main Dashboard */}
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-gray-800 p-6 overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-gray-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
                      enromatics.com/dashboard
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Leads</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">89</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                        <div className="text-2xl mb-1">✅</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Attendance</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">94%</div>
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-xl p-4 border border-slate-200 dark:border-gray-700 h-32 flex items-end justify-between gap-2">
                      {[40, 70, 50, 80, 60, 90, 75].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-lg"
                        ></motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glow Effects */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-3xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-gray-900 border-y border-slate-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
                Powerful Features
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Everything You Need to Run Your Institute
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                From admissions to graduation, manage every aspect of your coaching institute with our comprehensive platform.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
                📱 Mobile-First Experience
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Manage Your Institute On-the-Go
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Access your complete institute management system anytime, anywhere with our powerful mobile app. Never miss an update with real-time notifications and instant access to critical data.
              </p>

              {/* USP List */}
              <div className="space-y-4 mb-10">
                {[
                  { icon: "⚡", title: "Lightning Fast", desc: "Optimized for speed with instant data sync" },
                  { icon: "🔔", title: "Real-time Notifications", desc: "Get alerts for leads, payments, and attendance" },
                  { icon: "📊", title: "Full Dashboard Access", desc: "All features available on mobile" },
                  { icon: "🔐", title: "Bank-level Security", desc: "Your data is protected with enterprise security" },
                ].map((usp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {usp.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{usp.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{usp.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <motion.button
                  onClick={() => router.push("/plans")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold overflow-hidden shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Create your own app
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </motion.button>
              </div>

              {/* Badge */}
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Available on iOS & Android</span>
              </div>
            </motion.div>

            {/* Right Content - Mobile App Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2"
            >
              <div className="relative group">
                {/* Phone Mockup */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="mx-auto max-w-sm">
                    {/* Phone Frame */}
                    <div className="bg-black rounded-[3rem] shadow-2xl p-3">
                      {/* Phone Screen */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                        {/* Notch */}
                        <div className="h-8 bg-black rounded-b-3xl mx-auto w-32"></div>
                        
                        {/* Screen Content */}
                        <div className="p-4 space-y-4 h-full overflow-hidden">
                          {/* Status Bar */}
                          <div className="flex justify-between items-center text-xs font-bold mb-2">
                            <span>9:41</span>
                            <div className="flex gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                              </svg>
                            </div>
                          </div>

                          {/* Dashboard Cards */}
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="text-slate-900 dark:text-white">
                              <div className="text-sm font-bold">Welcome Back!</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Excellence Academy</div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                                <div className="text-2xl">👥</div>
                                <div className="text-xs font-bold mt-1">1,234</div>
                                <div className="text-xs opacity-80">Students</div>
                              </div>
                              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
                                <div className="text-2xl">💰</div>
                                <div className="text-xs font-bold mt-1">₹45L</div>
                                <div className="text-xs opacity-80">Revenue</div>
                              </div>
                            </div>

                            {/* Updates */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-slate-200 dark:border-gray-700">
                              <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">📊 Today's Updates</div>
                              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                <div>✅ 15 new leads</div>
                                <div>💳 ₹25,000 collected</div>
                                <div>📋 94% attendance</div>
                              </div>
                            </div>

                            {/* Notification */}
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">🔔 Fee due reminder</div>
                              <div className="text-xs text-amber-800 dark:text-amber-300">15 students pending</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-3xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Intuitive Dashboard. Powerful Insights.
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Get a bird's eye view of your entire institute with real-time analytics, performance metrics, and actionable insights.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-200 dark:border-gray-700">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 md:p-12 aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] bg-[size:30px_30px]"></div>
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                  {[
                    { icon: "👥", label: "Students", value: "1,234", color: "from-blue-500 to-cyan-500" },
                    { icon: "💰", label: "Revenue", value: "₹45.2L", color: "from-green-500 to-emerald-500" },
                    { icon: "📊", label: "Leads", value: "89", color: "from-purple-500 to-pink-500" },
                    { icon: "✅", label: "Attendance", value: "94%", color: "from-orange-500 to-red-500" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                      <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-xl mb-2`}>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Dashboard Preview</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Simple setup process to get your institute online
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2"></div>
            {[
              { step: "1", title: "Sign Up", desc: "Create your account and set up your institute profile in under 2 minutes." },
              { step: "2", title: "Configure", desc: "Add your students, staff, and customize settings to match your workflow." },
              { step: "3", title: "Go Live", desc: "Start managing your institute with automated workflows and smart features." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-800 z-10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Trusted by Leading Institutes
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Join hundreds of coaching institutes that are growing with Enro Matics
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Enro Matics has transformed how we manage our institute. We've saved 15+ hours per week on admin work!",
                author: "Rajesh Kumar",
                role: "Director, Excellence Academy",
                rating: 5
              },
              {
                quote: "The WhatsApp integration alone has increased our parent engagement by 300%. Highly recommended!",
                author: "Priya Sharma",
                role: "Owner, Smart Coaching",
                rating: 5
              },
              {
                quote: "From lead management to fee collection, everything is automated. Our revenue increased by 40% in 6 months.",
                author: "Amit Patel",
                role: "CEO, Bright Future Institute",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Institute?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 500+ institutes that are already using Enro Matics to streamline operations and grow faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/plans")}
                className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg"
              >
                Start Free Trial - No Credit Card Required
              </button>
              <button
                onClick={() => router.push("/plans")}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition text-lg"
              >
                View Pricing
              </button>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              ✨ 14-day free trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Enro Matics</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                The complete institute management platform that helps coaching institutes automate operations, increase revenue, and grow faster.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="/plans" className="hover:text-blue-400 transition">Pricing</a></li>
                <li><a href="#features" className="hover:text-blue-400 transition">Features</a></li>
                <li><a href="/login" className="hover:text-blue-400 transition">Login</a></li>
                <li><a href="/subscribe" className="hover:text-blue-400 transition">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="/privacy-policy" className="hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-slate-500">
            <p>© {new Date().getFullYear()} Enro Matics. All rights reserved. Empowering coaching institutes with smart automation.</p>
          </div>
        </div>
      </footer>

      {/* Book Demo Modal */}
      {showDemoModal && <BookDemoModal onClose={() => setShowDemoModal(false)} />}
    </main>
  );
}