"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
      {/* Navbar */}
      

      {/* Hero */}
      <section className="flex flex-col items-center text-center py-24 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          All-in-One Platform for Coaching Institutes
        </motion.h2>
        <p className="text-lg text-slate-600 max-w-2xl">
          Manage admissions, staff, students, fees, and marketing — all in one powerful
          dashboard. Automate your growth with Meta & WhatsApp integration.
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="/subscribe"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started Free
          </a>
          <a
            href="#features"
            className="border border-slate-300 px-6 py-3 rounded-lg font-medium hover:border-blue-600 hover:text-blue-600 transition"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12">Everything You Need to Grow</h3>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "Institute Management",
              desc: "Handle admissions, student data, and payments with ease using a unified dashboard.",
            },
            {
              title: "Marketing Automation",
              desc: "Run Meta & WhatsApp ad campaigns directly from your panel and track results live.",
            },
            {
              title: "Team & Performance",
              desc: "Manage staff, assign tasks, and monitor results with intelligent reporting tools.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl shadow-sm border bg-slate-50 hover:shadow-md transition"
            >
              <h4 className="text-xl font-semibold mb-3 text-blue-700">{f.title}</h4>
              <p className="text-slate-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-blue-100 text-center">
        <h3 className="text-3xl font-bold mb-6">Smart Dashboard for Smarter Institutes</h3>
        <p className="text-slate-600 max-w-2xl mx-auto mb-10">
          Visualize student performance, leads, payments, and campaigns — all at a glance.
        </p>
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 border">
          <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            [Dashboard Preview Image]
          </div>
        </div>
      </section>

      {/* Pricing */}
      

      {/* Footer */}
      <footer
        id="contact"
        className="bg-slate-900 text-slate-200 py-12 text-center px-6 mt-10"
      >
        <h4 className="text-xl font-semibold mb-3">Enro Matics</h4>
        <p className="max-w-xl mx-auto text-slate-400 mb-4">
          Empowering coaching institutes with automation, analytics, and marketing growth tools.
        </p>
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Enro Matics. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
