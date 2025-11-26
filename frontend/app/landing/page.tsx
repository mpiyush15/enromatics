"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background with Image */}
        <div className="absolute inset-0 -z-10 w-full h-full">
          <Image
            src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
            alt="Dashboard"
            fill
            className="object-cover object-center"
            quality={100}
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl w-full text-center relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Drive Real Institute Growth with Enromatics
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light max-w-3xl mx-auto leading-relaxed">
            Manage admissions, students, payments, and analytics—all in one intuitive dashboard built for coaching institutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg text-lg shadow-lg hover:bg-gray-100 transition active:scale-95"
            >
              Get Started Free
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg text-lg hover:bg-white/10 transition"
            >
              Explore Features
            </Link>
          </div>

          <p className="text-white/70 text-sm font-light">
            No credit card required. Start free for 14 days.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage your coaching institute
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Streamline operations, boost student success, and grow your business with powerful tools designed for educators.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Student Management & Admissions</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Simplify the admission process, track student progress, and manage academic records all in one place. Reduce administrative overhead and focus on teaching.
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Automated admission workflows</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Real-time attendance tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Performance monitoring & reports</span>
                </li>
              </ul>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
                alt="Student Management"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative h-80 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 order-2 md:order-1">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
                alt="Payment Management"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Secure Payment Processing</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Accept payments from students and track financial transactions with complete security and transparency. Never miss a payment reminder again.
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Multiple payment methods</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Automated payment reminders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Detailed financial reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Analytics & Insights</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Make data-driven decisions with real-time analytics. Monitor institute performance, student outcomes, and identify growth opportunities.
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Real-time performance dashboards</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Student success metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Revenue & financial insights</span>
                </li>
              </ul>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
                alt="Analytics"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div>
              <div className="text-6xl font-bold mb-4 text-blue-400">500+</div>
              <p className="text-xl text-gray-300 font-light">Coaching Institutes Trust Us</p>
            </div>
            <div>
              <div className="text-6xl font-bold mb-4 text-blue-400">50K+</div>
              <p className="text-xl text-gray-300 font-light">Students Successfully Managed</p>
            </div>
            <div>
              <div className="text-6xl font-bold mb-4 text-blue-400">₹10Cr+</div>
              <p className="text-xl text-gray-300 font-light">Payments Processed Securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center mb-20">
            Why Enromatics?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Easy to Use</h3>
              <p className="text-gray-600 dark:text-gray-400 font-light">Intuitive interface designed specifically for educators, not tech experts.</p>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400 font-light">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mobile Ready</h3>
              <p className="text-gray-600 dark:text-gray-400 font-light">Manage your institute from anywhere, anytime on any device.</p>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-400 font-light">Dedicated support team ready to help with any questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to transform your coaching institute?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 font-light">
            Join hundreds of coaching institutes already using Enromatics to streamline operations and grow their business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-gray-900 dark:bg-blue-600 text-white font-semibold rounded-lg text-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition active:scale-95"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 border-2 border-gray-900 dark:border-blue-600 text-gray-900 dark:text-white font-semibold rounded-lg text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Schedule a Demo
            </Link>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mt-8 text-sm font-light">
            14 days free. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Enromatics</h3>
            <p className="text-gray-500 mb-12 font-light">The complete platform for coaching institutes</p>
            
            <div className="flex justify-center gap-8 mb-12 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Terms</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Contact</Link>
            </div>
            
            <p className="text-gray-600 text-sm font-light">
              © 2025 Enromatics. All rights reserved. | Empowering coaching institutes with technology.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
