"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BookDemoModal from "@/components/BookDemoModal";

export default function RevenuePaymentsPage() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const impactStats = [
    {
      icon: "💸",
      stat: "₹2.5L+",
      label: "Lost Revenue",
      description: "Average annual revenue lost due to manual payment tracking and follow-ups"
    },
    {
      icon: "⏰",
      stat: "40+ hrs",
      label: "Wasted Time",
      description: "Monthly hours spent on manual fee collection, reminders, and reconciliation"
    },
    {
      icon: "😓",
      stat: "65%",
      label: "Payment Delays",
      description: "Fees received late without automated reminders and online payment options"
    },
    {
      icon: "📉",
      stat: "30%",
      label: "Lower Collection",
      description: "Reduction in successful fee collection without payment tracking automation"
    }
  ];

  const benefits = [
    {
      icon: "💰",
      title: "Boost Revenue by 40%",
      description: "Automated payment reminders and online collection increase on-time payments significantly."
    },
    {
      icon: "🚀",
      title: "Accelerate Business Growth",
      description: "Real-time revenue insights and analytics help you make data-driven decisions for expansion."
    },
    {
      icon: "📊",
      title: "Live Financial Dashboard",
      description: "Track revenue, pending fees, expenses, and profits in real-time with visual reports."
    },
    {
      icon: "⚡",
      title: "Instant Payment Processing",
      description: "Accept payments via UPI, cards, net banking with instant confirmation and receipts."
    },
    {
      icon: "🔔",
      title: "Smart Payment Reminders",
      description: "Automated WhatsApp, SMS, and email reminders reduce payment delays by 70%."
    },
    {
      icon: "📈",
      title: "Predictable Cash Flow",
      description: "Subscription-based fee models and automated billing ensure consistent monthly revenue."
    }
  ];

  const features = [
    {
      icon: "💳",
      title: "Multiple Payment Gateways",
      description: "Integrated with Razorpay, Cashfree, Paytm for seamless online payments."
    },
    {
      icon: "📝",
      title: "Auto Invoice Generation",
      description: "Generate professional invoices automatically with GST compliance and branding."
    },
    {
      icon: "🔄",
      title: "Recurring Billing",
      description: "Set up monthly/quarterly subscriptions with auto-charge and renewal reminders."
    },
    {
      icon: "📱",
      title: "Pay via Mobile App",
      description: "Students and parents can pay fees anytime from the branded mobile app."
    },
    {
      icon: "💰",
      title: "Partial Payments",
      description: "Allow installment payments with automated tracking of pending amounts."
    },
    {
      icon: "🎯",
      title: "Late Fee Automation",
      description: "Automatically calculate and add late fees after due dates."
    },
    {
      icon: "📧",
      title: "Payment Confirmations",
      description: "Instant WhatsApp/SMS/Email confirmations and digital receipts to parents."
    },
    {
      icon: "📊",
      title: "Revenue Analytics",
      description: "Visual dashboards showing daily, monthly, yearly revenue with growth trends."
    },
    {
      icon: "🔒",
      title: "Secure Transactions",
      description: "PCI-DSS compliant payment processing with bank-grade security."
    },
    {
      icon: "📥",
      title: "Offline Payment Tracking",
      description: "Record cash/cheque payments with automatic receipt generation."
    },
    {
      icon: "💼",
      title: "Expense Management",
      description: "Track institute expenses and calculate net profit automatically."
    },
    {
      icon: "🎁",
      title: "Discount & Coupons",
      description: "Create promotional discounts, referral rewards, and scholarship waivers."
    }
  ];

  const painPoints = [
    {
      icon: "😰",
      title: "Manual Follow-ups Nightmare",
      description: "Spending hours calling/messaging parents for pending fees every month",
      impact: "40+ hours wasted monthly"
    },
    {
      icon: "💔",
      title: "Cash Flow Uncertainty",
      description: "Never knowing how much revenue you'll collect this month due to unpredictable payments",
      impact: "70% institutes face cash crunch"
    },
    {
      icon: "📉",
      title: "Lost Revenue Opportunities",
      description: "Parents forget due dates without reminders, leading to delayed or missed payments",
      impact: "₹2-5L lost annually"
    },
    {
      icon: "😫",
      title: "Manual Reconciliation Hell",
      description: "Matching payments with student records, updating ledgers, and generating receipts manually",
      impact: "15+ hours weekly"
    }
  ];

  const useCases = [
    {
      title: "Growing Coaching Institute",
      description: "Scale from 100 to 500 students without hiring more accounts staff. Automated payments and reminders handle it all.",
      icon: "📈"
    },
    {
      title: "Multi-Branch Management",
      description: "Track revenue across multiple branches in real-time. Consolidated reports and branch-wise performance analysis.",
      icon: "🏢"
    },
    {
      title: "Seasonal Revenue Planning",
      description: "Predict admission season revenue with analytics. Plan expenses and investments based on data, not guesswork.",
      icon: "📅"
    },
    {
      title: "Parent Satisfaction",
      description: "Parents love the convenience of online payment. Pay anytime, get instant receipts, view payment history 24/7.",
      icon: "😊"
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/30 border-b border-slate-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
        
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
            <span className="text-slate-900 dark:text-white font-medium">Revenue & Payments</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/10 to-emerald-600/10 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-200 dark:border-green-800 rounded-full text-sm font-semibold text-green-700 dark:text-green-300 mb-6"
              >
                <span>💰</span>
                Automated Revenue & Payment Management
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-green-800 to-emerald-800 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
                  Stop Losing ₹2.5L+
                  <br />
                  Every Year
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                In 2025, manual payment tracking is killing your growth. Automate fee collection, 
                reminders, and revenue tracking to boost business by 40%.
              </p>

              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
                <p className="text-red-800 dark:text-red-300 font-semibold">
                  ⚠️ Without automation, institutes lose ₹2-5 Lakhs annually in delayed/missed payments and waste 40+ hours monthly on manual follow-ups.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => router.push("/plans")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Collecting More Today
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setShowDemoModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl font-bold hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-300"
                >
                  Book Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Right Visual - Revenue Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-gray-800 p-8 overflow-hidden">
                {/* Revenue Dashboard */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Dashboard</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">December 2025</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>

                  {/* Revenue Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                      <div className="text-sm text-green-700 dark:text-green-300 mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹45.2L</div>
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                        <span>↑ 42%</span>
                        <span className="text-green-700 dark:text-green-300">vs last month</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                      <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Collected</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹42.8L</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">95% collection rate</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4">
                      <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Pending</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹2.4L</div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">12 students</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                      <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Online Payments</div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">78%</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">↑ 25% this year</div>
                    </div>
                  </div>

                  {/* Recent Payments */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">💳 Recent Payments</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">✓</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white font-medium text-sm">Rahul Sharma - ₹15,000</p>
                          <p className="text-slate-600 dark:text-slate-400 text-xs">UPI • 2 min ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">✓</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white font-medium text-sm">Priya Patel - ₹12,500</p>
                          <p className="text-slate-600 dark:text-slate-400 text-xs">Card • 15 min ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Chart Placeholder */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Revenue Growth 📈</span>
                      <span className="text-xs text-green-600 dark:text-green-400">+42% YoY</span>
                    </div>
                    <div className="h-16 flex items-end justify-between gap-1">
                      {[40, 55, 48, 65, 72, 68, 85].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact of NOT Using Automation */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950/10 dark:to-orange-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
              ⚠️ The Cost of Manual Processes in 2025
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              What You're Losing Every Month
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Without automation, institutes face serious business impacts that compound over time
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border-2 border-red-200 dark:border-red-900"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{stat.stat}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">{stat.label}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Pain Points */}
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((pain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border-l-4 border-red-500"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{pain.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{pain.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">{pain.description}</p>
                    <div className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                      {pain.impact}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-green-950/10 dark:to-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
              💰 Enromatics Does Everything Centrally
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              We Handle All Revenue Management
              <span className="block text-3xl md:text-4xl mt-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                You Focus on Teaching
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Enromatics centrally manages payments, reminders, invoices, and analytics - 
              all automated from one powerful dashboard. No manual work needed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-800 hover:shadow-2xl hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
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
            <div className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-semibold mb-4">
              Complete Payment Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Manage Revenue
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              From payment collection to financial analytics - all in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
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
              Real Success Stories
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See how institutes transformed their revenue with automation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all"
              >
                <div className="text-6xl mb-6 text-center">{useCase.icon}</div>
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
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Stop Losing Money. Start Growing Today.
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join 500+ institutes that boosted revenue by 40% with automated payment management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/plans")}
                className="px-10 py-5 bg-white text-green-600 rounded-xl font-bold hover:bg-emerald-50 transition shadow-xl text-lg"
              >
                Start Free Trial - Collect More Fees Now
              </button>
              <button
                onClick={() => router.push("/services")}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition text-lg"
              >
                Explore All Services
              </button>
            </div>
            <p className="mt-6 text-sm text-emerald-200">
              ✨ 14-day free trial • No credit card required • 40% more revenue guaranteed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Book Demo Modal */}
      {showDemoModal && <BookDemoModal onClose={() => setShowDemoModal(false)} />}
    </main>
  );
}
