"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BookDemoModal from "@/components/BookDemoModal";

export default function TestManagementPage() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const benefits = [
    {
      icon: "⚡",
      title: "Automate Test Creation",
      description: "Create tests in minutes with question banks, auto-grading, and customizable templates."
    },
    {
      icon: "📊",
      title: "Marks & Reports",
      description: "Automatic marks calculation, result generation, and detailed performance reports."
    },
    {
      icon: "📈",
      title: "Progress Analysis",
      description: "Track student progress over time with visual analytics and insights."
    },
    {
      icon: "🏆",
      title: "Ranks & Leaderboards",
      description: "Auto-calculate ranks, generate merit lists, and display competitive leaderboards."
    },
    {
      icon: "🎓",
      title: "Instant Result Distribution",
      description: "Automatically send results to students and parents via WhatsApp, SMS, and email."
    },
    {
      icon: "✅",
      title: "Ready for Any Exam",
      description: "From mock tests to scholarship exams, entrance tests to board exams - handle all types."
    }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Question Bank Management",
      description: "Build and manage question banks with multiple question types, difficulty levels, and topics."
    },
    {
      icon: "⏱️",
      title: "Timed Tests",
      description: "Set test duration, auto-submit on timeout, and track time spent per question."
    },
    {
      icon: "🤖",
      title: "Auto-Grading",
      description: "Instant evaluation for MCQs and automated marking with detailed answer keys."
    },
    {
      icon: "📝",
      title: "Multiple Question Types",
      description: "Support for MCQs, True/False, Fill-in-blanks, Short answers, and Long answers."
    },
    {
      icon: "📱",
      title: "Online & Offline Tests",
      description: "Conduct tests online via mobile app/web or offline with OMR sheet scanning."
    },
    {
      icon: "🔒",
      title: "Anti-Cheating Measures",
      description: "Random question order, disable copy-paste, tab switching alerts, and proctoring."
    },
    {
      icon: "📧",
      title: "Instant Notifications",
      description: "Automated result notifications, admit cards, and test reminders via WhatsApp/Email."
    },
    {
      icon: "💰",
      title: "Fee Integration",
      description: "Collect registration fees online for entrance/scholarship exams with payment tracking."
    }
  ];

  const useCases = [
    {
      title: "Scholarship Exams",
      description: "Conduct large-scale scholarship exams with registration management, admit cards, results, and merit-based rewards.",
      icon: "🎓"
    },
    {
      title: "Mock Tests",
      description: "Regular mock tests to prepare students for board exams and competitive exams with detailed analysis.",
      icon: "📚"
    },
    {
      title: "Class Tests",
      description: "Quick chapter-wise tests, surprise tests, and regular assessments to track daily learning.",
      icon: "✍️"
    },
    {
      title: "Entrance Exams",
      description: "Institute-level entrance exams for admissions with automated merit list generation and seat allocation.",
      icon: "🚪"
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-blue-50/50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/30 border-b border-slate-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        
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
            <span className="text-slate-900 dark:text-white font-medium">Test Management</span>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-500/20 dark:to-blue-500/20 border border-purple-200 dark:border-purple-800 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-300 mb-6"
              >
                <span>📝</span>
                Complete Test Creation & Management
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                  Automate Tests,
                  <br />
                  Marks & Progress
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                From test creation to result analysis - automate everything. 
                Generate marks, analyze progress, calculate ranks, and prepare students for any exam.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => router.push("/plans")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
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
                  className="px-8 py-4 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl font-bold hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300"
                >
                  Book Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Right Visual - Test Interface Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-gray-800 p-8 overflow-hidden">
                {/* Test Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mathematics Mock Test</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">100 marks • 2 hours • 50 questions</p>
                    </div>
                    <div className="text-3xl">📝</div>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">156</div>
                      <div className="text-xs text-green-700 dark:text-green-300">Students</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">78%</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">Avg Score</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">142</div>
                      <div className="text-xs text-purple-700 dark:text-purple-300">Completed</div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">🏆 Top Performers</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Rahul Sharma", score: 98, rank: 1, color: "yellow" },
                        { name: "Priya Patel", score: 95, rank: 2, color: "gray" },
                        { name: "Amit Kumar", score: 93, rank: 3, color: "orange" }
                      ].map((student, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-lg">
                          <div className={`w-8 h-8 bg-${student.color}-100 dark:bg-${student.color}-900/30 rounded-full flex items-center justify-center font-bold text-${student.color}-600 dark:text-${student.color}-400 text-sm`}>
                            #{student.rank}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{student.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{student.score}/100</p>
                          </div>
                          <div className="text-xl">🏆</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                      View Results
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      Analysis
                    </button>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Benefits Highlight */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-blue-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
              Straightforward Benefits
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything Automated for You
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Focus on teaching while we handle test creation, evaluation, and analysis
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
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-800 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Complete Test Management Suite
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Everything you need to create, conduct, evaluate, and analyze tests
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
                className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
              Ready for Any Type of Exam
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              From daily tests to competitive exams - handle them all
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
                className="bg-white dark:bg-gray-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all"
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
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Automate Your Tests?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 500+ institutes that are already saving 15+ hours per week with automated test management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/plans")}
                className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg"
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
