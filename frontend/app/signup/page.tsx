'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { subscriptionPlans } from '@/data/plans';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams?.get('plan') || 'trial';
  
  const [step, setStep] = useState<'form' | 'otp' | 'verify'>('form'); // form -> otp -> verify
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    instituteName: '',
  });
  
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(planId);
  const [otpTimer, setOtpTimer] = useState(0);

  // Get plan details
  const plan = subscriptionPlans.find(p => p.id === selectedPlan);

  useEffect(() => {
    setSelectedPlan(planId);
  }, [planId]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.instituteName) newErrors.instituteName = 'Institute name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('� Sending OTP to email:', formData.email);
      
      // Send OTP to email
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'signup'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.message || 'Failed to send OTP' });
        return;
      }

      setOtpSent(true);
      setStep('otp');
      setOtpTimer(300); // 5 minutes
      setErrors({});
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const response = await fetch('/api/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
          purpose: 'signup'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.message || 'Invalid OTP' });
        return;
      }

      // OTP verified, proceed with signup
      setStep('verify');
      setErrors({});
      
      // Auto-proceed to signup after 2 seconds
      setTimeout(() => {
        handleFinalSignup();
      }, 2000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'OTP verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignup = async () => {
    setLoading(true);
    try {
      console.log('📝 Starting final signup with data:', { email: formData.email, planId: selectedPlan });
      
      // Create a fetch controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Call signup API with trial plan
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          instituteName: formData.instituteName,
          planId: selectedPlan,
          isTrial: true,
          otpVerified: true, // Mark as OTP verified
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('📡 Signup response status:', response.status);
      
      const data = await response.json();
      
      console.log('📦 Signup response data:', data);

      if (!response.ok) {
        console.error('❌ Signup failed:', data.message);
        setErrors({ submit: data.message || 'Signup failed' });
        setStep('verify');
        return;
      }

      // Store token
      if (data.token) {
        console.log('✅ Token received, storing...');
        localStorage.setItem('token', data.token);
      }

      // Redirect to onboarding
      console.log('🚀 Redirecting to /onboarding...');
      router.push('/onboarding');
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      if (error.name === 'AbortError') {
        setErrors({ submit: 'Request timeout. Please try again.' });
      } else {
        setErrors({ submit: error.message || 'An error occurred' });
      }
      setStep('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev: any) => {
      if (prev[name]) {
        return { ...prev, [name]: '' };
      }
      return prev;
    });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (errors.otp) {
      setErrors((prev: any) => ({ ...prev, otp: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Trial Info & Plan Selection */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Start Your 14-Day Free Trial
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No credit card required. Full access to all features.
              </p>
            </div>

            {/* Plan Selection Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">SELECTED PLAN</h3>
              {plan && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                  
                  {/* Plan Features Grid */}
                  <div className="space-y-2">
                    {plan.quotas && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Students:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {typeof plan.quotas.students === 'number' ? `Up to ${plan.quotas.students}` : plan.quotas.students}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {plan.quotas.storage}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 dark:text-gray-400">Trial Duration:</span>
                          <span className="font-semibold text-green-600">14 Days Free</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Change Plan Link */}
                  {step === 'form' && (
                    <Link
                      href="/plans"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-4 block"
                    >
                      ← Change plan
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">What you get:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> Full access to {plan?.name} plan
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> 14 days to explore all features
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> No credit card required
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500">✓</span> Email verified & secure
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Signup Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
            {/* Step 1: Form */}
            {step === 'form' && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 1: Create Account</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter your details below</p>
                </div>

                {/* Institute Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Institute/Coaching Name
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Coaching Classes"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.instituteName
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } dark:text-white`}
                  />
                  {errors.instituteName && (
                    <p className="text-red-500 text-xs mt-1">{errors.instituteName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } dark:text-white`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.password
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } dark:text-white`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.confirmPassword
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } dark:text-white`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Sending OTP...' : '→ Continue (Verify Email)'}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                </p>

                {/* Login Link */}
                <div className="text-center pt-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                      Log in
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 2: Verify Email</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    We've sent a 6-digit code to <br />
                    <span className="font-semibold text-gray-900 dark:text-white">{formData.email}</span>
                  </p>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    placeholder="000000"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono ${
                      errors.otp
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } dark:text-white`}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                  )}
                  {errors.submit && (
                    <p className="text-red-500 text-xs mt-1">{errors.submit}</p>
                  )}
                </div>

                {/* Timer */}
                {otpTimer > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code expires in <span className="font-semibold">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                    </p>
                  </div>
                )}

                {/* Resend OTP */}
                {otpTimer === 0 && otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full text-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold"
                  >
                    Resend OTP
                  </button>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Verifying...' : '✓ Verify & Continue'}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setOtp('');
                    setOtpTimer(0);
                  }}
                  className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-semibold pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  ← Back
                </button>
              </form>
            )}

            {/* Step 3: Creating Account */}
            {step === 'verify' && (
              <div className="space-y-6 text-center py-12">
                {errors.submit ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <span className="text-3xl">✕</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        Signup Failed
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {errors.submit}
                      </p>
                    </div>
                    <button
                      onClick={() => { setStep('form'); setErrors({}); }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Back to Form
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-3xl">✓</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Email Verified!
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Creating your account and setting up trial access...
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
