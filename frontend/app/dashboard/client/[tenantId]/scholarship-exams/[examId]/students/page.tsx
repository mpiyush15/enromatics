"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Search,
  Filter,
  Download,
  UserCheck,
  Eye,
  Award,
  TrendingUp,
  Users,
  Calendar,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

interface Registration {
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
  enrollmentStatus: "notInterested" | "interested" | "followUp" | "enrolled" | "converted" | "directAdmission" | "waitingList" | "cancelled";
  convertedToStudent: boolean;
  createdAt: string;
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  status: string;
  stats: {
    totalRegistrations: number;
    totalAppearedStudents: number;
    passedStudents: number;
  };
}

interface Batch {
  _id: string;
  batchName: string;
  course: string;
  fee: number;
}

interface StudentsResponse {
  success: boolean;
  exam: Exam;
  registrations: Registration[];
  batches: Batch[];
}

export default function StudentsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;
  const examId = params?.examId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Registration | null>(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [feeAmount, setFeeAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalFee, setFinalFee] = useState(0);
  const [converting, setConverting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // ✅ SWR: Auto-caching scholarship students
  const { data: response, isLoading: loading, mutate } = useDashboardData<StudentsResponse>(
    tenantId && examId ? `/api/scholarship-exams/${examId}/students` : null
  );

  const exam = response?.exam || null;
  const registrations = response?.registrations || [];
  const batches = response?.batches || [];

  const handleEnrollNow = (student: Registration) => {
    setSelectedStudent(student);
    setSelectedBatch("");
    setFeeAmount(0);
    setDiscountApplied(0);
    setFinalFee(0);
    setShowEnrollmentModal(true);
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    const batch = batches.find((b) => b._id === batchId);
    if (batch && selectedStudent) {
      const baseFee = batch.fee;
      let discount = 0;

      // Apply scholarship discount if eligible
      if (selectedStudent.rewardEligible && selectedStudent.rewardDetails) {
        const reward = selectedStudent.rewardDetails;
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
    if (!selectedStudent || !selectedBatch) {
      alert("Please select a batch");
      return;
    }

    if (!confirm(`Convert ${selectedStudent.studentName} to full student admission?`)) {
      return;
    }

    try {
      setConverting(true);

      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${selectedStudent._id}/convert`, {
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
      mutate();
    } catch (error) {
      console.error("Error converting:", error);
      alert("Failed to convert to admission");
    } finally {
      setConverting(false);
    }
  };

  const handleEnrollmentStatusUpdate = async (registrationId: string, newStatus: Registration["enrollmentStatus"]) => {
    if (updatingStatus === registrationId) return; // Prevent multiple updates

    try {
      setUpdatingStatus(registrationId);

      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registrationId}/enrollment-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enrollmentStatus: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update enrollment status");

      // Refresh data after update
      mutate();

      // Optional: Show success message
      // You can uncomment this if you want visual feedback
      // alert("Enrollment status updated successfully!");

    } catch (error) {
      console.error("Error updating enrollment status:", error);
      alert("Failed to update enrollment status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || reg.enrollmentStatus === filterStatus;
    
    const matchesResult = filterResult === "all" || reg.result === filterResult;

    return matchesSearch && matchesStatus && matchesResult;
  });

  const getResultBadge = (registration: Registration) => {
    if (!registration.result || registration.result === "pending") {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    }

    const badges = {
      pass: { bg: "bg-green-100", text: "text-green-600", label: "Pass", icon: CheckCircle },
      fail: { bg: "bg-red-100", text: "text-red-600", label: "Fail", icon: XCircle },
      absent: { bg: "bg-gray-100", text: "text-gray-600", label: "Absent", icon: AlertCircle },
    };

    const badge = badges[registration.result];
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-medium`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getEnrollmentStatusBadge = (registration: Registration) => {
    const statusConfig = {
      notInterested: { 
        bg: "bg-gray-100", 
        text: "text-gray-600", 
        label: "Not Interested", 
        icon: XCircle 
      },
      interested: { 
        bg: "bg-blue-100", 
        text: "text-blue-600", 
        label: "Interested", 
        icon: AlertCircle 
      },
      followUp: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-600", 
        label: "Follow Up", 
        icon: RefreshCw 
      },
      enrolled: { 
        bg: "bg-green-100", 
        text: "text-green-600", 
        label: "Enrolled", 
        icon: CheckCircle 
      },
      converted: { 
        bg: "bg-green-100", 
        text: "text-green-600", 
        label: "Student", 
        icon: GraduationCap 
      },
      directAdmission: { 
        bg: "bg-purple-100", 
        text: "text-purple-600", 
        label: "Direct Admission", 
        icon: Award 
      },
      waitingList: { 
        bg: "bg-orange-100", 
        text: "text-orange-600", 
        label: "Waiting List", 
        icon: Calendar 
      },
      cancelled: { 
        bg: "bg-red-100", 
        text: "text-red-600", 
        label: "Cancelled", 
        icon: XCircle 
      }
    };

    const config = statusConfig[registration.enrollmentStatus] || statusConfig.notInterested;
    const Icon = config.icon;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-medium`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getEnrollmentStatusDropdown = (registration: Registration) => {
    const statusOptions = [
      { value: "notInterested", label: "Not Interested", color: "text-gray-600" },
      { value: "interested", label: "Interested", color: "text-blue-600" },
      { value: "followUp", label: "Follow Up", color: "text-yellow-600" },
      { value: "enrolled", label: "Enrolled", color: "text-green-600" },
      { value: "directAdmission", label: "Direct Admission", color: "text-purple-600" },
      { value: "waitingList", label: "Waiting List", color: "text-orange-600" },
      { value: "cancelled", label: "Cancelled", color: "text-red-600" },
    ];

    const isUpdating = updatingStatus === registration._id;

    return (
      <div className="relative">
        <select
          value={registration.enrollmentStatus}
          onChange={(e) => handleEnrollmentStatusUpdate(registration._id, e.target.value as Registration["enrollmentStatus"])}
          disabled={isUpdating}
          className={`w-full px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
          } ${getEnrollmentStatusBadge(registration).props.className.split(' ').slice(3).join(' ')}`}
          style={{ 
            backgroundColor: getEnrollmentStatusBadge(registration).props.className.includes('bg-gray') ? '#f3f4f6' :
                            getEnrollmentStatusBadge(registration).props.className.includes('bg-blue') ? '#dbeafe' :
                            getEnrollmentStatusBadge(registration).props.className.includes('bg-yellow') ? '#fef3c7' :
                            getEnrollmentStatusBadge(registration).props.className.includes('bg-green') ? '#dcfce7' :
                            getEnrollmentStatusBadge(registration).props.className.includes('bg-purple') ? '#f3e8ff' :
                            getEnrollmentStatusBadge(registration).props.className.includes('bg-orange') ? '#fed7aa' :
                            getEnrollmentStatusBadge(registration).props.className.includes('bg-red') ? '#fecaca' : '#f3f4f6'
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value} className={option.color}>
              {option.label}
            </option>
          ))}
        </select>
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Exam Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users size={32} />
                Students Management
              </h1>
              <p className="text-gray-600 mb-4">
                {exam?.examName} • {exam?.examCode}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <User size={16} />
                    <span className="text-sm font-medium">Total Registered</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{exam?.stats.totalRegistrations || 0}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">Appeared</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">{exam?.stats.totalAppearedStudents || 0}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Award size={16} />
                    <span className="text-sm font-medium">Passed</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{exam?.stats.passedStudents || 0}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <GraduationCap size={16} />
                    <span className="text-sm font-medium">Converted</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {registrations.filter(r => r.convertedToStudent).length}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, email, or registration number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="notInterested">Not Interested</option>
              <option value="interested">Interested</option>
              <option value="followUp">Follow Up</option>
              <option value="enrolled">Enrolled</option>
              <option value="converted">Converted to Student</option>
              <option value="directAdmission">Direct Admission</option>
              <option value="waitingList">Waiting List</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Result</label>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="absent">Absent</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterResult("all");
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {registration.studentName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{registration.email}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {registration.registrationNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          Registered: {formatDate(registration.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">{registration.currentClass}</p>
                      <p className="text-gray-500 text-xs truncate max-w-xs">{registration.school}</p>
                      <p className="text-gray-400 text-xs">{registration.phone}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      {getResultBadge(registration)}
                      {registration.marksObtained !== undefined ? (
                        <div className="text-xs text-gray-600">
                          <div>{registration.marksObtained}/{exam?.totalMarks} marks</div>
                          <div>{registration.percentage?.toFixed(1)}% • Rank #{registration.rank}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          {registration.hasAttended ? "Results pending" : "Did not attend"}
                        </div>
                      )}
                      {registration.rewardEligible && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Award size={12} />
                          Scholarship Eligible
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-40">
                      {getEnrollmentStatusDropdown(registration)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations/${registration._id}`)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    
                    {!registration.convertedToStudent && (
                      <button
                        onClick={() => handleEnrollNow(registration)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                      >
                        <UserCheck size={12} />
                        Enroll Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all" || filterResult !== "all"
                ? "Try adjusting your search or filters"
                : "No students have registered for this exam yet"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Convert to Student Admission</h2>
                  <p className="text-gray-600 mt-1">Enroll {selectedStudent.studentName} as a full student</p>
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
                    <p className="text-blue-900 font-semibold">{selectedStudent.studentName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Class</p>
                    <p className="text-blue-900 font-semibold">{selectedStudent.currentClass}</p>
                  </div>
                  {selectedStudent.marksObtained !== undefined && (
                    <>
                      <div>
                        <p className="text-blue-600 font-medium">Marks</p>
                        <p className="text-blue-900 font-semibold">
                          {selectedStudent.marksObtained}/{exam?.totalMarks} • Rank {selectedStudent.rank}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Result</p>
                        <p className="text-blue-900 font-semibold uppercase">{selectedStudent.result}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scholarship Info */}
              {selectedStudent.rewardEligible && selectedStudent.rewardDetails && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-900 font-semibold mb-2">
                    <Award size={20} />
                    Scholarship Reward Eligible
                  </div>
                  <p className="text-purple-700 font-medium">
                    {selectedStudent.rewardDetails.description} - {selectedStudent.rewardDetails.rewardValue}
                    {selectedStudent.rewardDetails.rewardType === "percentage" ? "%" : "₹"}
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
    </div>
  );
}