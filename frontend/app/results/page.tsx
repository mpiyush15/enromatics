"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Award, TrendingUp, CheckCircle, XCircle, Clock, User, Mail, Phone, GraduationCap, Star, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface ResultData {
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  examName: string;
  examCode: string;
  examDate: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  rank: number;
  result: "pass" | "fail" | "absent" | "pending";
  rewardEligible: boolean;
  rewardDetails?: {
    type: string;
    value: number;
    description: string;
  };
  enrollmentEligible: boolean;
  enrollmentStatus: "notInterested" | "interested" | "enrolled" | "converted";
}

interface ExamStats {
  totalAppeared: number;
  totalPassed: number;
  averageMarks: number;
  topScore: number;
}

export default function StudentResultPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentSubmitting, setEnrollmentSubmitting] = useState(false);

  const searchResult = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter your registration number");
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 Searching for result:", searchQuery);
      
      // Simulate API call - In real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated result data
      const simulatedResult: ResultData = {
        registrationNumber: searchQuery,
        studentName: "Demo Student",
        email: "demo@example.com",
        phone: "+91 9876543210",
        examName: "Science Scholarship Test 2024",
        examCode: "EXAM240001",
        examDate: "2024-11-20T10:00:00Z",
        marksObtained: 78,
        totalMarks: 100,
        percentage: 78,
        rank: 15,
        result: "pass",
        rewardEligible: true,
        rewardDetails: {
          type: "percentage",
          value: 25,
          description: "25% Scholarship on Tuition Fees"
        },
        enrollmentEligible: true,
        enrollmentStatus: "notInterested"
      };

      const simulatedStats: ExamStats = {
        totalAppeared: 1250,
        totalPassed: 445,
        averageMarks: 52.3,
        topScore: 96
      };

      setResult(simulatedResult);
      setExamStats(simulatedStats);
      
    } catch (error) {
      console.error("❌ Error fetching result:", error);
      alert("Result not found. Please check your registration number.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentInterest = async () => {
    if (!result) return;

    setEnrollmentSubmitting(true);
    try {
      console.log("📝 Submitting enrollment interest for:", result.registrationNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult({
        ...result,
        enrollmentStatus: "interested"
      });
      
      setShowEnrollmentForm(false);
      alert("Thank you for your interest! Our admissions team will contact you soon.");
      
    } catch (error) {
      console.error("❌ Error submitting enrollment interest:", error);
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

  const getResultBadge = (result: string) => {
    const badges = {
      pass: { bg: "bg-green-100", text: "text-green-800", label: "✓ PASSED", icon: CheckCircle },
      fail: { bg: "bg-red-100", text: "text-red-800", label: "✗ FAILED", icon: XCircle },
      absent: { bg: "bg-gray-100", text: "text-gray-800", label: "ABSENT", icon: Clock },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "PENDING", icon: Clock },
    };

    const badge = badges[result as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${badge.bg} ${badge.text}`}>
        <Icon size={16} />
        {badge.label}
      </span>
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

        {/* Search Section */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Enter Your Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchResult()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="e.g., REG240001"
                />
              </div>

              <button
                onClick={searchResult}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="max-w-4xl mx-auto">
            {/* Student Info & Result */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.studentName}</h2>
                  <p className="text-gray-600">Registration: <span className="font-mono font-semibold">{result.registrationNumber}</span></p>
                  <p className="text-gray-600">{result.examName}</p>
                </div>
                <div className="text-right">
                  {getResultBadge(result.result)}
                  <p className="text-sm text-gray-500 mt-2">Exam Date: {formatDate(result.examDate)}</p>
                </div>
              </div>

              {/* Score Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{result.marksObtained}</div>
                  <div className="text-sm text-gray-600">Marks Obtained</div>
                  <div className="text-xs text-gray-500">out of {result.totalMarks}</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{result.percentage}%</div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">#{result.rank}</div>
                  <div className="text-sm text-gray-600">Rank</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {examStats ? `${((result.rank / examStats.totalAppeared) * 100).toFixed(1)}%` : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Percentile</div>
                </div>
              </div>

              {/* Scholarship Reward */}
              {result.rewardEligible && result.rewardDetails && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="text-yellow-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">🎉 Congratulations! You've Won a Scholarship!</h3>
                  </div>
                  <p className="text-gray-700 text-lg font-medium">
                    {result.rewardDetails.description}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    This scholarship will be applicable when you enroll in our courses.
                  </p>
                </div>
              )}

              {/* Enrollment Section */}
              {result.enrollmentEligible && result.result === "pass" && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Admission Enrollment</h3>
                      <p className="text-gray-600">Join our institute and start your learning journey</p>
                    </div>
                    <div>
                      {getEnrollmentStatusBadge(result.enrollmentStatus)}
                    </div>
                  </div>

                  {result.enrollmentStatus === "notInterested" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <GraduationCap className="text-blue-600 mt-1" size={24} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Ready to Join Our Institute?</h4>
                          <p className="text-gray-700 mb-4">
                            Based on your excellent performance, you're eligible for admission to our courses. 
                            {result.rewardEligible && " Plus, you'll get your scholarship benefits!"}
                          </p>
                          <button
                            onClick={() => setShowEnrollmentForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.enrollmentStatus === "interested" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                          <h4 className="font-semibold text-gray-900">Interest Submitted Successfully!</h4>
                          <p className="text-gray-700">Our admissions team will contact you within 2-3 business days.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(result.enrollmentStatus === "enrolled" || result.enrollmentStatus === "converted") && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-center gap-3">
                        <Star className="text-purple-600" size={24} />
                        <div>
                          <h4 className="font-semibold text-gray-900">Welcome to Our Institute! 🎓</h4>
                          <p className="text-gray-700">You are now enrolled. Check your email for further instructions.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Exam Statistics */}
            {examStats && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={24} />
                  Exam Statistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700 mb-2">{examStats.totalAppeared}</div>
                    <div className="text-sm text-gray-600">Students Appeared</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700 mb-2">{examStats.totalPassed}</div>
                    <div className="text-sm text-gray-600">Students Passed</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700 mb-2">{examStats.averageMarks}</div>
                    <div className="text-sm text-gray-600">Average Marks</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700 mb-2">{examStats.topScore}</div>
                    <div className="text-sm text-gray-600">Highest Score</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center text-blue-800">
                    <strong>Pass Rate:</strong> {((examStats.totalPassed / examStats.totalAppeared) * 100).toFixed(1)}% • 
                    <strong className="ml-2">Your Performance:</strong> {
                      result.percentage > examStats.averageMarks ? "Above Average" : "Below Average"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enrollment Form Modal */}
        {showEnrollmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Enrollment Interest</h3>
              
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

                {result?.rewardEligible && (
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
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    </>
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