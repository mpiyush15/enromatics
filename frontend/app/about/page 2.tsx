import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              About Enromatics
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light mb-12">
              Transforming education through innovative digital solutions. 
              We empower coaching institutes, schools, and colleges to digitalize their operations 
              and unlock their full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20"
          >
            {/* Mission */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To revolutionize the education sector by providing comprehensive digital solutions 
                that streamline operations, enhance student engagement, and drive institutional growth. 
                We believe every educational institution deserves access to cutting-edge technology 
                that simplifies complex processes and maximizes efficiency.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Student Management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Digital Attendance</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Fee Management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Scholarship Programs</span>
                </div>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To become the leading platform that digitally transforms educational institutions 
                across India and beyond. We envision a future where every coaching institute, 
                school, and college operates seamlessly through integrated digital ecosystems, 
                enabling educators to focus on what matters most - teaching and inspiring students.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-600" />
                  2030 Goals
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Digitalize 10,000+ educational institutions</li>
                  <li>• Serve 1M+ students across our platform</li>
                  <li>• Expand to international markets</li>
                  <li>• Pioneer AI-driven educational insights</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Founded with a passion for education and technology, Enromatics emerged from the need 
              to bridge the gap between traditional educational management and modern digital solutions.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">The Beginning</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Started as a solution for small coaching institutes struggling with manual processes. 
                We recognized the pain points of educators spending more time on administration than teaching.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Growth & Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Expanded our platform to serve schools and colleges, adding advanced features like 
                mobile apps, scholarship management, and comprehensive analytics dashboards.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Future Vision</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Today, we're building the next generation of educational technology, incorporating 
                AI, machine learning, and advanced analytics to create smarter educational ecosystems.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What We Do
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide comprehensive digital solutions that transform how educational institutions operate, 
              manage students, and drive growth through data-driven insights.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Users,
                title: "Student Management",
                description: "Complete student lifecycle management from admission to graduation with automated workflows.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Smartphone,
                title: "Mobile Applications",
                description: "White-label mobile apps for students and parents with real-time updates and notifications.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Comprehensive dashboards and reports to track performance, attendance, and financial metrics.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Award,
                title: "Scholarship Management",
                description: "End-to-end scholarship program management with automated eligibility and application processes.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "Bank-grade security with data encryption and compliance with educational data protection standards.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: Zap,
                title: "Automation Tools",
                description: "Automated fee collection, attendance tracking, and communication systems to reduce manual work.",
                color: "from-indigo-500 to-indigo-600"
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-6`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Goal */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Our Ultimate Goal
            </motion.h2>
            
            <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 font-light">
                To completely <span className="font-semibold text-yellow-300">digitalize the operations</span> of 
                coaching institutes, schools, and colleges across India. We aim to eliminate manual processes, 
                reduce administrative burden, and enable educators to focus on what they do best - 
                <span className="font-semibold text-yellow-300"> educating and inspiring the next generation</span>.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">100%</div>
                  <div className="text-white/80">Digital Transformation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
                  <div className="text-white/80">System Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">∞</div>
                  <div className="text-white/80">Growth Potential</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Educational Institutions Choose Us
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              {[
                {
                  icon: Heart,
                  title: "Built for Educators",
                  description: "Designed by understanding the real challenges faced by teachers and administrators in their daily operations."
                },
                {
                  icon: Zap,
                  title: "Quick Implementation",
                  description: "Get up and running in days, not months. Our streamlined onboarding process ensures minimal disruption."
                },
                {
                  icon: Building2,
                  title: "Scalable Solutions",
                  description: "From small coaching centers to large universities - our platform grows with your institution."
                }
              ].map((point, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{point.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{point.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ready to Transform Your Institution?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Join hundreds of educational institutions that have already revolutionized their operations with Enromatics.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}