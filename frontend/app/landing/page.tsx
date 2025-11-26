"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
            <div className="lg:col-span-2 flex flex-col justify-center order-2 lg:order-1 relative z-10 h-full px-4 sm:px-6 lg:px-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  Grow your<br />Coaching Institute<br />with Enro Matics
                </h1>
                
                <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-6 sm:mb-8 font-light leading-relaxed">
                  Manage admissions, scholarship exams, social media, student reports, parents communication, daily attendance, fees reminders seamlessly with your own Brand Name
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => setShowDemoModal(true)}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition text-base sm:text-lg shadow-lg w-full sm:w-auto"
                  >
                    Book Demo
                  </button>
                  <Link 
                    href="/login"
                    className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition text-base sm:text-lg text-center w-full sm:w-auto"
                  >
                    Visit Website
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Dashboard Image with 3D Effect */}
            <div className="lg:col-span-3 relative order-1 lg:order-2 h-full flex items-center justify-end overflow-hidden">
              <div className="relative w-full h-full mt-20 sm:mt-24 lg:mt-32" style={{
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
