'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BookDemoModal from '@/components/BookDemoModal';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappLink = 'https://wa.me/919766504856?text=Hi,%20I%20want%20to%20know%20more%20about%20Enromatics%20for%20my%20coaching%20institute';

  // Pricing data with monthly and annual
  const pricing = {
    trial: {
      monthly: 0,
      annual: 0,
      label: '₹0',
    },
    basic: {
      monthly: 999,
      annual: 8399,
      label: billingCycle === 'monthly' ? '₹999' : '₹8,399',
      savings: billingCycle === 'annual' ? '₹2,591' : null,
    },
    pro: {
      monthly: 2499,
      annual: 20999,
      label: billingCycle === 'monthly' ? '₹2,499' : '₹20,999',
      savings: billingCycle === 'annual' ? '₹9,891' : null,
    },
    enterprise: {
      monthly: null,
      annual: null,
      label: 'Custom',
    },
  };

  return (
    <div className="bg-white">
      {/* Sticky WhatsApp CTA */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2"
        title="Chat with us on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.226l-.014.009-4.297-.6.611 4.383.007.02a9.9 9.9 0 001.512 4.844H2.47C1.102 20.735 0 19.588 0 18.162c0-3.495 2.108-6.727 5.476-8.176.52-.26 1.07-.49 1.637-.686.568-.196 1.155-.359 1.746-.475h.002c.574-.11 1.16-.166 1.746-.166.586 0 1.172.056 1.746.166z" />
        </svg>
        <span className="hidden sm:inline text-sm font-semibold">Chat on WhatsApp</span>
      </a>

      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/home" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Enromatics
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              href="/home"
              className="text-indigo-600 hover:text-indigo-700 px-4 py-2 font-semibold transition-colors"
            >
              Visit Site
            </Link>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Get Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/50 py-12 flex items-center justify-center px-4">
        <div className="w-full text-center">
          {/* Content - Center Aligned */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="mb-4 inline-block bg-gradient-to-r from-indigo-600/10 to-blue-600/10 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ Built for Indian Coaching Institutes
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              <span className="text-black">Get More </span>
              <span className="text-orange-700">Admissions</span>
              <span className="text-black"> & Control Your </span>
              <span className="text-orange-700">Coaching Institute</span>
              <span className="text-black"> — Without Excel or WhatsApp Chaos</span>
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Manage students, fees, attendance, staff & WhatsApp follow-ups from one dashboard.
            </p>

            {/* Dual CTA Buttons - Hootsuite Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => setShowDemoModal(true)}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Request Demo
              </button>
              <a
                href="#plans-section"
                className="inline-block bg-white border-2 border-gray-900 hover:bg-gray-50 text-gray-900 font-bold px-8 py-3 rounded-lg transition-all"
              >
                Start Free Trial
              </a>
            </div>

            <div className="text-sm text-gray-600">
              <p>No credit card required • 14 days free access</p>
            </div>
          </div>

          {/* Big Centered Image */}
          <div className="relative group w-full">
            <div className="relative rounded-3xl shadow-2xl overflow-hidden w-full">
              <img 
                src="https://ik.imagekit.io/qujrbo6v2/landing%20page%20main%20iamge%20ad.png" 
                alt="Enromatics Dashboard"
                className="w-full h-auto rounded-3xl"
              />
            </div>

            {/* Glow Effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </section>

      {/* Why Not Pay for LMS Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-black">Why Pay for </span>
              <span className="text-orange-600">LMS</span>
              <span className="text-black"> When You Just Need Institute Management?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Most institutes don't need a full Learning Management System. You need a software that manages admissions, fees, attendance, and student communication — exactly what we built.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-blue-200 shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Heavy LMS Platforms</h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>• No clear features list</li>
                <li>• Overly complex for institutes</li>
                <li>• Bloated with unnecessary features</li>
                <li>• Long setup & training</li>
                <li>• Lacks communication ease & social media tools</li>
                <li>• Waste money on features you don't use</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-indigo-400 shadow-md hover:shadow-lg transition-shadow ring-1 ring-indigo-200">
              <div className="inline-block bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SMARTER CHOICE</div>
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enromatics</h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>• Affordable (₹999-2499/month)</li>
                <li>• Built specifically for institutes</li>
                <li>• Only features you actually use</li>
                <li>• Setup in minutes, not days</li>
                <li>• WhatsApp automation included <span className="text-xs text-gray-500">(charges applicable as package extra)</span></li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-blue-200 shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">What You Actually Need</h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>• Admit & track students ✓</li>
                <li>• Manage fees & payments ✓</li>
                <li>• Track attendance ✓</li>
                <li>• Send updates to parents ✓</li>
                <li>• View performance analytics ✓</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 p-8 bg-white rounded-2xl border-2 border-indigo-300">
            <p className="text-center text-gray-800 font-semibold text-lg">
              💡 <span className="text-indigo-600">You don't need online learning features if students attend classes in-person.</span> Save money. Use Enromatics instead.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-20 px-4">
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
            The Problem With Manual Coaching Management
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Admissions Tracking</h3>
              <p className="text-sm text-gray-700">
                Scattered across registers and WhatsApp. Leads get lost. Follow-ups are missed.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manual Fee Follow-ups</h3>
              <p className="text-sm text-gray-700">
                Staff sending reminders on personal phones. Messages get lost. Collections delay.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance Chaos</h3>
              <p className="text-sm text-gray-700">
                Wrong reports from staff. No real-time visibility. Parent complaints pile up.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Analytics</h3>
              <p className="text-sm text-gray-700">
                Can't see revenue trends. No student insights. Zero growth metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-gradient-to-br from-white to-slate-50 py-20 px-4">
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
            Meet Enromatics. All Your Institute Operations in One Place.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lead Management</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Auto WhatsApp follow-ups to every lead. Track conversations. Convert faster. Never lose a lead again.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fee Management</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Auto fee reminders. Payment tracking. Instant receipts. Transparent payment history for parents.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">�</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Management</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Complete student profiles. Attendance tracking. Performance analytics. Parent communication tools.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Revenue dashboard. Growth metrics. Student insights. Staff performance. Data-driven decisions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Staff Management</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Role-based access. Attendance management. Performance tracking. Transparent staff data.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">�</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">WhatsApp Automation</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Automated campaigns. Template messages. Bulk messaging. Two-way conversations with parents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "Who This Software Is For" Section */}
      <section className="bg-white py-20 px-4">
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Who This Software Is For
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Coaching institutes teaching any kind of subjects & entrance exam preparation
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Coaching Types */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-10 rounded-2xl border border-indigo-200">
              <h3 className="text-2xl font-bold text-indigo-600 mb-8">📚 Coaching Types We Support</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-800">
                  <span className="text-indigo-600 font-bold text-lg">•</span>
                  <span>NEET/JEE/CAT entrance exam coaching</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-indigo-600 font-bold text-lg">•</span>
                  <span>Foundation & competitive exam prep classes</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-indigo-600 font-bold text-lg">•</span>
                  <span>Mathematics, Science & Language tuition</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-indigo-600 font-bold text-lg">•</span>
                  <span>Bank/SSC/Government exam coaching centers</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-indigo-600 font-bold text-lg">•</span>
                  <span>Multi-batch coaching centers with programs</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-indigo-600 font-bold text-lg">•</span>
                  <span>Franchise & chain coaching models</span>
                </li>
              </ul>
            </div>

            {/* Subject Coverage */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-2xl border border-blue-200">
              <h3 className="text-2xl font-bold text-blue-600 mb-8">🎯 Subject & Exam Coverage</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-800">
                  <span className="text-blue-600 font-bold text-lg">•</span>
                  <span>Any subject (Math, Science, Languages, etc.)</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-blue-600 font-bold text-lg">•</span>
                  <span>Board exams (CBSE, ICSE, State boards)</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-blue-600 font-bold text-lg">•</span>
                  <span>Entrance exams (Medical, Engineering, Law)</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-blue-600 font-bold text-lg">•</span>
                  <span>Skill development & personality training</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-blue-600 font-bold text-lg">•</span>
                  <span>Online & offline batch management</span>
                </li>
                <li className="flex gap-3 text-gray-800">
                  <span className="text-blue-600 font-bold text-lg">•</span>
                  <span>Test series & exam scheduling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Plans & Trial Section */}
      <section id="plans-section" className="bg-gradient-to-br from-slate-50 to-white py-20 px-4">
        <div className="w-full text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Start Managing Your Institute Today
          </h2>
          <p className="text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Try Enromatics free for 14 days. No credit card required. Full access to all features.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto mb-12">
            {/* Try for 14 Days Card */}
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-10 hover:shadow-lg transition-shadow flex flex-col flex-1 max-w-xs">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Try for 14 Days</h3>
              <div className="text-5xl font-bold text-indigo-600 mb-4">₹0</div>
              <p className="text-sm text-gray-600 mb-8">No credit card required</p>
              <ul className="text-sm text-gray-700 space-y-3 text-left mb-8 flex-grow">
                <li>✓ Full platform access</li>
                <li>✓ All features included</li>
                <li>✓ Unlimited students & staff</li>
                <li>✓ No restrictions</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <a
                href="/signup?plan=trial"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Start Free Trial →
              </a>
            </div>

            <div className="hidden md:flex items-center justify-center text-3xl text-gray-400">OR</div>

            {/* Explore Plans Card */}
            <div className="bg-indigo-600 rounded-2xl p-10 text-white shadow-lg flex flex-col flex-1 max-w-xs">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4">View Detailed Plans</h3>
              <p className="text-indigo-200 mb-8 flex-grow">
                Compare all pricing tiers, features, and find the perfect plan for your institute.
              </p>
              <a
                href="/plans"
                className="block w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-lg transition-colors"
              >
                Explore Plans →
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Need a custom plan? <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-semibold">Contact our sales team</a>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 px-4">
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-base font-bold text-gray-900 mb-3">How long does setup take?</h3>
              <p className="text-sm text-gray-700">
                Setup takes 15-30 minutes. Our team handles WhatsApp integration. You just add your student data and start using it.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-base font-bold text-gray-900 mb-3">Can I migrate my existing data?</h3>
              <p className="text-sm text-gray-700">
                Yes! We help migrate student records, fee details, and batch information from Excel/registers. Contact us for details.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-base font-bold text-gray-900 mb-3">Who owns the WhatsApp number?</h3>
              <p className="text-sm text-gray-700">
                You do. It's your coaching institute's WhatsApp Business account. We just manage the automation.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-base font-bold text-gray-900 mb-3">Do we need to pay for WhatsApp Business messages extra?</h3>
              <p className="text-sm text-gray-700">
                Yes. WhatsApp Business messages are charged separately by Meta. Packages start from <strong>₹1,499/month for 1,000 messages</strong>. Volume-based pricing is available for larger message counts. This is paid directly to Meta in addition to your Enromatics subscription.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-base font-bold text-gray-900 mb-3">What if I need custom features?</h3>
              <p className="text-sm text-gray-700">
                We build custom modules based on your needs. Talk to our team to discuss your specific requirements.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-base font-bold text-gray-900 mb-3">Is there customer support?</h3>
              <p className="text-sm text-gray-700">
                Yes! 24/7 WhatsApp support. Direct access to our team. Weekly check-ins for the first month. Training sessions included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-20 px-4 text-white">
        <div className="w-full text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 max-w-4xl mx-auto">
            Ready to Stop the Chaos & Start Growing?
          </h2>

          <p className="text-lg mb-8 opacity-90 max-w-3xl mx-auto">
            Get your free demo. See how Enromatics works for your institute.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white hover:bg-gray-100 text-indigo-600 font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            💬 Chat with Us on WhatsApp
          </a>

          <p className="text-sm mt-6 opacity-75">
            Expect a response in 5 minutes to 2 hours (during business hours)
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Enromatics</h4>
              <p className="text-sm">Dashboard for coaching institutes</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Features</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Admissions</a></li>
                <li><a href="#" className="hover:text-white transition">Fee Management</a></li>
                <li><a href="#" className="hover:text-white transition">Attendance</a></li>
                <li><a href="#" className="hover:text-white transition">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Enromatics. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showDemoModal && <BookDemoModal onClose={() => setShowDemoModal(false)} />}
    </div>
  );
}
