"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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
  const [loadingRegistration, setLoadingRegistration] = useState(false);
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

  useEffect(() => {
    fetchBatches();
    if (regId && fromScholarship) {
      fetchRegistrationData();
    }
  }, [regId, fromScholarship]);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`/api/academics/batches`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Filter only active batches
        const activeBatches = data.batches.filter((b: Batch) => b.status === "active");
        setBatches(activeBatches);
      }
      setLoadingBatches(false);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setLoadingBatches(false);
    }
  };

  const fetchRegistrationData = async () => {
    if (!regId) return;
    
    try {
      setLoadingRegistration(true);
      
      // Get examId from URL parameters (if coming from scholarship registration)
      const examId = searchParams.get('examId');
      if (!examId) {
        setStatus("❌ Missing exam information");
        return;
      }
      
      // Fetch all registrations for the exam and find the specific one
      const res = await fetch(`/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        const registration = data.registrations?.find((r: any) => r._id === regId);
        
        if (registration) {
          // Pre-fill form with registration data
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          name: form.studentName, // Map studentName to name for backend
          gender: form.gender.charAt(0).toUpperCase() + form.gender.slice(1), // Capitalize gender
          fees: form.fees ? parseFloat(form.fees) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add student");

      setStatus("✅ Student added successfully!");
      
      // If password was auto-generated, show it
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      }
      
      setTimeout(() => router.push(`/dashboard/client/${tenantId}/students`), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
              <p className="text-gray-600 dark:text-gray-400">
                {fromScholarship 
                  ? "Convert scholarship exam registration to full student admission"
                  : "Fill in the details to enroll a new student"
                }
              </p>
              {fromScholarship && loadingRegistration && (
                <div className="mt-2 flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Loading registration data...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Personal Information
            </h2>
            
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
                  required
                />
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
                  required
                />
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
          </div>

          {/* Guardian Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">👨‍👩‍👧</span>
              Guardian / Parent Information
            </h2>
            
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
                />
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

              <div>
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
          </div>

          {/* Academic Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Academic Information
            </h2>
            
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
                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g., JEE Main, NEET, Class 12"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Batch *
                </label>
                {loadingBatches ? (
                  <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-gray-500">
                    Loading batches...
                  </div>
                ) : batches.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-xl dark:bg-gray-800 text-red-600">
                    No active batches available. Please create a batch first.
                  </div>
                ) : (
                  <select
                    name="batchId"
                    value={form.batchId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                )}
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

              <div>
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
          </div>

          {/* Submit Button */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <button
              type="submit"
              disabled={submitting || batches.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Student...
                </>
              ) : (
                <>
                  <span>🎓</span>
                  Enroll Student
                </>
              )}
            </button>
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
