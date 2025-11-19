"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Award, CheckCircle, AlertCircle, User, Mail, Phone, FileText } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface ExamData {
  _id: string;
  examName: string;
  examCode: string;
  description: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examDate: string;
  examDates: string[];
  resultDate: string;
  examDuration: number;
  totalMarks: number;
  passingMarks: number;
  examMode: "online" | "offline" | "hybrid";
  venue: string;
  registrationFee: {
    amount: number;
    paymentRequired: boolean;
  };
  eligibilityCriteria: {
    minAge: number;
    maxAge: number;
    eligibleClasses: string[];
    qualification: string;
  };
  landingPage: {
    heroTitle: string;
    heroSubtitle: string;
    aboutExam: string;
    syllabus: string;
    importantDates: string;
    primaryColor: string;
    secondaryColor: string;
  };
  rewards: Array<{
    rankFrom: number;
    rankTo: number;
    rewardType: string;
    rewardValue: number;
    description: string;
  }>;
  formFields: {
    collectPhoto: boolean;
    collectAadhar: boolean;
    collectPreviousMarks: boolean;
    customFields: Array<{
      fieldName: string;
      fieldType: string;
      required: boolean;
      options: string[];
    }>;
  };
  status: string;
  stats: {
    totalRegistrations: number;
  };
}

