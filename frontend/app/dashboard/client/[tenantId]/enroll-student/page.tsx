"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { X, Check, AlertCircle, Upload } from "lucide-react";

/**
 * 🎨 ENROLL STUDENT - CLEAN MINIMAL FORM (TailAdmin Style)
 * 
 * Design Philosophy:
 * - Clean white cards
 * - Minimal color usage
 * - Large inputs with proper spacing
 * - Single column focus
 * - Clear call-to-action buttons
 * - Proper error states
 */
export default function EnrollStudentPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const tenantId = (params?.tenantId as string) || '';
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    batch: "",
    rollNumber: "",
    dateOfBirth: "",
    gender: "male",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const batches = [
    { id: "jee-a", name: "JEE Mains - Batch A" },
    { id: "jee-b", name: "JEE Mains - Batch B" },
    { id: "neet", name: "NEET Biology" },
    { id: "cbse-12", name: "CBSE Class 12" },
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
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.batch) newErrors.batch = "Batch selection is required";
    if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required";
    if (!formData.parentPhone.trim()) newErrors.parentPhone = "Parent phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
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
          parentName: "",
          parentPhone: "",
          batch: "",
          rollNumber: "",
          dateOfBirth: "",
          gender: "male",
        });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      
      {/* HEADER */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enroll New Student</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add a new student to your institute</p>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {submitted && (
        <div className="fixed top-6 right-6 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3 max-w-md animate-fade-in-out">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">✓ Student Enrolled Successfully!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">{formData.firstName} {formData.lastName} has been added to {formData.batch}</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* FORM CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8">
          
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SECTION: PERSONAL INFORMATION */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Name */}
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

                {/* Last Name */}
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

                {/* Email */}
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

                {/* Phone */}
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

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: ACADEMIC INFORMATION */}
            <div className="pt-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Batch Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Batch *
                  </label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none transition-all ${
                      errors.batch
                        ? "border-red-500 dark:border-red-400 focus:border-red-600"
                        : "border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    }`}
                  >
                    <option value="">Select a batch...</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                  {errors.batch && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.batch}</p>
                  )}
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. JEE-2024-001"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: PARENT INFORMATION */}
            <div className="pt-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Parent/Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Parent Name */}
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

                {/* Parent Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Parent Phone Number *
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
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Enroll Student
                  </>
                )}
              </button>
              <button
                type="reset"
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all"
                onClick={() => setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  parentName: "",
                  parentPhone: "",
                  batch: "",
                  rollNumber: "",
                  dateOfBirth: "",
                  gender: "male",
                })}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* INFO BOX */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">ℹ️ Enrollment Information</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">Fields marked with * are required. Student data will be synced across all connected systems automatically.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
