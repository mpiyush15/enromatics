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
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Hero Section - Full Width ClassPlus Style */}
      <section className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10 w-full h-full opacity-10 dark:opacity-5">
          <Image
            src="https://ik.imagekit.io/a0ivf97jq/alop.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="max-w-6xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side */}
          <div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Grow Your Coaching Institute With Enromatics
            </h1>
            
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8 font-light leading-relaxed">
              Manage admissions, track attendance, process payments, and analyze performance—all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowDemoModal(true)}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg shadow-lg"
              >
                Book Demo
              </button>
              <Link 
                href="/login"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg text-center"
              >
                Visit Website
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative hidden md:block">
            <div className="relative w-full aspect-square">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/alop.png"
                alt="Enromatics Dashboard"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section id="features" className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center mb-16">
            What You Can Do
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* USP Card 1 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Student Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage admissions, attendance, and student records with ease.</p>
            </div>

            {/* USP Card 2 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Payment Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">Accept payments securely with automated reminders and tracking.</p>
            </div>

            {/* USP Card 3 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Analytics & Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">Get real-time analytics to make data-driven decisions.</p>
            </div>

            {/* USP Card 4 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mobile App</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage everything on iOS and Android with full feature parity.</p>
            </div>

            {/* USP Card 5 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">White Label</h3>
              <p className="text-gray-600 dark:text-gray-400">Rebrand the entire platform as your own business.</p>
            </div>

            {/* USP Card 6 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to grow your coaching institute?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Book a demo today to see how Enromatics can transform your business.
          </p>
          
          <button 
            onClick={() => setShowDemoModal(true)}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg text-lg hover:bg-blue-50 transition"
          >
            Book a Free Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-light">
            © 2025 Enromatics. All rights reserved. | Empowering coaching institutes with technology.
          </p>
        </div>
      </footer>

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
    </main>
  );
}
