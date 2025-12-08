"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Mail, Lock, Building2, Phone, User, Shield, CreditCard } from "lucide-react";
import Link from "next/link";

// --- Types ---
type SubscriptionPlan = {
  _id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "yearly";
  features: string[];
  maxStudents: number;
  maxStaff: number;
};

type Step = "choose-type" | "verify-otp" | "login" | "payment" | "processing";

type FormData = {
  name: string;
  instituteName: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
};

// --- Label Component ---
function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

// --- OTP Input Component ---
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled: boolean }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const newOtp = value.split("");
    newOtp[index] = char;
    onChange(newOtp.join(""));
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold"
        />
      ))}
    </div>
  );
}

// --- Step Indicator ---
function StepIndicator({ currentStep, isNewTenant, isFree }: { currentStep: Step; isNewTenant: boolean; isFree: boolean }) {
  const steps = isNewTenant
    ? isFree
      ? [
          { key: "choose-type", label: "Account Type" },
          { key: "verify-otp", label: "Verify Email" },
        ]
      : [
          { key: "choose-type", label: "Account Type" },
          { key: "verify-otp", label: "Verify Email" },
          { key: "payment", label: "Payment" },
        ]
    : [
        { key: "choose-type", label: "Account Type" },
        { key: "login", label: "Login" },
        { key: "payment", label: "Payment" },
      ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
          </div>
          <span className={`ml-2 text-sm ${index <= currentIndex ? "text-blue-600 font-medium" : "text-gray-500"}`}>
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${index < currentIndex ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---
function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams?.get("planId") ?? null;

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isFree, setIsFree] = useState(false); // Detect from plan data
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("choose-type");
  const [isNewTenant, setIsNewTenant] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    instituteName: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Fetch plan details
  useEffect(() => {
    if (!planId) {
      router.push("/subscription/plans");
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/subscription/plans/${planId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Plan fetched:", data.plan); // Debug log
          setPlan(data.plan);
          // Detect if plan is free (price = 0)
          const isFreeValue = data.plan.price === 0 || data.plan.isFree === true;
          console.log("isFree set to:", isFreeValue); // Debug log
          setIsFree(isFreeValue);
        } else {
          toast.error("Plan not found");
          router.push("/subscription/plans");
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error); // Debug log
        toast.error("Failed to fetch plan");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Initialize Cashfree SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --- Handlers ---

  const handleSendOtp = async () => {
    if (!formData.email || !formData.name || !formData.instituteName || !formData.phone) {
      toast.error("Please fill all fields");
      return;
    }

    // For free plans, password is required
    if (isFree && !formData.password) {
      toast.error("Please create a password");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      // First check if email is already registered
      const checkRes = await fetch("/api/email/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.exists) {
          toast.error("This email is already registered. Please login instead.");
          setIsNewTenant(false);
          setStep("login");
          setIsSubmitting(false);
          return;
        }
      }

      // Send OTP
      const res = await fetch("/api/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          purpose: "subscription-verification",
          name: formData.name,
        }),
      });

      if (res.ok) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
        setResendTimer(60);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          purpose: "subscription-verification",
        }),
      });

      if (res.ok) {
        toast.success("Email verified successfully");
        const verifiedEmailValue = formData.email;
        setVerifiedEmail(verifiedEmailValue);
        
        // For free plans, skip payment and directly create account
        console.log("OTP verified. isFree:", isFree); // Debug log
        if (isFree) {
          console.log("Free plan detected - skipping payment"); // Debug log
          setStep("processing");
          setIsSubmitting(false);
          handleFreeAccountCreation(verifiedEmailValue);
        } else {
          console.log("Paid plan detected - showing payment"); // Debug log
          setStep("payment");
          setIsSubmitting(false);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid OTP");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Failed to verify OTP");
      setIsSubmitting(false);
    }
  };

  const handleFreeAccountCreation = async (email: string) => {
    if (!plan || !formData.password) return;

    try {
      // Create account for free plan without payment
      const payload = {
        name: formData.name,
        instituteName: formData.instituteName,
        email: email,
        phone: formData.phone,
        password: formData.password,
        planId: planId,
        isTrial: true, // Treat free plans as trial
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      // Store token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Account created successfully! Please login to continue.");
      
      // Redirect to login page for free plan signup
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Account creation failed");
      setStep("verify-otp");
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/email/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          purpose: "subscription-verification",
        }),
      });

      if (res.ok) {
        toast.success("OTP resent");
        setResendTimer(60);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful");
        setVerifiedEmail(formData.email);
        setTenantId(data.tenant?._id || data.tenantId);
        setFormData(prev => ({
          ...prev,
          name: data.tenant?.adminName || data.user?.name || prev.name,
          instituteName: data.tenant?.instituteName || prev.instituteName,
          phone: data.tenant?.phone || data.user?.phone || prev.phone,
        }));
        setStep("payment");
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!plan || !verifiedEmail) return;

    setIsSubmitting(true);
    setStep("processing");

    try {
      // Initiate payment
      const payload = {
        planId: plan._id,
        name: formData.name,
        instituteName: formData.instituteName,
        email: verifiedEmail,
        phone: formData.phone,
        isNewTenant,
        tenantId: tenantId || undefined,
      };

      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // Check if this is a free plan
      if (data.isFree) {
        toast.success("Plan activated! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
        return;
      }

      // Open Cashfree checkout for paid plans
      const cashfree = await (window as any).Cashfree({
        mode: "production",
      });

      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
      setStep("payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/subscription/plans" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Plans
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plan Summary */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                ₹{plan.price}
                <span className="text-sm font-normal text-gray-500">/{plan.billingCycle}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Up to {plan.maxStudents} students</p>
                <p>✓ Up to {plan.maxStaff} staff</p>
                {plan.features?.slice(0, 3).map((feature, i) => (
                  <p key={i}>✓ {feature}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <StepIndicator currentStep={step} isNewTenant={isNewTenant} isFree={isFree} />

              {/* Step 1: Choose Account Type */}
              {step === "choose-type" && (
                <div className="space-y-6">
                  <p className="text-center text-gray-600 mb-6">
                    Are you a new institute or an existing customer?
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setIsNewTenant(true);
                        setStep("verify-otp");
                      }}
                      className="p-6 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">New Institute</h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        Create a new account and subscribe to start using our platform
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setIsNewTenant(false);
                        setStep("login");
                      }}
                      className="p-6 border-2 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                          <Shield className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">Existing Customer</h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        Login to renew or upgrade your existing subscription
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2a: OTP Verification (New Tenant) */}
              {step === "verify-otp" && (
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      setStep("choose-type");
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: "" }));
                    }}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </button>

                  {!otpSent ? (
                    <>
                      <div className="text-center mb-6">
                        <Mail className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                        <h3 className="font-semibold text-lg">Verify Your Email</h3>
                        <p className="text-sm text-gray-500">
                          We&apos;ll send a verification code to your email
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Your Name *</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="instituteName">Institute Name *</Label>
                          <div className="relative mt-1">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="instituteName"
                              placeholder="ABC Academy"
                              value={formData.instituteName}
                              onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="9876543210"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {isFree && (
                          <div>
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleSendOtp}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending OTP...</>
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-lg">Enter Verification Code</h3>
                        <p className="text-sm text-gray-500">
                          We sent a 6-digit code to <strong>{formData.email}</strong>
                        </p>
                      </div>

                      <OtpInput
                        value={formData.otp}
                        onChange={(otp) => setFormData({ ...formData, otp })}
                        disabled={isSubmitting}
                      />

                      <div className="text-center mt-4">
                        {resendTimer > 0 ? (
                          <p className="text-sm text-gray-500">
                            Resend code in {resendTimer}s
                          </p>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            disabled={isSubmitting}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Didn&apos;t receive code? Resend
                          </button>
                        )}
                      </div>

                      <Button
                        onClick={handleVerifyOtp}
                        disabled={isSubmitting || formData.otp.length !== 6}
                        className="w-full mt-6"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                        ) : (
                          "Verify & Continue"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Step 2b: Login (Existing Tenant) */}
              {step === "login" && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep("choose-type")}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Welcome Back!</h3>
                    <p className="text-sm text-gray-500">
                      Login to your account to renew subscription
                    </p>
                  </div>

                  <div className="space-y-4 max-w-sm mx-auto">
                    <div>
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleLogin}
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...</>
                      ) : (
                        "Login & Continue"
                      )}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                      <Link href="/forgot-password" className="text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Payment - Only for PAID plans */}
              {step === "payment" && !isFree && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep(isNewTenant ? "verify-otp" : "login")}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Complete Payment</h3>
                    <p className="text-sm text-gray-500">
                      {isNewTenant
                        ? "Your account will be created after successful payment"
                        : "Your subscription will be renewed after payment"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{verifiedEmail}</span>
                      </div>
                      {formData.instituteName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Institute:</span>
                          <span className="font-medium">{formData.instituteName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing:</span>
                        <span className="font-medium capitalize">{plan.billingCycle}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">₹{plan.price}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <>Pay ₹{plan.price} <CreditCard className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Secure payment powered by Cashfree. Your payment information is encrypted and secure.
                  </p>
                </div>
              )}

              {/* Processing State */}
              {step === "processing" && (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 mx-auto animate-spin text-blue-600 mb-4" />
                  <h3 className="font-semibold text-lg">
                    {isFree ? "Creating Your Account..." : "Processing Payment..."}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isFree
                      ? "Please wait while we set up your free trial account. You will be redirected to login."
                      : "Please wait while we redirect you to the payment gateway"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Loading Fallback ---
function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}

// --- Exported Page with Suspense ---
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
