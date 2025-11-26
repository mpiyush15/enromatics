"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Dashboard Background with Multiple Layers */}
        <div className="absolute inset-0 -z-20 w-full h-full">
          <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]">
            <Image
              src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
              alt="Dashboard Background"
              fill
              className="object-cover object-center"
              quality={100}
              priority
            />
          </div>
          
          {/* Dashboard UI Pattern Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent dark:via-transparent dark:to-transparent opacity-30 dark:opacity-20"
               style={{
                 backgroundImage: `
                   repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(59, 130, 246, 0.03) 1px, rgba(59, 130, 246, 0.03) 2px),
                   repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(59, 130, 246, 0.03) 1px, rgba(59, 130, 246, 0.03) 2px)
                 `
               }}></div>
        </div>

        {/* Decorative Gradient Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-80 h-80 bg-blue-400/15 dark:bg-blue-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-400/15 dark:bg-indigo-500/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-5xl w-full text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-full">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">✨ White Label Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Drive Real Institute Growth with Enromatics
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 font-light max-w-3xl mx-auto leading-relaxed">
            Manage admissions, students, payments, and analytics—all in one intuitive dashboard built for coaching institutes.
          </p>

          <p className="text-lg md:text-xl text-blue-600 dark:text-blue-400 mb-12 font-semibold max-w-3xl mx-auto">
            📱 Mobile App Included | 🎨 Full White Label Support | 🚀 Ready to Deploy
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg text-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition active:scale-95"
            >
              Get Started Free
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
            >
              Explore Features
            </Link>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm font-light">
            No credit card required. Start free for 14 days.
          </p>

          {/* Dashboard Preview Highlight */}
          <div className="mt-16 relative">
            <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
                alt="Enromatics Dashboard"
                width={1200}
                height={600}
                className="w-full rounded-lg"
                priority
              />
              <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 dark:border-blue-500/20 pointer-events-none"></div>
            </div>
            <div className="absolute -top-4 left-8 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Powerful Dashboard UI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage your coaching institute
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Streamline operations, boost student success, and grow your business with powerful tools designed for educators.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Student Management & Admissions</h3>
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
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Secure Payment Processing</h3>
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
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Analytics & Insights</h3>
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

          {/* Feature 4: Mobile App */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-24 pt-24 border-t border-gray-200 dark:border-gray-700">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mobile App</p>
                  <p className="text-gray-600 dark:text-gray-400">iOS & Android</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-full mb-4">
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">NEW FEATURE</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Manage on the Go with Mobile App</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Access your institute dashboard anywhere, anytime with our native mobile app for iOS and Android. Make critical decisions from your pocket with full feature parity to the web platform.
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Native iOS & Android apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Full feature parity with web dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Push notifications for important updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</span>
                  <span>Offline mode for critical information</span>
                </li>
              </ul>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">App Store</p>
                    <p className="font-semibold text-gray-900 dark:text-white">iPhone & iPad</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Google Play</p>
                    <p className="font-semibold text-gray-900 dark:text-white">Android</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: White Label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-24 pt-24 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-full mb-4">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">ENTERPRISE</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Full White Label Solution</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Rebrand the entire platform as your own. Customize colors, logos, domain names, and more—making Enromatics invisible to your clients while you take full credit for the technology.
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">✓</span>
                  <span>Custom branding & themes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">✓</span>
                  <span>Your own domain and email</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">✓</span>
                  <span>Completely reskinned mobile apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">✓</span>
                  <span>Custom help docs and support portal</span>
                </li>
              </ul>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">White Label</p>
                  <p className="text-gray-600 dark:text-gray-400">Your Brand, Your Success</p>
                </div>
              </div>
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
