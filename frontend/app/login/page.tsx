"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/lib/authService";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(form.email, form.password);
      
      setErrors({ success: "✅ Welcome back! Redirecting..." });

      // Redirect based on role
      setTimeout(() => {
        if (response.user.role === "SuperAdmin") {
          router.push("/dashboard/home");
        } else if (response.user.role === "tenantAdmin") {
          router.push(`/dashboard/client/${response.user.tenantId}`);
        } else {
          router.push("/dashboard");
        }
      }, 800);

    } catch (err: any) {
      setErrors({ submit: err.message || "Invalid email or password" });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Image - Hidden on mobile */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        <Image
          src="https://ik.imagekit.io/qitfmo5b1q/Login.1?updatedAt=1747978837528"
          alt="Enro Matics Dashboard"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
          <h2 className="text-4xl font-light mb-4">Welcome back</h2>
          <p className="text-lg font-light text-white/90">
            Sign in to access your dashboard and manage your business operations
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
              Sign in to Enromatics
            </h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
              Access your business dashboard
            </p>
          </div>

          {/* Success Message */}
          {errors.success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 text-center">
                {errors.success}
              </p>
            </div>
          )}

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
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
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
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base`}
                placeholder="john@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {/* Forgot password link removed to prevent 404 error */}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-light text-base pr-12`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-light text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm font-light text-gray-700 dark:text-gray-300">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
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
                <span className="px-4 bg-slate-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-light">
                  Don't have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="block w-full text-center py-3 px-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Create Account
          </Link>

          {/* Student Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/student/login"
              className="text-sm font-light text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Student Login
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs font-light text-gray-500 dark:text-gray-500">
            © 2025 Enromatics. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
