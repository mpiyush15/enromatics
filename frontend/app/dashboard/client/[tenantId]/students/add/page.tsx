"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { StudentFormData, StudentMutationResponse } from "@/types/student";

interface Batch {
  _id: string;
  name: string;
  status: string;
}

export default function AddStudentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  
  const tenantId = (params?.tenantId as string) || '';
  const regId = searchParams.get('regId');
  const fromScholarship = searchParams.get('from') === 'scholarship';
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    studentName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    currentClass: "",
    school: "",
    address: "",
    previousMarks: "",
    course: "",
    batchId: "",
    fees: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 1, title: "Personal Information", icon: "👤" },
    { id: 2, title: "Guardian Details", icon: "👨‍👩‍👧" },
    { id: 3, title: "Academic Information", icon: "📚" },
    { id: 4, title: "Review & Submit", icon: "✅" },
  ];

  useEffect(() => {
    fetchBatches();
    fetchCourses();
    if (regId && fromScholarship) {
      fetchRegistrationData();
    }
  }, [regId, fromScholarship]);

  const fetchBatches = async () => {
    try {
      // Fetch all batches
      const res = await fetch(`/api/academics/batches`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const activeBatches = data.batches.filter((b: Batch) => b.status === "active");
        setBatches(activeBatches);
        setFilteredBatches(activeBatches);
      }
      setLoadingBatches(false);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setLoadingBatches(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/academics/courses?tenantId=${tenantId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success || Array.isArray(data.data)) {
        setCourses(Array.isArray(data.data) ? data.data : data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchRegistrationData = async () => {
    if (!regId) return;
    
    try {
      setLoadingRegistration(true);
      const examId = searchParams.get('examId');
      if (!examId) {
        setStatus("❌ Missing exam information");
        return;
      }
      
      const res = await fetch(`/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        const registration = data.registrations?.find((r: any) => r._id === regId);
        
        if (registration) {
          setForm(prev => ({
            ...prev,
            studentName: registration.studentName || "",
            email: registration.email || "",
            phone: registration.phone || "",
            dateOfBirth: registration.dateOfBirth ? registration.dateOfBirth.split('T')[0] : "",
            gender: registration.gender ? registration.gender.toLowerCase() : "",
            fatherName: registration.fatherName || "",
            motherName: registration.motherName || "",
            parentPhone: registration.parentPhone || "",
            currentClass: registration.currentClass || "",
            school: registration.school || "",
            address: typeof registration.address === 'string' 
              ? registration.address 
              : `${registration.address?.street || ""}, ${registration.address?.city || ""}, ${registration.address?.state || ""} ${registration.address?.zipCode || ""}`.trim(),
            previousMarks: registration.previousMarks || "",
          }));
          
          setStatus("✅ Pre-filled with scholarship registration data");
        } else {
          setStatus("❌ Registration not found");
        }
      }
    } catch (error) {
      console.error("Error fetching registration data:", error);
      setStatus("❌ Could not load registration data");
    } finally {
      setLoadingRegistration(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (stepErrors[name]) {
      setStepErrors(prev => ({ ...prev, [name]: "" }));
    }

    // When course is selected, filter batches for that course
    if (name === "course" && value) {
      const selectedCourse = courses.find((c: any) => c._id === value);
      if (selectedCourse) {
        console.log(`[FORM] Course selected: ${selectedCourse.name} (ID: ${selectedCourse._id})`);
        // Filter batches that have this courseId
        // Note: courseId can be either a string (if not populated) or an object with _id (if populated)
        const batchesForCourse = batches.filter((b: any) => {
          const batchCourseId = typeof b.courseId === 'object' ? b.courseId?._id : b.courseId;
          return batchCourseId && batchCourseId === value;
        });
        console.log(`[FORM] Found ${batchesForCourse.length} batches for this course`);
        setFilteredBatches(batchesForCourse);
        setForm(prev => ({ ...prev, batchId: "" })); // Reset batch selection
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!form.studentName.trim()) errors.studentName = "Full name is required";
        if (!form.email.trim()) errors.email = "Email is required";
        if (form.email && !form.email.includes("@")) errors.email = "Valid email is required";
        break;
      case 2:
        if (!form.fatherName.trim() && !form.motherName.trim()) {
          errors.fatherName = "At least one parent name is required";
        }
        break;
      case 3:
        if (!form.course.trim()) errors.course = "Course is required";
        if (!form.batchId) errors.batchId = "Batch selection is required";
        break;
      case 4:
        if (!form.studentName || !form.email || !form.course || !form.batchId) {
          errors.submit = "Please fill all required fields";
        }
        break;
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setSubmitting(true);
    setStatus("Adding student...");

    try {
      const res = await fetch(`/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          name: form.studentName,
          gender: form.gender.charAt(0).toUpperCase() + form.gender.slice(1),
          fees: form.fees ? parseFloat(form.fees) : 0,
        }),
      });

      const data: StudentMutationResponse = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add student");

      setStatus("✅ Student added successfully!");
      
      if (data.newPassword) {
        setGeneratedPassword(data.newPassword);
      }
      
      // 🔄 Trigger refresh signal for other pages
      localStorage.setItem('studentsRefreshNeeded', Date.now().toString());
      localStorage.setItem('batchesRefreshNeeded', Date.now().toString());
      window.dispatchEvent(new CustomEvent('studentAdded', { detail: { batchId: form.batchId } }));
      
      setTimeout(() => router.push(`/dashboard/client/${tenantId}/students`), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Enter student's full name"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition ${
                  stepErrors.studentName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                required
              />
              {stepErrors.studentName && <p className="text-red-600 text-xs mt-1">{stepErrors.studentName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition ${
                  stepErrors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                required
              />
              {stepErrors.email && <p className="text-red-600 text-xs mt-1">{stepErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Father's Name
              </label>
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                placeholder="Father's name"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition ${
                  stepErrors.fatherName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {stepErrors.fatherName && <p className="text-red-600 text-xs mt-1">{stepErrors.fatherName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mother's Name
              </label>
              <input
                name="motherName"
                value={form.motherName}
                onChange={handleChange}
                placeholder="Mother's name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Phone
              </label>
              <input
                name="parentPhone"
                type="tel"
                value={form.parentPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Class
              </label>
              <input
                name="currentClass"
                value={form.currentClass}
                onChange={handleChange}
                placeholder="e.g., Class 10, Class 12"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School Name
              </label>
              <input
                name="school"
                value={form.school}
                onChange={handleChange}
                placeholder="School/College name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Previous Academic Marks
              </label>
              <input
                name="previousMarks"
                value={form.previousMarks}
                onChange={handleChange}
                placeholder="e.g., 95% in 10th grade"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course / Program *
              </label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition ${
                  stepErrors.course ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {stepErrors.course && <p className="text-red-600 text-xs mt-1">{stepErrors.course}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Batch *
              </label>
              {loadingBatches ? (
                <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-gray-500">
                  Loading batches...
                </div>
              ) : !form.course ? (
                <div className="w-full px-4 py-3 border border-yellow-300 dark:border-yellow-600 rounded-xl dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                  📌 Select a course first to see available batches
                </div>
              ) : filteredBatches.length > 0 ? (
                <select
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition ${
                    stepErrors.batchId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                >
                  <option value="">-- Select Batch --</option>
                  {filteredBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-xl dark:bg-red-900/20 text-red-700 dark:text-red-300">
                  ❌ No batches available for selected course
                </div>
              )}
              {stepErrors.batchId && <p className="text-red-600 text-xs mt-1">{stepErrors.batchId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Fees (₹)
              </label>
              <input
                name="fees"
                type="number"
                value={form.fees}
                onChange={handleChange}
                placeholder="Enter total course fees"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave empty to auto-generate"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If empty, a secure password will be generated automatically
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">📋 Review Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Student Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{form.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{form.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Course</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{form.course}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Batch</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {batches.find(b => b._id === form.batchId)?.name || "Not selected"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {fromScholarship ? "Scholarship Student Enrollment" : "Student Admission Form"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-6">
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
                className={`flex flex-col items-center transition-all ${
                  completedSteps.includes(step.id) || step.id === currentStep
                    ? "opacity-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold mb-2 transition-all ${
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
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{steps[currentStep - 1].icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {steps[currentStep - 1].title}
                </h2>
              </div>
            </div>

            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
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
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? "Enrolling..." : "Complete Enrollment"}
                <Check size={18} />
              </button>
            )}
          </div>

          {/* Status Messages */}
          {status && (
            <div className={`rounded-2xl shadow-xl p-6 ${
              status.includes("✅") 
                ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800" 
                : "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
            }`}>
              <p className={`text-center font-medium ${
                status.includes("✅") 
                  ? "text-green-800 dark:text-green-200" 
                  : "text-red-800 dark:text-red-200"
              }`}>
                {status}
              </p>
            </div>
          )}

          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl p-8 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                    Generated Login Credentials
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Share this password with the student
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-green-300 dark:border-green-700">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Password</p>
                    <code className="text-2xl font-bold font-mono text-green-700 dark:text-green-300">
                      {generatedPassword}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      setStatus("✅ Password copied to clipboard!");
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold flex items-center gap-2"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    <strong>Important:</strong> Make sure to save this password. The student can change it after their first login.
                  </span>
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
