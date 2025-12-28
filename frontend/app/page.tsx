"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaGraduationCap, FaFileInvoiceDollar, FaChartBar, FaBook, FaUsers as FaParents, FaCalendarAlt, FaFacebook, FaInstagram, FaWhatsapp, FaChevronRight } from "react-icons/fa";
import BookDemoModal from "@/components/BookDemoModal";

export default function LandingPage() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showTransitionScreen, setShowTransitionScreen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", coachingName: "", mobile: "" });
  const [questAnswers, setQuestAnswers] = useState({ students: "", coachingType: "", currentManagement: "" });
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState<"starter" | "pro" | null>(null);

  return (
    <div className="w-full">
      {/* ========== HERO SECTION - MVP 1 VERSION (CLEAN) ========== */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900">
        {/* Decorative Gradient Overlay */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content Container - Grid Layout */}
        <div className="w-full h-full flex items-center px-0 sm:px-0 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 items-center w-full h-full">
            {/* Left Side - Text (White on Dark) */}
            <div className="lg:col-span-2 flex flex-col justify-center order-2 lg:order-1 relative z-10 h-full px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-20 lg:-mt-24 text-center lg:text-left">
              <div>
                <h1 className="text-3xl sm:text-3xl lg:text-4xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                  Stop Manual Admin Work<br />Start automated<br />Institute management
                </h1>
                
                <p className="text-xs sm:text-sm lg:text-lg text-gray-200 mb-4 sm:mb-6 lg:mb-8 font-light leading-relaxed">
                  Designed for Coaching Institutes & Schools to automate student tracking, fee reminders, attendance, and parent communication — all in one simple dashboard
                </p>

                <div className="flex flex-col sm:flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-2 justify-center lg:justify-start">
                  <button 
                    onClick={() => setShowQuestionnaireModal(true)}
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition text-sm sm:text-base lg:text-sm shadow-lg w-full sm:w-auto lg:w-auto flex items-center justify-center gap-2"
                  >
                    Find Your Plan <FaChevronRight className="text-xs" />
                  </button>
                  <button 
                    onClick={() => setShowDemoModal(true)}
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition text-sm sm:text-base lg:text-sm text-center w-full sm:w-auto lg:w-auto"
                  >
                    📅 Book Demo
                  </button>
                  <Link 
                    href="/home"
                    className="px-4 sm:px-6 lg:px-5 py-2 sm:py-3 lg:py-2 border-2 border-blue-400 text-blue-400 font-bold rounded-lg hover:bg-blue-400/10 transition text-sm sm:text-base lg:text-sm text-center w-full sm:w-auto lg:w-auto flex items-center justify-center gap-2"
                  >
                    Explore now <FaChevronRight className="text-xs" />
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
          <h2 className="text-center text-white text-xs sm:text-base lg:text-xl font-semibold mb-1 sm:mb-2 lg:mb-3">
            You will manage all this in Enro Matics
          </h2>
          
          <div className="overflow-hidden w-full">
            <style>{`
              @keyframes scroll-icons {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .scroll-icons-track {
                display: inline-flex;
                animation: scroll-icons 30s linear infinite;
                gap: 4rem;
              }
            `}</style>
            <div className="scroll-icons-track">
              {[0, 1].map((group) => (
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

      {/* Modern Questionnaire Modal */}
      {showQuestionnaireModal && (
        <QuestionnaireModal 
          onClose={() => setShowQuestionnaireModal(false)} 
          onRequestDemo={() => setShowDemoModal(true)} 
          onQuestionnaireComplete={(answers) => {
            setQuestAnswers(answers);
            setShowQuestionnaireModal(false);
            setShowTransitionScreen(true);
          }}
        />
      )}

      {/* Transition Screen - "We're Almost Done" */}
      {showTransitionScreen && (
        <TransitionScreen 
          onClose={() => setShowTransitionScreen(false)} 
          onContinue={() => {
            setShowTransitionScreen(false);
            setShowSignUpModal(true);
          }}
        />
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <SignUpModal 
          onClose={() => setShowSignUpModal(false)} 
          questAnswers={questAnswers}
          recommendedPlan={recommendedPlan || "starter"}
          onSuccess={(info) => {
            setUserInfo(info);
            setShowSignUpModal(false);
            
            // Calculate recommended plan based on questionnaire answers
            let plan: "starter" | "pro" = "starter";
            if (questAnswers.students === "201-500 students" || questAnswers.students === "500+ students") {
              plan = "pro";
            } else if (questAnswers.students === "51-200 students" && questAnswers.coachingType !== "School Tuition Classes") {
              plan = "pro";
            }
            
            setRecommendedPlan(plan);
            setShowRecommendation(true);
          }}
        />
      )}

      {showDemoModal && <BookDemoModal onClose={() => setShowDemoModal(false)} />}

      {/* Recommendation Screen */}
      {showRecommendation && recommendedPlan && (
        <RecommendationScreen 
          plan={recommendedPlan} 
          userInfo={userInfo}
          onClose={() => setShowRecommendation(false)} 
          onRequestDemo={() => {
            setShowRecommendation(false);
            setShowDemoModal(true);
          }} 
        />
      )}
    </div>
  );
}

// Transition Screen Component - "We're Almost Done"
function TransitionScreen({ onClose, onContinue }: { onClose: () => void; onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .bounce-animation {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden slide-up">
        {/* Colorful Header */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            <div className="text-6xl mb-4 bounce-animation">🎯</div>
            <h2 className="text-3xl font-bold text-white mb-2">We're Almost Done!</h2>
            <p className="text-white/90 text-lg font-medium">
              Just tell us about your institute and get the best plan to make it automated.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            </div>
            <p className="text-slate-700 text-lg font-semibold leading-relaxed">
              Your answers help us personalize the perfect solution for <span className="text-blue-600 font-bold">your coaching institute</span>.
            </p>
          </div>

          <div className="space-y-3 mb-8 text-left bg-blue-50 p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✓</span>
              <span className="text-slate-700 font-medium">Get a plan tailored to your size</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✓</span>
              <span className="text-slate-700 font-medium">Save 15-20 hours every week</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✓</span>
              <span className="text-slate-700 font-medium">Automate student tracking & fees</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 flex gap-3 border-t flex-col sm:flex-row">
          <Link
            href="/pricing"
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition text-center"
          >
            Explore Plans
          </Link>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Continue <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sign Up Modal Component
function SignUpModal({ onClose, onSuccess, questAnswers, recommendedPlan }: { onClose: () => void; onSuccess: (info: { name: string; coachingName: string; mobile: string; email: string }) => void; questAnswers: { students: string; coachingType: string; currentManagement: string }; recommendedPlan: "starter" | "pro" }) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({ name: "", coachingName: "", mobile: "", email: "" });
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmitForm = () => {
    if (formData.name && formData.coachingName && formData.mobile && formData.email) {
      setStep("otp");
      // Send OTP email (only once)
      sendOtpEmail(formData.email);
    }
  };

  const sendOtpEmail = async (email: string) => {
    try {
      // Call backend to send OTP email
      const response = await fetch("/api/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "verification" })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to send OTP email:", error);
      }
    } catch (error) {
      console.error("Failed to send OTP email:", error);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      setIsVerifying(true);
      try {
        // Create lead in superadmin with source and plan details
        const leadData = {
          name: formData.name,
          email: formData.email,
          phone: formData.mobile,
          institute: formData.coachingName,
          source: "landing-page",
          plan: recommendedPlan,
          notes: `Questionnaire: Students: ${questAnswers.students}, Type: ${questAnswers.coachingType}, Current: ${questAnswers.currentManagement}`
        };

        // Create lead using form-leads endpoint (public)
        await fetch("/api/public/form-leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData)
        });

        // Send personalized plan email
        await fetch("/api/email/send-plan-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            coachingName: formData.coachingName,
            plan: recommendedPlan,
            questionnaire: questAnswers
          })
        });

        setTimeout(() => {
          setIsVerifying(false);
          onSuccess(formData);
        }, 1500);
      } catch (error) {
        console.error("Failed to create lead or send email:", error);
        setIsVerifying(false);
      }
    }
  };

  if (step === "form") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
        `}</style>

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden slide-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Get Started</h2>
              <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
            </div>
            <p className="text-white/80 text-sm">Tell us about your coaching institute</p>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Your Name *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Coaching/Institute Name *</label>
              <input
                type="text"
                placeholder="Enter your coaching institute name"
                value={formData.coachingName}
                onChange={(e) => setFormData({ ...formData, coachingName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Mobile Number *</label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address *</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-6 flex gap-3 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={!formData.name || !formData.coachingName || !formData.mobile || formData.mobile.length !== 10 || !formData.email}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Send OTP <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Verify OTP</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
          </div>
          <p className="text-white/80 text-sm">Enter the 6-digit OTP sent to your email: <strong>{formData.email}</strong></p>
        </div>

        {/* OTP Content */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Enter OTP *</label>
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 text-center text-2xl letter-spacing-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500 transition font-mono"
            />
          </div>

          <div className="text-center text-sm text-slate-600">
            <p>Didn't receive OTP? <button onClick={() => setOtp("")} className="text-blue-600 font-semibold hover:underline">Resend</button></p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 flex gap-3 border-t">
          <button
            onClick={() => setStep("form")}
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition"
          >
            Back
          </button>
          <button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || isVerifying}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modern Questionnaire Component with smooth slide animations
function QuestionnaireModal({ onClose, onRequestDemo, onQuestionnaireComplete }: { onClose: () => void; onRequestDemo: () => void; onQuestionnaireComplete: (answers: { students: string; coachingType: string; currentManagement: string }) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ students: "", coachingType: "", currentManagement: "" });

  const steps = [
    {
      question: "How many students do you currently have?",
      type: "radio",
      key: "students",
      options: ["1-50 students", "51-200 students", "201-500 students", "500+ students"],
    },
    {
      question: "What type of coaching do you provide?",
      type: "radio",
      key: "coachingType",
      options: ["IIT/NEET Coaching", "School Tuition Classes", "Competitive Exam Prep", "Skill Development", "Other"],
    },
    {
      question: "How do you currently manage operations?",
      type: "radio",
      key: "currentManagement",
      options: ["Excel Sheets", "Pen & Paper", "Basic Software", "WhatsApp Manually", "No System"],
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // After questionnaire complete, trigger sign-up form
      onQuestionnaireComplete(answers);
    }
  };

  const currentStep = steps[step];
  const progress = ((step + 1) / (steps.length + 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-40px);
          }
        }
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        .slide-out {
          animation: slideOut 0.3s ease-in;
        }
      `}</style>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header with progress bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Find Your Perfect Plan</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
          </div>
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-white/80 mt-2">Step {step + 1} of {steps.length}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="slide-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{currentStep.question}</h3>

            <div className="space-y-3">
              {currentStep.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <input
                    type="radio"
                    name={currentStep.key}
                    value={option}
                    checked={answers[currentStep.key as keyof typeof answers] === option}
                    onChange={() => setAnswers({ ...answers, [currentStep.key]: option })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="ml-3 text-slate-900 font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-t">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className="px-6 py-2 text-slate-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-900"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentStep.key as keyof typeof answers]}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {step === steps.length - 1 ? "See Recommendation" : "Next"} <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Recommendation Screen Component
function RecommendationScreen({ plan, userInfo, onClose, onRequestDemo }: { plan: "starter" | "pro"; userInfo: { name: string; coachingName: string; mobile: string }; onClose: () => void; onRequestDemo: () => void }) {
  const plans = {
    starter: {
      name: "Starter Plan",
      price: "₹999",
      emoji: "🚀",
      description: "Perfect for small to medium coaching institutes",
      features: [
        "✓ Up to 50 students",
        "✓ Fee tracking & reminders",
        "✓ Attendance management",
        "✓ WhatsApp notifications",
        "✓ Student performance tracking",
        "✓ Email support",
      ],
      color: "from-blue-600 to-blue-700",
      highlight: false,
    },
    pro: {
      name: "Pro Plan",
      price: "₹1,999",
      emoji: "⚡",
      description: "For growing institutes with advanced needs",
      features: [
        "✓ Up to 500+ students",
        "✓ Everything in Starter",
        "✓ Online tests & exams",
        "✓ Advanced analytics",
        "✓ Unlimited staff access",
        "✓ Priority support",
        "✓ Custom integrations",
      ],
      color: "from-purple-600 to-purple-700",
      highlight: true,
    },
  };

  const selectedPlan = plans[plan];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-up {
          animation: slideUp 0.6s ease-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .pulse-subtle {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden slide-up">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-10 text-slate-400 hover:text-slate-900 text-2xl">✕</button>

        {/* Plan Card */}
        <div className={`bg-gradient-to-br ${selectedPlan.color} p-8 text-white`}>
          <div className="text-6xl mb-4">{selectedPlan.emoji}</div>
          <h2 className="text-4xl font-bold mb-2">{selectedPlan.name}</h2>
          <p className="text-white/90 text-lg mb-6">{selectedPlan.description}</p>
          <div className="text-5xl font-bold">{selectedPlan.price}<span className="text-xl font-normal">/month</span></div>
        </div>

        {/* Features */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">What's included:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {selectedPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="text-green-500 font-bold text-lg mt-0.5">✓</div>
                <span className="text-slate-700 font-medium">{feature.replace("✓ ", "")}</span>
              </div>
            ))}
          </div>

          {/* Why this plan */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-slate-700 font-medium">
              💡 Based on your answers, <strong>{selectedPlan.name}</strong> is the best fit for your coaching institute. It includes all the features you need to automate operations and save 15-20 hours weekly.
            </p>
          </div>

          {/* Personalized plan message */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-8">
            <p className="text-slate-700 font-medium">
              ✅ <strong>Personalized plan details will be sent to {userInfo.mobile}</strong> - You'll receive a detailed comparison and next steps specific to {userInfo.coachingName}.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="bg-slate-50 px-8 py-6 flex gap-4 border-t flex-col sm:flex-row">
          <button
            onClick={onRequestDemo}
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition flex-1"
          >
            📅 Book Demo
          </button>
          <Link
            href="/home"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex-1 text-center pulse-subtle"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
