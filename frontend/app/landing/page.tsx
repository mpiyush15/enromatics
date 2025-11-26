import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 py-20">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
            alt="Dashboard Background"
            fill
            className="object-cover object-center"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-black/45"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl w-full text-center z-10">
          <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 leading-tight drop-shadow-lg">
            Drive Real Institute Growth with Enromatics
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-12 drop-shadow-md font-light max-w-2xl mx-auto leading-relaxed">
            Manage admissions, students, payments, and analytics—all in one intuitive dashboard built for coaching institutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg text-lg shadow-2xl hover:bg-gray-100 transition active:scale-95"
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

          <p className="text-white/80 mt-8 drop-shadow-md text-sm font-light">
            No credit card required. Start free for 14 days.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              Everything you need to manage your coaching institute
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline operations, boost student success, and grow your business with powerful tools designed for educators.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Student Management & Admissions</h3>
              <p className="text-lg text-gray-600 mb-4">
                Simplify the admission process, track student progress, and manage academic records all in one place. Reduce administrative overhead and focus on teaching.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Automated admission workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Real-time attendance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Performance monitoring & reports</span>
                </li>
              </ul>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
                alt="Student Management"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative h-80 rounded-xl overflow-hidden shadow-xl order-2 md:order-1">
              <Image
                src="https://ik.imagekit.io/a0ivf97jq/Admin%20Dashboard%20Light%20(1).png"
                alt="Payment Management"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Secure Payment Processing</h3>
              <p className="text-lg text-gray-600 mb-4">
                Accept payments from students and track financial transactions with complete security and transparency. Never miss a payment reminder again.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Multiple payment methods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Automated payment reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Detailed financial reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
              <p className="text-lg text-gray-600 mb-4">
                Make data-driven decisions with real-time analytics. Monitor institute performance, student outcomes, and identify growth opportunities.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Real-time performance dashboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Student success metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Revenue & financial insights</span>
                </li>
              </ul>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden shadow-xl">
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
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-lg text-gray-300">Coaching Institutes</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <p className="text-lg text-gray-300">Students Managed</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">₹10Cr+</div>
              <p className="text-lg text-gray-300">Payments Processed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-gray-900 text-center mb-16">Why Enromatics?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">Intuitive interface designed specifically for educators, not tech experts.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">�</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Ready</h3>
              <p className="text-gray-600">Manage your institute from anywhere, anytime on any device.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated support team ready to help with any questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold text-gray-900 mb-6">
            Ready to transform your coaching institute?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of coaching institutes already using Enromatics to streamline operations and grow their business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg text-lg hover:bg-gray-800 transition active:scale-95"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg text-lg hover:bg-gray-100 transition"
            >
              Schedule a Demo
            </Link>
          </div>

          <p className="text-gray-600 mt-6 text-sm">
            14 days free. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-2">Enromatics</h3>
            <p className="text-gray-400 mb-8">The complete platform for coaching institutes</p>
            
            <div className="flex justify-center gap-6 mb-8 text-sm">
              <Link href="#" className="hover:text-white transition">Privacy</Link>
              <Link href="#" className="hover:text-white transition">Terms</Link>
              <Link href="#" className="hover:text-white transition">Contact</Link>
            </div>
            
            <p className="text-gray-500 text-sm">
              © 2025 Enromatics. All rights reserved. | Empowering coaching institutes with technology.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
