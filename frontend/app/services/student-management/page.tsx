"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function StudentManagementPage() {
  const router = useRouter();

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
      title: "Parent Portal",
      description: "Give parents 24/7 access to their child's progress, attendance, and fee status."
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Automated WhatsApp and SMS alerts for attendance, fees, exams, and announcements."
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
                Complete student lifecycle management from admission to graduation. Automate administrative tasks, track performance, and keep parents engaged.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => router.push("/subscribe")}
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
                  onClick={() => router.push("/login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl font-bold hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300"
                >
                  View Demo
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
                onClick={() => router.push("/subscribe")}
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
    </main>
  );
}
