"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ScholarshipExamsPage() {
  const router = useRouter();

  const examBoards = [
    { name: "NEET", icon: "🏥", color: "from-blue-400 to-indigo-500" },
    { name: "JEE", icon: "⚙️", color: "from-blue-500 to-indigo-600" },
    { name: "MHT-CET", icon: "🎓", color: "from-indigo-500 to-blue-600" },
  ];

  const features = [
    {
      icon: "📝",
      title: "Online Test Series",
      description: "Comprehensive mock tests with real exam patterns and instant results"
    },
    {
      icon: "📊",
      title: "Performance Analytics",
      description: "Track progress with detailed insights, weak areas identification, and improvement tips"
    },
    {
      icon: "🎯",
      title: "Scholarship Distribution",
      description: "Automated merit-based scholarship allocation with transparent ranking system"
    },
    {
      icon: "📱",
      title: "Mobile-First Experience",
      description: "Take tests anytime, anywhere on any device with seamless sync"
    },
    {
      icon: "🏆",
      title: "Leaderboards & Rankings",
      description: "Real-time rankings to motivate students and track competitive performance"
    },
    {
      icon: "📧",
      title: "Instant Notifications",
      description: "WhatsApp & Email alerts for exam schedules, results, and scholarship announcements"
    }
  ];

  const benefits = [
    {
      icon: "✨",
      title: "For Students",
      points: [
        "Free scholarship opportunities",
        "Practice with real exam patterns",
        "Identify strengths & weaknesses",
        "Compete with peers across India"
      ]
    },
    {
      icon: "🏫",
      title: "For Institutes",
      points: [
        "Attract quality students",
        "Automate exam management",
        "Brand visibility & marketing",
        "Data-driven admissions"
      ]
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Register Students",
      description: "Students register online with basic details and select their target exam",
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
    },
    {
      step: "2",
      title: "Conduct Online Tests",
      description: "Schedule exams, students take tests from home with auto-grading",
      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
    },
    {
      step: "3",
      title: "Analyze & Rank",
      description: "System generates rankings, analytics, and identifies scholarship winners",
      color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
    },
    {
      step: "4",
      title: "Award Scholarships",
      description: "Automated notifications sent to winners with scholarship details",
      color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
    }
  ];

  const stats = [
    { value: "50K+", label: "Students Tested" },
    { value: "₹2 Cr+", label: "Scholarships Awarded" },
    { value: "200+", label: "Partner Institutes" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-purple-950/10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.01] bg-[size:60px_60px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-12"
          >
            <button onClick={() => router.push("/")} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Home
            </button>
            <span>/</span>
            <button onClick={() => router.push("/#services")} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Services
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Scholarship Exams</span>
          </motion.div>

          <div className="text-center max-w-5xl mx-auto">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full text-sm font-light text-blue-600 dark:text-blue-300 mb-8"
              >
                <span className="text-lg">🎓</span>
                <span>Scholarship Entrance Exams</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight"
              >
                <span className="bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-slate-200 dark:via-blue-300 dark:to-indigo-200 bg-clip-text text-transparent font-light">
                  Discover Brilliant Students
                  <br />
                  Through Scholarship Entrance Exams
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
              >
                Conduct online & offline scholarship tests for NEET, JEE & MHT-CET aspirants. 
                <span className="text-slate-700 dark:text-slate-300"> Automate exams, rank students, and award scholarships effortlessly.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
              >
                <motion.button
                  onClick={() => router.push("/subscribe")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
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
                  className="px-10 py-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-white rounded-2xl font-semibold hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300"
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-sm text-slate-500 dark:text-slate-400 font-light"
              >
                ✨ No credit card required • 14-day free trial • Setup in 5 minutes
              </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-y border-slate-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-light">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4 font-light">
              Everything You Need to Run
              <br />
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Successful Scholarship Exams
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
              From registration to result declaration - all in one platform
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
                whileHover={{ y: -8 }}
                className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-gray-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4 font-light">
              How It <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Works</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
              Simple 4-step process to conduct scholarship exams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${step.color} rounded-3xl p-8 border-2`}
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-4">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4 font-light">
              Win-Win for <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Everyone</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-slate-200 dark:border-gray-800"
              >
                <div className="text-5xl mb-5">{benefit.icon}</div>
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-light">
              Ready to Launch Your
              <br />
              <span className="font-semibold">Scholarship Program?</span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Join 200+ institutes already using our platform to attract and identify the brightest students with scholarship entrance exams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => router.push("/subscribe")}
                className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition shadow-2xl text-lg"
              >
                Start Free Trial - No Credit Card
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/20 transition text-lg"
              >
                Schedule a Demo
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm font-light text-blue-100">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
