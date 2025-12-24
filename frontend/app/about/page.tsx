'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BookDemoModal from '@/components/BookDemoModal'
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Zap, 
  BookOpen,
  Heart,
  Target,
  Globe,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AboutPage() {
  const router = useRouter()
  const [showDemoModal, setShowDemoModal] = useState(false)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              About Enromatics
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Revolutionizing education through digital transformation. 
              We empower <span className="font-semibold text-blue-600 dark:text-blue-400">coaching institutes</span>, 
              <span className="font-semibold text-purple-600 dark:text-purple-400"> schools</span>, and 
              <span className="font-semibold text-green-600 dark:text-green-400"> colleges</span> to 
              digitalize their operations and unlock their full potential.
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-4 text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                Digital Transformation
              </span>
              <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                Educational Technology
              </span>
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                Student Management
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 lg:gap-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Mission */}
            <motion.div className="space-y-6" variants={fadeInUp}>
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
                {[
                  'Student Management',
                  'Digital Attendance', 
                  'Fee Management',
                  'Scholarship Programs'
                ].map((item, index) => (
                  <motion.div 
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div className="space-y-6" variants={fadeInUp}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To become the leading platform that digitally transforms educational institutions 
                across India and beyond. We envision a future where every coaching institute, 
                school, and college operates seamlessly through integrated digital ecosystems, 
                enabling educators to focus on what matters most - teaching and inspiring students.
              </p>
              <motion.div 
                className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  2030 Goals
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Digitalize 10,000+ educational institutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Serve 1M+ students across our platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Expand to international markets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Pioneer AI-driven educational insights</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Ultimate Goal */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <motion.div 
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <motion.div 
              className="mb-8"
              initial={{ scale: 0, rotate: 180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-white mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our Ultimate Goal
            </motion.h2>
            
            <div className="max-w-4xl mx-auto">
              <motion.p 
                className="text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 font-light"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                To completely <span className="font-semibold text-yellow-300">digitalize the operations</span> of 
                coaching institutes, schools, and colleges across India. We aim to eliminate manual processes, 
                reduce administrative burden, and enable educators to focus on what they do best - 
                <span className="font-semibold text-yellow-300"> educating and inspiring the next generation</span>.
              </motion.p>
              
              <motion.div 
                className="grid md:grid-cols-3 gap-8 mt-12"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {[
                  { number: "100%", label: "Digital Transformation" },
                  { number: "24/7", label: "System Availability" },
                  { number: "∞", label: "Growth Potential" }
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-yellow-300 mb-2">{stat.number}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide comprehensive digital solutions that transform how educational institutions operate, 
              manage students, and drive growth through data-driven insights.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Student Management",
                description: "Complete student lifecycle management from admission to graduation with automated workflows.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: Smartphone,
                title: "Mobile Applications",
                description: "White-label mobile apps for students and parents with real-time updates and notifications.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Comprehensive dashboards and reports to track performance, attendance, and financial metrics.",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: Award,
                title: "Scholarship Management",
                description: "End-to-end scholarship program management with automated eligibility and application processes.",
                gradient: "from-orange-500 to-orange-600"
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "Bank-grade security with data encryption and compliance with educational data protection standards.",
                gradient: "from-red-500 to-red-600"
              },
              {
                icon: Zap,
                title: "Automation Tools",
                description: "Automated fee collection, attendance tracking, and communication systems to reduce manual work.",
                gradient: "from-indigo-500 to-indigo-600"
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Founded with a passion for education and technology, Enromatics emerged from the need 
              to bridge the gap between traditional educational management and modern digital solutions.
            </p>
          </motion.div>

          <motion.div 
            className="grid lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: BookOpen,
                title: "The Beginning",
                description: "Started as a solution for small coaching institutes struggling with manual processes. We recognized the pain points of educators spending more time on administration than teaching.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: TrendingUp,
                title: "Growth & Innovation",
                description: "Expanded our platform to serve schools and colleges, adding advanced features like mobile apps, scholarship management, and comprehensive analytics dashboards.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: Globe,
                title: "Future Vision",
                description: "Today, we're building the next generation of educational technology, incorporating AI, machine learning, and advanced analytics to create smarter educational ecosystems.",
                gradient: "from-purple-500 to-purple-600"
              }
            ].map((story, index) => (
              <motion.div
                key={story.title}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${story.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <story.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{story.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{story.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Educational Institutions Choose Us
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div 
              className="space-y-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Heart,
                  title: "Built for Educators",
                  description: "Designed by understanding the real challenges faced by teachers and administrators in their daily operations."
                },
                {
                  icon: Clock,
                  title: "Quick Implementation",
                  description: "Get up and running in days, not months. Our streamlined onboarding process ensures minimal disruption."
                },
                {
                  icon: TrendingUp,
                  title: "Scalable Solutions",
                  description: "From small coaching centers to large universities - our platform grows with your institution."
                }
              ].map((feature, index) => (
                <motion.div 
                  key={feature.title}
                  className="flex gap-4"
                  variants={fadeInUp}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800/30"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ready to Transform Your Institution?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Join hundreds of educational institutions that have already revolutionized their operations with Enromatics.
              </p>
              <motion.button 
                onClick={() => router.push('/plans')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
                <TrendingUp className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900 dark:bg-black">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Digital Transformation?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Let's work together to digitalize your educational institution and unlock its full potential. 
            Contact us today for a free consultation and demo.
          </p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.button 
              onClick={() => setShowDemoModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Book Demo Modal */}
      {showDemoModal && <BookDemoModal onClose={() => setShowDemoModal(false)} />}
    </div>
  )
}