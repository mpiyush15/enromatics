"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams?.get("plan") || "trial";

  const [form, setForm] = useState({
    name: "",
    instituteName: "",
    email: "",
    password: "",
    phone: "",
    whatsappOptIn: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox differently
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Calculate password strength
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
      if (/\d/.test(value)) strength++;
      if (/[^a-zA-Z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.instituteName.trim()) {
      newErrors.instituteName = "Institute name is required";
    } else if (form.instituteName.trim().length < 2) {
      newErrors.instituteName = "Institute name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Phone validation (optional but if provided, should be valid)
    if (
      form.phone.trim() &&
      !/^\+?[1-9]\d{9,14}$/.test(form.phone.replace(/[\s()-]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Check if this is a trial/free plan
      const isTrial = planId === "trial" || planId === "free";

      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          instituteName: form.instituteName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          planId: planId,
          isTrial: isTrial,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Store token
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // Go to onboarding for all plans
        router.push("/onboarding");
      } else {
        setErrors({ submit: result.message || "Signup failed" });
      }
    } catch (err) {
      setErrors({ submit: "Unable to connect to server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const getPlanBadge = () => {
    if (planId === "trial" || planId === "free") {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                14-Day Free Trial
              </p>
              <p className="text-xs text-green-800 dark:text-green-200">
                Full access, no credit card needed
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 sm:p-10">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
              Start your journey with us today
            </p>
          </div>

          {/* Plan Badge */}
          {getPlanBadge()}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 text-center">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base`}
                placeholder="John Doe"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Institute Name Input */}
            <div>
              <label
                htmlFor="instituteName"
                className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2"
              >
                Institute Name
              </label>
              <input
                id="instituteName"
                name="instituteName"
                type="text"
                value={form.instituteName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.instituteName
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base`}
                placeholder="ABC Coaching Institute"
                disabled={loading}
              />
              {errors.instituteName && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">
                  {errors.instituteName}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base`}
                placeholder="john@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.password
                      ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base pr-12`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor()
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <p className="text-xs font-light text-gray-600 dark:text-gray-400">
                      Password strength:{" "}
                      <span className="font-medium">{getPasswordStrengthText()}</span>
                    </p>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2"
              >
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.phone
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base`}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* WhatsApp Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                id="whatsappOptIn"
                name="whatsappOptIn"
                type="checkbox"
                checked={form.whatsappOptIn}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-green-600 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 focus:ring-2 transition-all"
                disabled={loading}
              />
              <div className="flex-1">
                <label
                  htmlFor="whatsappOptIn"
                  className="text-sm font-light text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <span className="flex items-start gap-2">
                    <span className="text-green-600">📱</span>
                    <div>
                      <strong className="font-medium">
                        Receive WhatsApp Notifications
                      </strong>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Get important updates, announcements, and communications via
                        WhatsApp. You can unsubscribe anytime. We respect your privacy
                        and won't spam you.
                      </p>
                    </div>
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-light">
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="block w-full text-center py-3 px-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Sign In
          </Link>

          {/* Terms */}
          <p className="mt-6 text-xs font-light text-center text-gray-500 dark:text-gray-500">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm font-light text-gray-600 dark:text-gray-400">
          © 2025 Enromatics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
