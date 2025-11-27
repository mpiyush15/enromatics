"use client";

import Image from "next/image";
import Link from "next/link";
import { FaGraduationCap, FaFileInvoiceDollar, FaChartBar, FaBook, FaUsers as FaParents, FaCalendarAlt, FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function LandingPage() {
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
            <div className="lg:col-span-2 flex flex-col justify-center order-2 lg:order-1 relative z-10 h-full px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-20 lg:-mt-24 text-center lg:text-left">
              <div>
                <h1 className="text-3xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                  Grow your<br />Coaching Institute<br />with Enro Matics
                </h1>
                
                <p className="text-xs sm:text-sm lg:text-lg text-gray-200 mb-4 sm:mb-6 lg:mb-8 font-light leading-relaxed">
                  Manage admissions, scholarship exams, social media, student reports, parents communication, daily attendance, fees reminders seamlessly with your own Brand Name
                </p>

                <div className="flex flex-col sm:flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-2 justify-center lg:justify-start">
                  <Link 
                    href="/home"
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition text-sm sm:text-base lg:text-sm shadow-lg w-full sm:w-auto lg:w-auto"
                  >
                    Explore Platform
                  </Link>
                  <Link 
                    href="/home"
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition text-sm sm:text-base lg:text-sm text-center w-full sm:w-auto lg:w-auto"
                  >
                    Learn More
                  </Link>
                </div>

                {/* Mobile Dashboard Image - Show on small devices */}
                <div className="lg:hidden mt-4 sm:mt-6 mb-20 sm:mb-12 flex justify-center">
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
                    transform: "rotateY(-15deg) rotateX(5deg) translateY(15px) scale(0.85)",
                    transformStyle: "preserve-3d",
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Bar at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-transparent py-1 sm:py-2 lg:py-3 px-3 sm:px-4 lg:px-8 -translate-y-10 sm:-translate-y-20 lg:-translate-y-10">
          {/* Heading */}
          <h2 className="text-center text-white text-xs sm:text-base lg:text-xl font-semibold mb-1 sm:mb-2 lg:mb-3">
            You will manage all this in Enro Matics
          </h2>
          
          {/* Feature Icons - Scrolling on All Devices */}
          <div className="overflow-hidden w-full">
            <div className="scroll-icons-track">
              {/* Duplicate items 3x for seamless infinite loop without reset */}
              {[0, 1, 2].map((group) => (
                <div key={group} className="inline-flex gap-16">
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaGraduationCap className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Students</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaFileInvoiceDollar className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Fees</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaChartBar className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Analytics</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaBook className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Exams</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaCalendarAlt className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Attendance</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaFacebook className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Facebook</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaInstagram className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Instagram</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaWhatsapp className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">WhatsApp</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-max opacity-80">
                    <FaParents className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3" />
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-light">Parents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
