'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Palette, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';

type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

interface BrandingData {
  instituteName: string;
  subdomain: string;
  logoUrl?: string;
  themeColor: string;
  whatsappNumber?: string;
}

export default function WhiteablOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams?.get('tenantId') || '';

  const [step, setStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [subdomainAvailable, setSubdomainAvailable] = useState(false);

  const [formData, setFormData] = useState<BrandingData>({
    instituteName: '',
    subdomain: '',
    themeColor: '#3b82f6',
    whatsappNumber: '',
  });

  // Load tenant data on mount
  useEffect(() => {
    loadTenantData();
  }, [tenantId]);

  const loadTenantData = async () => {
    try {
      if (!tenantId) {
        setError('Missing tenantId');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/tenant/branding?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to load tenant data');

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        instituteName: data.instituteName || '',
        subdomain: data.subdomain || '',
        logoUrl: data.branding?.logoUrl || '',
        themeColor: data.branding?.themeColor || '#3b82f6',
        whatsappNumber: data.branding?.whatsappNumber || '',
      }));

      setLoading(false);
    } catch (err) {
      console.error('Load tenant error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tenant data');
      setLoading(false);
    }
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainError('Subdomain must be at least 3 characters');
      setSubdomainAvailable(false);
      return;
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(subdomain.toLowerCase())) {
      setSubdomainError('Subdomain can only contain letters, numbers, and hyphens');
      setSubdomainAvailable(false);
      return;
    }

    try {
      const res = await fetch(`/api/tenant/subdomain-check?subdomain=${subdomain}`);
      if (res.ok) {
        const data = await res.json();
        if (data.available) {
          setSubdomainError(null);
          setSubdomainAvailable(true);
        } else {
          setSubdomainError('This subdomain is already taken');
          setSubdomainAvailable(false);
        }
      }
    } catch (err) {
      console.error('Subdomain check error:', err);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, subdomain: slug }));
    checkSubdomainAvailability(slug);
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err) {
      console.error('Logo upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.instituteName.trim()) {
      setError('Please enter your institute name');
      return;
    }
    if (step === 2 && (!formData.subdomain || !subdomainAvailable)) {
      setError('Please select a valid available subdomain');
      return;
    }

    setError(null);
    if (step < 6) {
      setStep((prev) => (prev + 1) as FormStep);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as FormStep);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/save-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error('Failed to save branding');
      const data = await res.json();

      // Redirect to tenant login page
      router.push(`/tenant-login?subdomain=${formData.subdomain}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save branding');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your branding setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your White-Label Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your branded portal in {6 - step + 1} steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  num <= step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Step {step} of 6
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Institute Name */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                What's your institute name?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will appear in your branded portal
              </p>
              <input
                type="text"
                placeholder="Enter your institute name"
                value={formData.instituteName}
                onChange={(e) => setFormData((prev) => ({ ...prev, instituteName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
          )}

          {/* Step 2: Subdomain */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose your portal address
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your portal will be at: <span className="font-semibold text-gray-900 dark:text-white">{formData.subdomain || 'yourschool'}.enromatics.com</span>
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g., myschool"
                  value={formData.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none ${
                    subdomainError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {subdomainError && (
                  <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {subdomainError}
                  </p>
                )}
                {subdomainAvailable && (
                  <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    This subdomain is available!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Logo Upload */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upload your logo
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will appear in your branded login page
              </p>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) {
                    handleLogoUpload(file);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploadingLogo}
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-900 dark:text-white font-semibold">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>
              {formData.logoUrl && (
                <div className="mt-4">
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="h-24 mx-auto rounded-lg"
                  />
                  <p className="text-center text-green-600 dark:text-green-400 text-sm mt-2">
                    ✓ Logo uploaded
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Theme Color */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose your brand color
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This color will be used across your portal
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, themeColor: e.target.value }))}
                  className="w-24 h-24 rounded-lg cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected color:</p>
                  <div
                    className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: formData.themeColor }}
                  />
                  <p className="text-gray-900 dark:text-white font-mono text-sm mt-2">
                    {formData.themeColor.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: WhatsApp */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                WhatsApp contact (optional)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add a WhatsApp number for student support
              </p>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <input
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Review your setup
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Institute Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.instituteName}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Portal Address</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.subdomain}.enromatics.com
                  </p>
                </div>
                {formData.logoUrl && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Logo</p>
                    <img src={formData.logoUrl} alt="Logo" className="h-12 rounded" />
                  </div>
                )}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Brand Color</p>
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: formData.themeColor }}
                  />
                </div>
                {formData.whatsappNumber && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formData.whatsappNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {step === 6 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
