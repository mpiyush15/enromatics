"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";

/**
 * 🎨 ENROLL STUDENT - MULTI-STEP WIZARD FORM
 * 
 * Design Philosophy:
 * - Step-by-step approach (not all fields at once)
 * - Clear progress indication
 * - Clean white cards
 * - Large inputs with proper spacing
 * - Single column focus
 * - Proper error states
 */
export default function EnrollStudentWizardPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tenantId = (user?.tenantId as string) || '';
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    parentName: "",
    parentPhone: "",
    batch: "",
    rollNumber: "",
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const batches = [
    { id: "jee-a", name: "JEE Mains - Batch A" },
    { id: "jee-b", name: "JEE Mains - Batch B" },
    { id: "neet", name: "NEET Biology" },
    { id: "cbse-12", name: "CBSE Class 12" },
  ];

  const steps = [
    { id: 1, title: "Personal Information", icon: "👤" },
    { id: 2, title: "Contact Details", icon: "📱" },
    { id: 3, title: "Parent Information", icon: "👨‍👩‍👧" },
    { id: 4, title: "Academic Details", icon: "🎓" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        break;

      case 2: // Contact Details
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (formData.email && !formData.email.includes("@")) newErrors.email = "Valid email is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
          newErrors.phone = "Valid phone number is required";
        }
        break;

      case 3: // Parent Information
        if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required";
        if (!formData.parentPhone.trim()) newErrors.parentPhone = "Parent phone is required";
        if (formData.parentPhone && formData.parentPhone.replace(/\D/g, "").length < 10) {
          newErrors.parentPhone = "Valid phone number is required";
        }
        break;

      case 4: // Academic Details
        if (!formData.batch) newErrors.batch = "Batch selection is required";
        if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "male",
          parentName: "",
          parentPhone: "",
          batch: "",
          rollNumber: "",
        });
        setCurrentStep(1);
        setCompletedSteps([]);
      }, 3000);
    }, 1000);
  };

  // Render based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="e.g. Raj"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.firstName
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="e.g. Kumar"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.lastName
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all focus:outline-none ${
                  errors.dateOfBirth
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all focus:outline-none ${
                  errors.gender
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.gender}</p>
              )}
            </div>
          </div>
        );

      case 2: // Contact Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="raj.kumar@example.com"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.email
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.phone
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.phone && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.phone}</p>
              )}
            </div>
          </div>
        );

      case 3: // Parent Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Parent/Guardian Name *
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                placeholder="e.g. Ramesh Kumar"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.parentName
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.parentName && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.parentName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Parent Contact Number *
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.parentPhone
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.parentPhone && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.parentPhone}</p>
              )}
            </div>
          </div>
        );

      case 4: // Academic Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Batch *
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all focus:outline-none ${
                  errors.batch
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              >
                <option value="">Choose a batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
              {errors.batch && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.batch}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                placeholder="e.g. A001"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
                  errors.rollNumber
                    ? "border-red-500 dark:border-red-400 focus:border-red-600"
                    : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                }`}
              />
              {errors.rollNumber && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.rollNumber}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* SUCCESS NOTIFICATION */}
      {submitted && (
        <div className="fixed top-6 right-6 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3 max-w-md animate-fade-in-out">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">✓ Student Enrolled Successfully!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">{formData.firstName} {formData.lastName} has been added to {formData.batch}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enroll New Student</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Step {currentStep} of {totalSteps}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* STEP INDICATOR */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => {
                  if (completedSteps.includes(step.id) || step.id <= currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={!completedSteps.includes(step.id) && step.id > currentStep}
                className={`flex flex-col items-center group cursor-pointer transition-all ${
                  completedSteps.includes(step.id) || step.id === currentStep
                    ? "opacity-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-all ${
                    step.id === currentStep
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : completedSteps.includes(step.id)
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {completedSteps.includes(step.id) ? <Check size={20} /> : step.id}
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center whitespace-nowrap max-w-[80px]">
                  {step.title}
                </p>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Title & Description */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{steps[currentStep - 1].icon}</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {steps[currentStep - 1].title}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep === 1 && "Tell us about the student"}
                {currentStep === 2 && "Provide contact information"}
                {currentStep === 3 && "Parent/Guardian details"}
                {currentStep === 4 && "Academic information"}
              </p>
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all ml-auto"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
                >
                  {isLoading ? "Submitting..." : "Complete Enrollment"}
                  <Check size={18} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
