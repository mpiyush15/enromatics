"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaUsers, FaFileInvoiceDollar, FaChartBar, FaBook, FaUsers as FaParents, FaCalendarAlt, FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function LandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoData, setDemoData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will integrate email and mobile OTP here
    console.log("Demo booking:", demoData);
    setShowDemoModal(false);
  };
  return (
    <div className="w-full">
      {/* Hero Section - Dark Blue Gradient with Dashboard - Full Screen No Scroll */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900">
        {/* Decorative Gradient Overlay */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content Container - Fully Responsive */}
        <div className="w-full h-full flex items-center px-0 sm:px-0 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 items-center w-full h-full">
            {/* Left Side - Text (White on Dark) */}
            <div className="lg:col-span-2 flex flex-col justify-center order-2 lg:order-1 relative z-10 h-full px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 lg:-mt-24 text-center lg:text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                  Grow your<br />Coaching Institute<br />with Enro Matics
                </h1>
                
                <p className="text-xs sm:text-sm lg:text-lg text-gray-200 mb-4 sm:mb-6 lg:mb-8 font-light leading-relaxed">
                  Manage admissions, scholarship exams, social media, student reports, parents communication, daily attendance, fees reminders seamlessly with your own Brand Name
                </p>

                <div className="flex flex-col sm:flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-2 justify-center lg:justify-start">
                  <button 
                    onClick={() => setShowDemoModal(true)}
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition text-sm sm:text-base lg:text-sm shadow-lg w-full sm:w-auto lg:w-auto"
                  >
                    Book Demo
                  </button>
                  <Link 
                    href="/login"
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition text-sm sm:text-base lg:text-sm text-center w-full sm:w-auto lg:w-auto"
                  >
                    Visit Website
                  </Link>
                </div>

                {/* Mobile Dashboard Image - Show on small devices */}
                <div className="lg:hidden mt-4 sm:mt-6 flex justify-center">
                  <div className="relative w-full max-w-xs" style={{
                    perspective: "1000px",
                  }}>
                    <Image
                      src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png?updatedAt=1764163494512"
                      alt="Enromatics Dashboard"
                      width={400}
                      height={350}
                      className="w-full h-auto drop-shadow-lg rounded-xl"
                      style={{
                        transform: "rotateY(-10deg) rotateX(2deg) scale(0.9)",
                        transformStyle: "preserve-3d",
                      }}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Dashboard Image with 3D Effect */}
            <div className="lg:col-span-3 relative order-1 lg:order-2 hidden lg:flex h-full items-center justify-end overflow-hidden pb-24 sm:pb-28 lg:pb-32">
              <div className="relative w-full h-full mt-0 sm:mt-0 lg:mt-0" style={{
                perspective: "1200px",
              }}>
                <Image
                  src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png?updatedAt=1764163494512"
                  alt="Enromatics Dashboard"
                  width={1000}
                  height={900}
                  className="w-full h-auto drop-shadow-2xl rounded-2xl"
                  style={{
                    transform: "rotateY(-15deg) rotateX(5deg) translateZ(0) scale(0.85)",
                    transformStyle: "preserve-3d",
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Bar at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-transparent py-1 sm:py-2 lg:py-3 px-3 sm:px-4 lg:px-8 -translate-y-2 sm:-translate-y-6 lg:-translate-y-20">
          {/* Heading */}
          <h2 className="text-center text-white text-xs sm:text-base lg:text-xl font-semibold mb-1 sm:mb-2 lg:mb-3">
            You will manage all this in Enro Matics
          </h2>
          
          {/* Feature Icons Grid */}
          <div className="grid grid-cols-9 gap-1 sm:gap-2 lg:gap-3 max-w-full">
            {/* Feature 1: Student Management */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaUsers className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Students</p>
            </div>

            {/* Feature 2: Fees */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaFileInvoiceDollar className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Fees</p>
            </div>

            {/* Feature 3: Analytics */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaChartBar className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Analytics</p>
            </div>

            {/* Feature 4: Exams */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaBook className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Exams</p>
            </div>

            {/* Feature 5: Attendance */}
            <div className="flex flex-col items-center col-span-1 sm:col-span-1">
              <FaCalendarAlt className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Attendance</p>
            </div>

            {/* Feature 6: Facebook */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaFacebook className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Facebook</p>
            </div>

            {/* Feature 7: Instagram */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaInstagram className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Instagram</p>
            </div>

            {/* Feature 8: WhatsApp */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <FaWhatsapp className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">WhatsApp</p>
            </div>

            {/* Feature 9: Parent Communication */}
            <div className="flex flex-col items-center col-span-1 sm:col-span-1">
              <FaParents className="text-xl sm:text-2xl lg:text-3xl text-white hover:text-blue-400 transition cursor-pointer mb-0.5 sm:mb-1" />
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-300 font-light text-center">Parents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Demo</h3>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={demoData.name}
                  onChange={(e) => setDemoData({ ...demoData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={demoData.email}
                  onChange={(e) => setDemoData({ ...demoData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={demoData.phone}
                  onChange={(e) => setDemoData({ ...demoData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Message
                </label>
                <textarea
                  value={demoData.message}
                  onChange={(e) => setDemoData({ ...demoData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your institute..."
                  rows={3}
                />
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                We'll send you OTP for verification before scheduling the demo.
              </p>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mt-6"
              >
                Request Demo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
