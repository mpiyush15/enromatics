"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  FileText,
  Home,
  GraduationCap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface ResultData {
  registration: {
    _id: string;
    registrationNumber: string;
    studentName: string;
    email: string;
    phone: string;
    currentClass: string;
    school: string;
    hasAttended: boolean;
    marksObtained?: number;
    percentage?: number;
    rank?: number;
    result?: "pass" | "fail" | "absent" | "pending";
    rewardEligible: boolean;
    rewardDetails?: {
      rankFrom: number;
      rankTo: number;
      rewardType: string;
      rewardValue: number;
      description: string;
    };
    enrollmentStatus: "notInterested" | "interested" | "enrolled" | "converted";
    createdAt: string;
  };
  exam: {
    _id: string;
    examName: string;
    examCode: string;
    totalMarks: number;
    passingMarks: number;
    examDate: string;
    resultsPublished: boolean;
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentSubmitting, setEnrollmentSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationNumber.trim()) {
      setError("Please enter your registration number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/scholarship-exams/public/result/${registrationNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Result not found");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching result:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch result");
    } finally {
      setLoading(false);
    }
  };

  const downloadAdmitCard = async () => {
    if (!result) return;

    try {
      const response = await fetch(`${API_URL}/api/scholarship-exams/public/admit-card/${result.registration.registrationNumber}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate admit card");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admit_card_${result.registration.registrationNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading admit card:", error);
      alert("Failed to download admit card. Please try again.");
    }
  };

  const handleEnrollmentInterest = async () => {
    if (!result) return;

    setEnrollmentSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/scholarship-exams/public/enrollment-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber: result.registration.registrationNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit enrollment interest");
      }

      setResult({
        ...result,
        registration: {
          ...result.registration,
          enrollmentStatus: "interested"
        }
      });
      
      setShowEnrollmentForm(false);
      alert("Thank you for your interest! Our admissions team will contact you soon.");
      
    } catch (error) {
      console.error("Error submitting enrollment interest:", error);
      alert("Failed to submit interest. Please try again.");
    } finally {
      setEnrollmentSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getResultBadge = () => {
    if (!result?.registration.result || result.registration.result === "pending") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full">
          <AlertCircle size={20} />
          <span className="font-semibold">Result Pending</span>
        </div>
      );
    }

    const badges = {
      pass: { bg: "bg-green-100", text: "text-green-600", label: "PASS", icon: CheckCircle },
      fail: { bg: "bg-red-100", text: "text-red-600", label: "FAIL", icon: XCircle },
      absent: { bg: "bg-gray-100", text: "text-gray-600", label: "ABSENT", icon: AlertCircle },
    };

    const badge = badges[result.registration.result];
    const Icon = badge.icon;

    return (
      <div className={`flex items-center gap-2 px-4 py-2 ${badge.bg} ${badge.text} rounded-full`}>
        <Icon size={20} />
        <span className="font-bold text-lg">{badge.label}</span>
      </div>
    );
  };

  const getEnrollmentStatusBadge = (status: string) => {
    const badges = {
      notInterested: { bg: "bg-gray-100", text: "text-gray-600", label: "Not Applied" },
      interested: { bg: "bg-blue-100", text: "text-blue-600", label: "Interest Shown" },
      enrolled: { bg: "bg-purple-100", text: "text-purple-600", label: "Enrolled" },
      converted: { bg: "bg-green-100", text: "text-green-600", label: "✓ Student" },
    };

    const badge = badges[status as keyof typeof badges] || badges.notInterested;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scholarship Exam Results</h1>
          <p className="text-xl text-gray-600">Check your exam results and scholarship eligibility</p>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Enter your registration number (e.g., EXAM250002-00001)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Check Result
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <div className="max-w-4xl mx-auto">
            {/* Student Info Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {result.registration.studentName}
                  </h2>
                  <p className="text-gray-600 mb-1">
                    Registration: <span className="font-mono font-semibold text-blue-600">{result.registration.registrationNumber}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {result.exam.examName} • {formatDate(result.registration.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {getResultBadge()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Full Name</label>
                      <p className="font-medium text-gray-900">{result.registration.studentName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Class</label>
                      <p className="font-medium text-gray-900">{result.registration.currentClass}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Mail size={14} />
                        {result.registration.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone size={14} />
                        {result.registration.phone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500">School</label>
                      <p className="font-medium text-gray-900">{result.registration.school}</p>
                    </div>
                  </div>
                </div>

                {/* Exam Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Exam Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Exam Name</label>
                      <p className="font-medium text-gray-900">{result.exam.examName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Exam Code</label>
                      <p className="font-mono font-semibold text-blue-600">{result.exam.examCode}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Exam Date</label>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(result.exam.examDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Attendance</label>
                      <p className="font-medium text-gray-900">
                        {result.registration.hasAttended ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={16} /> Attended
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1">
                            <XCircle size={16} /> Not Attended
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Download Options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={downloadAdmitCard}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <Download size={20} />
                      Download Admit Card
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Keep your admit card safe. You may need it for future reference.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Results */}
              <div className="space-y-6">
                {/* Results Card */}
                {result.registration.hasAttended && result.registration.marksObtained !== undefined && (
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp size={20} />
                      Your Results
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">
                          {result.registration.marksObtained}
                        </div>
                        <div className="text-blue-100">
                          out of {result.exam.totalMarks} marks
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-t border-blue-400">
                        <span className="text-blue-100">Percentage</span>
                        <span className="text-2xl font-bold">{result.registration.percentage?.toFixed(1)}%</span>
                      </div>
                      
                      {result.registration.rank && (
                        <div className="flex justify-between items-center py-2 border-t border-blue-400">
                          <span className="text-blue-100">Rank</span>
                          <span className="text-3xl font-bold text-yellow-300">#{result.registration.rank}</span>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-blue-400 text-center">
                        <div className="text-blue-100 mb-2">Final Result</div>
                        {result.registration.result === "pass" ? (
                          <div className="text-3xl font-bold text-green-300">🎉 PASS</div>
                        ) : (
                          <div className="text-3xl font-bold text-red-300">FAIL</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scholarship Reward */}
                {result.registration.rewardEligible && result.registration.rewardDetails && (
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Award size={24} />
                      <h3 className="text-xl font-semibold">🎉 Congratulations!</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-purple-100 text-sm">You've won a scholarship!</p>
                        <p className="text-3xl font-bold">
                          {result.registration.rewardDetails.rewardValue}
                          {result.registration.rewardDetails.rewardType === "percentage" ? "%" : "₹"}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-purple-400">
                        <p className="text-purple-100 text-sm">Reward Description</p>
                        <p className="font-semibold">{result.registration.rewardDetails.description}</p>
                      </div>
                      <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3 mt-4">
                        <p className="text-purple-100 text-sm">
                          🎓 You are eligible for this scholarship! Contact the institute for enrollment details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Cards */}
                {!result.exam.resultsPublished && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                      <AlertCircle size={20} />
                      Results Not Published Yet
                    </div>
                    <p className="text-yellow-700 text-sm">
                      The exam results haven't been officially published yet. Please check back later.
                    </p>
                  </div>
                )}

                {!result.registration.hasAttended && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                      <XCircle size={20} />
                      Did Not Attend
                    </div>
                    <p className="text-gray-700 text-sm">
                      You were registered but did not attend the exam. Better luck next time!
                    </p>
                  </div>
                )}

                {/* Enrollment Section */}
                {result.registration.result === "pass" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap size={20} />
                      Enrollment Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.registration.enrollmentStatus === "interested" ? "bg-blue-100 text-blue-600" :
                          result.registration.enrollmentStatus === "enrolled" ? "bg-green-100 text-green-600" :
                          result.registration.enrollmentStatus === "converted" ? "bg-purple-100 text-purple-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {result.registration.enrollmentStatus === "notInterested" ? "Not Applied" :
                           result.registration.enrollmentStatus === "interested" ? "Interest Shown" :
                           result.registration.enrollmentStatus === "enrolled" ? "Enrolled" :
                           "Student"}
                        </span>
                      </div>

                      {result.registration.enrollmentStatus === "notInterested" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-700 text-sm mb-3">
                            Based on your performance, you're eligible for admission to our courses!
                          </p>
                          <button
                            onClick={() => setShowEnrollmentForm(true)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Show Interest in Enrollment
                          </button>
                        </div>
                      )}

                      {result.registration.enrollmentStatus === "interested" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-700 text-sm">
                            ✅ Interest submitted! Our team will contact you soon.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Form Modal */}
        {showEnrollmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Show Enrollment Interest</h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  Are you interested in enrolling in our courses? Our admissions team will contact you with:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                  <li>Course details and curriculum</li>
                  <li>Fee structure and payment options</li>
                  <li>Scholarship application process</li>
                  <li>Batch timings and schedules</li>
                </ul>

                {result?.registration.rewardEligible && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your scholarship benefits will be applied during enrollment.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEnrollmentForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollmentInterest}
                  disabled={enrollmentSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrollmentSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    "Yes, I'm Interested"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}