"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/lib/authService";

interface TenantBranding {
  instituteName: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// Helper to get cookie value
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function TenantLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tenantBranding, setTenantBranding] = useState<TenantBranding | null>(null);
  const [isTenantSubdomain, setIsTenantSubdomain] = useState(false);

  // Fetch tenant branding on mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        // Check if we're on a tenant subdomain
        const tenantContext = getCookieValue('tenant-context');
        
        console.log('🎨 Tenant context:', tenantContext);
        
        if (tenantContext) {
          setIsTenantSubdomain(true);
          
          // Fetch branding from API
          const response = await fetch(`/api/tenant/branding-by-subdomain?subdomain=${tenantContext}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Tenant branding loaded:', data.instituteName);
            setTenantBranding({
              instituteName: data.instituteName || data.name,
              logo: data.branding?.logo,
              primaryColor: data.branding?.primaryColor,
              secondaryColor: data.branding?.secondaryColor,
            });
          }
        } else {
          // If no tenant context, redirect to main login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching tenant branding:', error);
        // Continue with default branding
      }
    };

    fetchBranding();
  }, [router]);

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
      
      // Store token in both localStorage AND cookie for middleware access
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Set token as cookie for middleware
        document.cookie = `token=${response.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        
        console.log('✅ Token stored in localStorage and cookie');
      }
      
      setErrors({ success: "✅ Welcome back! Redirecting..." });

      // ✅ Route based on user role/type
      setTimeout(() => {
        // Check if it's a student (could come from Student collection)
        if (response.isStudent || response.user.role === "student") {
          router.push("/student/dashboard");
        } else if (response.user.role === "admin" || response.user.role === "tenantAdmin") {
          router.push("/dashboard/home");
        } else if (['staff', 'employee', 'teacher', 'manager', 'counsellor', 'adsManager', 'accountant', 'marketing'].includes(response.user.role)) {
          router.push("/dashboard/home");
        } else if (response.user.role === "SuperAdmin") {
          // Redirect SuperAdmin to main login
          setErrors({ submit: "Please use the main Enromatics login page" });
          setIsLoading(false);
        } else {
          // Fallback to root dashboard
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
          alt="Login"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
          <h2 className="text-4xl font-light mb-4">Welcome back</h2>
          <p className="text-lg font-light text-white/90">
            {tenantBranding?.instituteName || "Access your learning portal"}
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
            {/* Show tenant logo if available */}
            {tenantBranding?.logo ? (
              <div className="inline-flex items-center justify-center mb-4">
                <Image 
                  src={tenantBranding.logo} 
                  alt={tenantBranding.instituteName} 
                  width={80} 
                  height={80}
                  className="rounded-xl object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
            )}
            
            {/* Show tenant institute name */}
            <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
              {tenantBranding?.instituteName || "Sign in"}
            </h1>
            
            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
              Access your learning portal
            </p>
          </div>

          {/* Success Message */}
          {errors.success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-400 text-center font-medium">
                {errors.success}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-800 dark:text-red-400 text-center">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all pr-12`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="ml-2 text-sm font-light text-gray-700 dark:text-gray-300">
                  Remember me
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer with Enromatics Branding */}
          <div className="mt-8 space-y-2">
            <p className="text-center text-xs font-light text-gray-500 dark:text-gray-500">
              © 2025 {tenantBranding?.instituteName || "Learning Portal"}. All rights reserved.
            </p>
            <p className="text-center text-xs font-light text-gray-400 dark:text-gray-600">
              Powered by{" "}
              <a 
                href="https://enromatics.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Enromatics
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
