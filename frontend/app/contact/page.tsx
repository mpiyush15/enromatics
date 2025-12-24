"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Contact() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate form submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", institute: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      description: "Send us an email and we'll respond within 24 hours",
      value: "contact@enromatics.com"
    },
    {
      icon: "📱",
      title: "WhatsApp",
      description: "Chat with us on WhatsApp for instant support",
      value: "+91 9766504856"
    },
    {
      icon: "📞",
      title: "Phone",
      description: "Call us during business hours (9 AM - 6 PM IST)",
      value: "+91 8087131777"
    },
    {
      icon: "🏢",
      title: "Office",
      description: "Visit our office in Bangalore",
      value: "Bangalore, India"
    }
  ];

  const faqs = [
    {
      q: "How quickly can I start using Enromatics?",
      a: "Instantly! As a SaaS platform, we deliver access immediately after signup. You can go digital in less than 30 minutes - just sign up, configure your institute details, and start using all features right away."
    },
    {
      q: "Do I need any technical knowledge to set up?",
      a: "Not at all! Our platform is designed to be user-friendly. The initial setup takes less than 30 minutes and requires no technical expertise. We guide you through every step."
    },
    {
      q: "Is there any installation or hardware required?",
      a: "Zero installation needed! Enromatics is a cloud-based SaaS application. Just open your browser or mobile app and start working. No servers, no hardware, no IT team required."
    },
    {
      q: "How long does it take to migrate my existing data?",
      a: "We handle complete data migration from your existing system within 24-48 hours at no extra cost. Our team ensures zero data loss and validates everything before you go live."
    },
    {
      q: "Can I try before committing to a paid plan?",
      a: "Absolutely! We offer a 14-day free trial with full access to all features. No credit card required to start. Experience everything before making a decision."
    },
    {
      q: "What kind of support do you provide after signup?",
      a: "We provide 24/7 email support, priority WhatsApp support (+91 9766504856), phone support (+91 8087131777), and dedicated account managers for enterprise plans. Our team is always ready to help."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, you can cancel anytime without any penalties or long-term contracts. We believe in earning your business every month, not locking you in."
    },
    {
      q: "Do you offer training for my staff?",
      a: "Yes! We provide comprehensive online training sessions for all staff members. Plus, our intuitive interface means most features are self-explanatory and easy to learn."
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-slate-800 dark:text-slate-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30 pt-32 md:pt-40 pb-20">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Have questions? Our team is here to help you find the perfect solution for your institute.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg border border-slate-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="text-5xl mb-4">{method.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {method.description}
                </p>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {method.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Institute Name *
                    </label>
                    <input
                      type="text"
                      name="institute"
                      value={formData.institute}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
                      placeholder="Your institute name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
                  >
                    <option value="">Select a subject...</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="implementation">Implementation Help</option>
                    <option value="support">Support & Troubleshooting</option>
                    <option value="custom">Custom Features</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition text-slate-900 dark:text-white resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 font-semibold"
                  >
                    ✅ Thank you! We've received your message and will get back to you shortly.
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold overflow-hidden shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  We typically respond within 24 business hours.
                </p>
              </form>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Why Choose Enro Matics?
              </h3>

              <div className="space-y-6">
                {[
                  {
                    title: "Expert Team",
                    description: "Our team has 10+ years of experience in education technology and institute management."
                  },
                  {
                    title: "Fast Implementation",
                    description: "Get up and running in 1-2 weeks with our streamlined onboarding process."
                  },
                  {
                    title: "24/7 Support",
                    description: "Our dedicated support team is always available to help you succeed."
                  },
                  {
                    title: "Proven Results",
                    description: "500+ institutes trust us to manage their operations and drive growth."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="pb-6 border-b border-blue-200 dark:border-blue-800 last:border-0 last:pb-0">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">✨ {item.title}</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 pt-8 border-t border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Active Institutes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Students Managed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Find answers to common questions about our platform
              </p>
            </motion.div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
              >
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between p-6 select-none hover:bg-slate-50 dark:hover:bg-gray-700/50 transition">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {faq.q}
                    </h3>
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-gray-700">
                    {faq.a}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-800 text-center"
          >
            <p className="text-slate-900 dark:text-white mb-4">
              <span className="font-bold">Didn't find your answer?</span> Our support team is here to help.
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Contact Support
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Go Digital in 30 Minutes?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 500+ institutes that transformed their operations instantly with Enromatics. Start now and go digital today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push("/plans")}
                className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg"
              >
                Start Free Trial - Go Digital Now
              </button>
              <button 
                onClick={() => window.open(`https://wa.me/919766504856?text=Hi, I want to schedule a demo for Enromatics`, '_blank')}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition text-lg"
              >
                WhatsApp Us for Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Enro Matics</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                The complete institute management platform that helps coaching institutes automate operations, increase revenue, and grow faster.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="/home" className="hover:text-blue-400 transition">Home</a></li>
                <li><a href="/plans" className="hover:text-blue-400 transition">Pricing</a></li>
                <li><a href="/subscribe" className="hover:text-blue-400 transition">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="/privacy-policy" className="hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-blue-400 transition">Terms of Service</a></li>
                <li><a href="/contact" className="hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-slate-500">
            <p>© {new Date().getFullYear()} Enro Matics. All rights reserved. Empowering coaching institutes with smart automation.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
