"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  TrendingUp,
  UserCheck,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Download,
} from "lucide-react";

interface Registration {
  _id: string;
  registrationNumber: string;
  examId: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  currentClass: string;
  school: string;
  previousMarks?: string;
  photoUrl?: string;
  documents?: Array<{ name: string; url: string }>;
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
  convertedToStudent: boolean;
  studentId?: string;
  status: string;
  remarks?: string;
  adminNotes?: string;
  createdAt: string;
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  resultDate: string;
  status: string;
}

interface Batch {
  _id: string;
  batchName: string;
  course: string;
  fee: number;
}

const formatAddress = (address: string | { street: string; city: string; state: string; zipCode: string; country: string }) => {
  if (typeof address === 'string') {
    return address;
  }
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
};

export default function StudentResultPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;
  const regId = params.regId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [converting, setConverting] = useState(false);

  // Enrollment form
  const [selectedBatch, setSelectedBatch] = useState("");
  const [feeAmount, setFeeAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalFee, setFinalFee] = useState(0);

  useEffect(() => {
    fetchData();
  }, [regId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

      // Fetch exam
      const examResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        setExam(examData.exam);
      }

      // Fetch registration details
      const regResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      if (regResponse.ok) {
        const regData = await regResponse.json();
        const found = regData.registrations.find((r: Registration) => r._id === regId);
        if (found) {
          setRegistration(found);
          setAdminNotes(found.adminNotes || "");
        }
      }

      // Fetch batches for enrollment  
      const batchResponse = await fetch(`${API_URL}/api/batches?tenantId=${tenantId}`, {
        credentials: "include",
      });
      if (batchResponse.ok) {
        const batchData = await batchResponse.json();
        setBatches(batchData.batches || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    const batch = batches.find((b) => b._id === batchId);
    if (batch) {
      const baseFee = batch.fee;
      let discount = 0;

      // Apply scholarship discount if eligible
      if (registration?.rewardEligible && registration?.rewardDetails) {
        const reward = registration.rewardDetails;
        if (reward.rewardType === "percentage") {
          discount = (baseFee * reward.rewardValue) / 100;
        } else if (reward.rewardType === "fixed") {
          discount = reward.rewardValue;
        }
      }

      setFeeAmount(baseFee);
      setDiscountApplied(discount);
      setFinalFee(baseFee - discount);
    }
  };

  const handleConvertToAdmission = async () => {
    if (!selectedBatch) {
      alert("Please select a batch");
      return;
    }

    if (!confirm(`Convert ${registration?.studentName} to full student admission?`)) {
      return;
    }

    try {
      setConverting(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      
      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${regId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          batchId: selectedBatch,
          feeAmount: finalFee,
          discountApplied,
        }),
      });

      if (!response.ok) throw new Error("Failed to convert to admission");

      alert("Successfully converted to student admission!");
      setShowEnrollmentModal(false);
      fetchData();
    } catch (error) {
      console.error("Error converting:", error);
      alert("Failed to convert to admission");
    } finally {
      setConverting(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      
      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${regId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) throw new Error("Failed to save notes");

      alert("Notes saved successfully");
      setShowNotesModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
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
    if (!registration?.result || registration.result === "pending") {
      return (
        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          Result Pending
        </span>
      );
    }

    const badges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      pass: { bg: "bg-green-100", text: "text-green-600", label: "✓ PASS", icon: CheckCircle },
      fail: { bg: "bg-red-100", text: "text-red-600", label: "✗ FAIL", icon: XCircle },
      absent: { bg: "bg-gray-100", text: "text-gray-600", label: "ABSENT", icon: AlertCircle },
    };

    const badge = badges[registration.result];
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-2 px-4 py-2 ${badge.bg} ${badge.text} rounded-full text-sm font-bold`}>
        <Icon size={20} />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Registrations
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{registration.studentName}</h1>
                {getResultBadge()}
              </div>
              <p className="text-gray-600 mb-1">
                Registration No: <span className="font-mono font-semibold text-blue-600">{registration.registrationNumber}</span>
              </p>
              <p className="text-sm text-gray-500">
                Registered on {formatDate(registration.createdAt)} • {exam?.examName}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              {!registration.convertedToStudent && (
                <button
                  onClick={() => setShowEnrollmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserCheck size={20} />
                  Convert to Admission
                </button>
              )}
              <button
                onClick={() => setShowNotesModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={20} />
                Add Notes
              </button>
            </div>
          </div>

          {/* Status Banner */}
          {registration.convertedToStudent && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle size={20} />
                ✅ Converted to Full Student Admission
              </div>
              <p className="text-sm text-green-700 mt-1">
                This student has been enrolled and is now part of your institute.
              </p>
            </div>
          )}

          {registration.enrollmentStatus === "interested" && !registration.convertedToStudent && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                <AlertCircle size={20} />
                🔔 Student Expressed Interest in Enrollment
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This student has clicked "Enroll Now" and is waiting for admission confirmation.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
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
                <p className="font-medium text-gray-900">{registration.studentName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium text-gray-900">{formatDate(registration.dateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-medium text-gray-900">{registration.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail size={14} />
                  {registration.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone size={14} />
                  {registration.phone}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin size={14} />
                  {formatAddress(registration.address)}
                </p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Father's Name</label>
                <p className="font-medium text-gray-900">{registration.fatherName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Mother's Name</label>
                <p className="font-medium text-gray-900">{registration.motherName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Parent Contact</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone size={14} />
                  {registration.parentPhone}
                </p>
              </div>
              {registration.parentEmail && (
                <div>
                  <label className="text-sm text-gray-500">Parent Email</label>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Mail size={14} />
                    {registration.parentEmail}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap size={20} />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Current Class/Standard</label>
                <p className="font-medium text-gray-900">{registration.currentClass}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">School Name</label>
                <p className="font-medium text-gray-900">{registration.school}</p>
              </div>
              {registration.previousMarks && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Previous Year Marks</label>
                  <p className="font-medium text-gray-900">{registration.previousMarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {registration.adminNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText size={20} />
                Admin Notes
              </h3>
              <p className="text-blue-800 whitespace-pre-wrap">{registration.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Results & Rewards */}
        <div className="space-y-6">
          {/* Exam Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Exam Name</label>
                <p className="font-medium text-gray-900">{exam?.examName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Exam Date</label>
                <p className="font-medium text-gray-900">{exam?.examDate && formatDate(exam.examDate)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Attendance</label>
                <p className="font-medium text-gray-900">
                  {registration.hasAttended ? (
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

          {/* Results Card */}
          {registration.hasAttended && registration.marksObtained !== undefined && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Marks Obtained</span>
                  <span className="text-3xl font-bold">
                    {registration.marksObtained}/{exam?.totalMarks}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Percentage</span>
                  <span className="text-3xl font-bold">{registration.percentage?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Rank</span>
                  <span className="text-3xl font-bold text-yellow-300">#{registration.rank}</span>
                </div>
                <div className="pt-4 border-t border-blue-400">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Result</span>
                    {registration.result === "pass" ? (
                      <span className="text-2xl font-bold text-green-300">PASS ✓</span>
                    ) : (
                      <span className="text-2xl font-bold text-red-300">FAIL ✗</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reward/Scholarship Card */}
          {registration.rewardEligible && registration.rewardDetails && (
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Award size={24} />
                <h3 className="text-lg font-semibold">🎉 Scholarship Reward</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-purple-100 text-sm">Rank Eligibility</p>
                  <p className="text-2xl font-bold">
                    Rank {registration.rewardDetails.rankFrom}
                    {registration.rewardDetails.rankTo > registration.rewardDetails.rankFrom &&
                      ` - ${registration.rewardDetails.rankTo}`}
                  </p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Reward Value</p>
                  <p className="text-3xl font-bold">
                    {registration.rewardDetails.rewardValue}
                    {registration.rewardDetails.rewardType === "percentage"
                      ? "%"
                      : registration.rewardDetails.rewardType === "fixed"
                      ? "₹"
                      : ""}
                  </p>
                </div>
                <div className="pt-3 border-t border-purple-400">
                  <p className="text-purple-100 text-sm">Description</p>
                  <p className="font-semibold">{registration.rewardDetails.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enrollment Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Status</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Current Status</label>
                <p className="font-medium text-gray-900">
                  {registration.convertedToStudent ? (
                    <span className="text-green-600 font-bold">✓ Converted to Student</span>
                  ) : registration.enrollmentStatus === "interested" ? (
                    <span className="text-yellow-600 font-bold">⏳ Interested - Pending</span>
                  ) : (
                    <span className="text-gray-500">Not Interested</span>
                  )}
                </p>
              </div>
              {registration.convertedToStudent && registration.studentId && (
                <div>
                  <label className="text-sm text-gray-500">Student ID</label>
                  <p className="font-mono font-semibold text-blue-600">{registration.studentId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Convert to Student Admission</h2>
                  <p className="text-gray-600 mt-1">Enroll {registration.studentName} as a full student</p>
                </div>
                <button onClick={() => setShowEnrollmentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Name</p>
                    <p className="text-blue-900 font-semibold">{registration.studentName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Class</p>
                    <p className="text-blue-900 font-semibold">{registration.currentClass}</p>
                  </div>
                  {registration.marksObtained !== undefined && (
                    <>
                      <div>
                        <p className="text-blue-600 font-medium">Marks</p>
                        <p className="text-blue-900 font-semibold">
                          {registration.marksObtained}/{exam?.totalMarks} • Rank {registration.rank}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Result</p>
                        <p className="text-blue-900 font-semibold uppercase">{registration.result}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scholarship Info */}
              {registration.rewardEligible && registration.rewardDetails && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-900 font-semibold mb-2">
                    <Award size={20} />
                    Scholarship Reward Eligible
                  </div>
                  <p className="text-purple-700 font-medium">
                    {registration.rewardDetails.description} - {registration.rewardDetails.rewardValue}
                    {registration.rewardDetails.rewardType === "percentage" ? "%" : "₹"}
                  </p>
                </div>
              )}

              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName} - {batch.course} (₹{batch.fee.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Breakdown */}
              {selectedBatch && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Fee Structure</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Fee</span>
                      <span className="font-semibold text-gray-900">₹{feeAmount.toLocaleString()}</span>
                    </div>
                    {discountApplied > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Scholarship Discount</span>
                        <span className="font-semibold text-green-600">- ₹{discountApplied.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-300 flex justify-between">
                      <span className="font-semibold text-gray-900">Final Fee</span>
                      <span className="text-2xl font-bold text-blue-600">₹{finalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEnrollmentModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertToAdmission}
                  disabled={converting || !selectedBatch}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {converting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <UserCheck size={20} />
                      Convert to Admission
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">Admin Notes</h2>
                <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={8}
                placeholder="Add notes about this student, follow-ups, or any important information..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