export default function ExamRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const examCode = params.examCode as string;

  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");

  // Form states
  const [selectedExamDate, setSelectedExamDate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [currentClass, setCurrentClass] = useState("");
  const [school, setSchool] = useState("");
  const [address, setAddress] = useState("");
  const [previousMarks, setPreviousMarks] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchExamData();
  }, [examCode]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching exam data for code:", examCode);
      
      const response = await fetch(`${API_URL}/api/scholarship-exams/public/${examCode}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Exam not found");
      }

      const data = await response.json();
      console.log("✅ Exam data fetched:", data);
      setExam(data.exam);
      
      // Set first available exam date as default
      if (data.exam.examDates && data.exam.examDates.length > 0) {
        setSelectedExamDate(data.exam.examDates[0]);
      }
    } catch (error) {
      console.error("❌ Error fetching exam data:", error);
      alert("Exam not found or registration is closed");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exam) return;
    
    // Check registration period only if dates are set
    if (exam.registrationStartDate && exam.registrationEndDate) {
      const now = new Date();
      const regStart = new Date(exam.registrationStartDate);
      const regEnd = new Date(exam.registrationEndDate);
      
      if (now < regStart) {
        alert("Registration has not started yet");
        return;
      }
      
      if (now > regEnd) {
        alert("Registration period has ended");
        return;
      }
    }

    // Age validation
    const birthDate = new Date(dateOfBirth);
    const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (age < exam.eligibilityCriteria.minAge || age > exam.eligibilityCriteria.maxAge) {
      alert(`Age must be between ${exam.eligibilityCriteria.minAge} and ${exam.eligibilityCriteria.maxAge} years`);
      return;
    }

    setSubmitting(true);

    try {
      const registrationData = {
        examId: exam._id,
        examCode: exam.examCode,
        selectedExamDate,
        studentName,
        email,
        phone,
        dateOfBirth,
        gender,
        fatherName,
        motherName,
        parentPhone,
        currentClass,
        school,
        address,
        previousMarks: exam.formFields.collectPreviousMarks ? previousMarks : undefined,
        customFields: customFieldValues,
      };

      console.log("🚀 Submitting registration:", registrationData);

      const response = await fetch(`${API_URL}/api/scholarship-exams/public/${examCode}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      console.log("✅ Registration successful:", data);
      
      setRegistrationNumber(data.registration.registrationNumber);
      setRegistrationComplete(true);
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isRegistrationOpen = () => {
    if (!exam) return false;
    
    // If no registration dates are set, allow registration
    if (!exam.registrationStartDate || !exam.registrationEndDate) {
      return true;
    }
    
    const now = new Date();
    const regStart = new Date(exam.registrationStartDate);
    const regEnd = new Date(exam.registrationEndDate);
    
    // Allow registration if we're within the period
    return now >= regStart && now <= regEnd;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Found</h1>
          <p className="text-gray-600">The exam you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
            <p className="text-gray-600">Your registration has been submitted successfully.</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700 mb-2">Your Registration Number:</p>
            <p className="text-2xl font-bold text-green-800 font-mono">{registrationNumber}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p><strong>Exam:</strong> {exam.examName}</p>
            <p><strong>Date:</strong> {formatDate(selectedExamDate)}</p>
            <p><strong>Duration:</strong> {exam.examDuration} minutes</p>
            {exam.venue && <p><strong>Venue:</strong> {exam.venue}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Important:</strong> Please save your registration number. You'll need it to check your results.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/results")}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Award size={20} />
              Check Results Portal
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <User size={20} />
              Student Login
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${exam.landingPage.primaryColor}10 0%, ${exam.landingPage.secondaryColor}10 100%)`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Top Action Buttons */}
        <div className="flex justify-end mb-6 gap-3">
          <button
            onClick={() => router.push("/results")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Award size={16} />
            Check Results
          </button>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <User size={16} />
            Student Login
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {exam.landingPage.heroTitle || exam.examName}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {exam.landingPage.heroSubtitle}
          </p>
          <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
            <span>Exam Code:</span>
            <span className="font-mono font-bold text-blue-600">{exam.examCode}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exam Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-600 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Exam Dates</p>
                    {exam.examDates.map((date, idx) => (
                      <p key={idx} className="text-sm text-gray-600">{formatDate(date)}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-green-600 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">{exam.examDuration} minutes</p>
                  </div>
                </div>

                {exam.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-red-600 mt-1" size={18} />
                    <div>
                      <p className="font-medium text-gray-900">Venue</p>
                      <p className="text-sm text-gray-600">{exam.venue}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="text-purple-600 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Registrations</p>
                    <p className="text-sm text-gray-600">{exam.stats?.totalRegistrations || 0} students</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-gray-900 mb-2">Registration Status</p>
                  {exam.registrationStartDate && exam.registrationEndDate ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(exam.registrationStartDate)} - {formatDate(exam.registrationEndDate)}
                      </p>
                      {isRegistrationOpen() ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={16} />
                            <p className="text-sm text-green-700 font-medium">Registration Open</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="text-red-600" size={16} />
                            <p className="text-sm text-red-700 font-medium">Registration Closed</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        <p className="text-sm text-green-700 font-medium">Registration Open</p>
                      </div>
                      <p className="text-xs text-green-600 mt-1">No deadline set</p>
                    </div>
                  )}
                </div>

                {exam.registrationFee.paymentRequired && (
                  <div className="border-t pt-4">
                    <p className="font-medium text-gray-900">Registration Fee</p>
                    <p className="text-lg font-bold text-green-600">₹{exam.registrationFee.amount}</p>
                  </div>
                )}
              </div>

              {/* Rewards */}
              {exam.rewards && exam.rewards.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="text-yellow-600" size={18} />
                    Scholarships & Rewards
                  </h4>
                  <div className="space-y-2">
                    {exam.rewards.slice(0, 3).map((reward, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium text-purple-600">
                          Rank {reward.rankFrom}
                          {reward.rankTo > reward.rankFrom && `-${reward.rankTo}`}:
                        </span>
                        <span className="ml-2 text-gray-700">{reward.description}</span>
                      </div>
                    ))}
                    {exam.rewards.length > 3 && (
                      <p className="text-xs text-gray-500">+{exam.rewards.length - 3} more rewards</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Register for Exam</h2>
                <p className="text-gray-600 mt-1">Fill in your details to register for the scholarship exam</p>
              </div>

              {!isRegistrationOpen() && exam.registrationStartDate && exam.registrationEndDate ? (
                <div className="p-6">
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Closed</h3>
                    <p className="text-gray-600">
                      The registration period for this exam has ended. Please check back for future exams.
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <button
                        onClick={() => router.push("/results")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Award size={16} />
                        Check Results
                      </button>
                      <button
                        onClick={() => router.push("/login")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <User size={16} />
                        Student Login
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Exam Date Selection */}
                  {exam.examDates.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Exam Date *
                      </label>
                      <select
                        value={selectedExamDate}
                        onChange={(e) => setSelectedExamDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {exam.examDates.map((date, idx) => (
                          <option key={idx} value={date}>
                            {formatDate(date)} - {formatTime(date)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="text-blue-600" size={20} />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Class *
                        </label>
                        <input
                          type="text"
                          value={currentClass}
                          onChange={(e) => setCurrentClass(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Class 10, Class 12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Mail className="text-green-600" size={20} />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="text-purple-600" size={20} />
                      Parent Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Father's Name *
                        </label>
                        <input
                          type="text"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mother's Name *
                        </label>
                        <input
                          type="text"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent Phone *
                        </label>
                        <input
                          type="tel"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          School Name *
                        </label>
                        <input
                          type="text"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Complete address with city and pincode"
                    />
                  </div>

                  {/* Previous Academic Performance */}
                  {exam.formFields.collectPreviousMarks && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="text-orange-600" size={20} />
                        Academic Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Previous Class Marks/Percentage
                        </label>
                        <input
                          type="text"
                          value={previousMarks}
                          onChange={(e) => setPreviousMarks(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 85% or 425/500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {exam.formFields.customFields && exam.formFields.customFields.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                      <div className="space-y-4">
                        {exam.formFields.customFields.map((field, idx) => (
                          <div key={idx}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.fieldName} {field.required && "*"}
                            </label>
                            {field.fieldType === "textarea" ? (
                              <textarea
                                value={customFieldValues[field.fieldName] || ""}
                                onChange={(e) => setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.fieldName]: e.target.value
                                })}
                                required={field.required}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : field.fieldType === "select" ? (
                              <select
                                value={customFieldValues[field.fieldName] || ""}
                                onChange={(e) => setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.fieldName]: e.target.value
                                })}
                                required={field.required}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select option</option>
                                {field.options.map((option, optIdx) => (
                                  <option key={optIdx} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.fieldType}
                                value={customFieldValues[field.fieldName] || ""}
                                onChange={(e) => setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.fieldName]: e.target.value
                                })}
                                required={field.required}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      By submitting this registration, you agree to the terms and conditions of the scholarship exam.
                      All information provided should be accurate and complete.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Register for Exam
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}