"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Eye,
  UserCheck,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Printer,
  Send,
} from "lucide-react";

interface Registration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  currentClass?: string;
  school?: string;
  address?: string | {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    full?: string;
  };
  hasAttended: boolean;
  marksObtained?: number;
  percentage?: number;
  rank?: number;
  result?: "pass" | "fail" | "absent" | "pending";
  rewardEligible: boolean;
  rewardDetails?: any;
  enrollmentStatus: "notInterested" | "interested" | "followUp" | "enrolled" | "converted" | "directAdmission" | "waitingList" | "cancelled";
  convertedToStudent: boolean;
  studentId?: string;
  status: "registered" | "approved" | "rejected" | "appeared" | "resultPublished";
  createdAt: string;
  remarks?: string;
}

// Utility function to format address
const formatAddress = (address: string | { street?: string; city?: string; state?: string; zipCode?: string; country?: string; full?: string } | undefined) => {
  if (!address) return 'N/A';
  if (typeof address === 'string') {
    return address;
  }
  // Check if it has a 'full' property (from manual registration)
  if (address.full) {
    return address.full;
  }
  // Build address from parts, filtering out empty values
  const parts = [
    address.street,
    address.city,
    address.state && address.zipCode ? `${address.state} ${address.zipCode}` : address.state || address.zipCode,
    address.country
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  examDate: string;
  status: string;
  stats: {
    totalRegistrations: number;
    totalAppeared: number;
    totalPassed: number;
    totalEnrolled: number;
    passPercentage: number;
    conversionRate: number;
  };
}

export default function RegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenantId as string) || '';
  const examId = (params?.examId as string) || '';

  const [exam, setExam] = useState<Exam | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [enrollmentFilter, setEnrollmentFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchExamAndRegistrations();
  }, [examId]);

  const fetchExamAndRegistrations = async () => {
    try {
      setLoading(true);
      
      // Fetch exam details using BFF route
      const examResponse = await fetch(`/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        setExam(examData.exam);
      }

      // Fetch registrations using BFF route
      const regResponse = await fetch(`/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      if (regResponse.ok) {
        const regData = await regResponse.json();
        setRegistrations(regData.registrations || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm) ||
      reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const matchesEnrollment = enrollmentFilter === "all" || reg.enrollmentStatus === enrollmentFilter;
    const matchesResult = resultFilter === "all" || reg.result === resultFilter;

    return matchesSearch && matchesStatus && matchesEnrollment && matchesResult;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      registered: { bg: "bg-blue-100", text: "text-blue-600", label: "Registered", icon: Clock },
      approved: { bg: "bg-green-100", text: "text-green-600", label: "Approved", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-600", label: "Rejected", icon: XCircle },
      appeared: { bg: "bg-purple-100", text: "text-purple-600", label: "Appeared", icon: CheckCircle },
      resultPublished: { bg: "bg-orange-100", text: "text-orange-600", label: "Result Out", icon: Award },
    };

    const badge = badges[status] || badges.registered;
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const handleEnrollmentStatusUpdate = async (registrationId: string, newStatus: Registration["enrollmentStatus"]) => {
    if (updatingStatus === registrationId) return; // Prevent multiple updates

    try {
      setUpdatingStatus(registrationId);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registrationId}/enrollment-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enrollmentStatus: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update enrollment status");

      // Update the local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg._id === registrationId 
            ? { ...reg, enrollmentStatus: newStatus }
            : reg
        )
      );

    } catch (error) {
      console.error("Error updating enrollment status:", error);
      alert("Failed to update enrollment status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getEnrollmentStatusDropdown = (registration: Registration) => {
    // If student has been converted, show a non-editable badge
    if (registration.convertedToStudent) {
      return (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle size={14} />
            ✓ Enrolled
          </span>
        </div>
      );
    }

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

    const statusOptions = [
      { value: "notInterested", label: "Not Interested", color: "text-gray-600" },
      { value: "interested", label: "Interested", color: "text-blue-600" },
      { value: "followUp", label: "Follow Up", color: "text-yellow-600" },
      { value: "enrolled", label: "Enrolled", color: "text-green-600" },
      { value: "directAdmission", label: "Direct Admission", color: "text-purple-600" },
      { value: "waitingList", label: "Waiting List", color: "text-orange-600" },
      { value: "cancelled", label: "Cancelled", color: "text-red-600" },
    ];

    const config = statusConfig[registration.enrollmentStatus] || statusConfig.notInterested;
    const Icon = config.icon;
    const isUpdating = updatingStatus === registration._id;

    return (
      <div className="relative w-40">
        <select
          value={registration.enrollmentStatus}
          onChange={(e) => handleEnrollmentStatusUpdate(registration._id, e.target.value as Registration["enrollmentStatus"])}
          disabled={isUpdating}
          className={`w-full px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
          } ${config.bg} ${config.text}`}
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

  const getResultBadge = (result?: string) => {
    if (!result || result === "pending") return null;

    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pass: { bg: "bg-green-100", text: "text-green-600", label: "✓ Pass" },
      fail: { bg: "bg-red-100", text: "text-red-600", label: "✗ Fail" },
      absent: { bg: "bg-gray-100", text: "text-gray-600", label: "Absent" },
    };

    const badge = badges[result];
    if (!badge) return null;

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const handleConvertToAdmission = async (registrationId: string, studentName: string) => {
    if (!confirm(`Convert ${studentName} to full student admission?`)) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";
      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registrationId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          // You can add batch selection here if needed
        }),
      });

      if (!response.ok) throw new Error("Failed to convert to admission");

      alert("Successfully converted to student admission!");
      fetchExamAndRegistrations();
    } catch (error) {
      console.error("Error converting to admission:", error);
      alert("Failed to convert to admission");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Registration Number",
      "Name",
      "Email",
      "Phone",
      "DOB",
      "Class",
      "School",
      "Status",
      "Marks",
      "Rank",
      "Result",
      "Enrollment Status",
    ];

    const rows = filteredRegistrations.map((reg) => [
      reg.registrationNumber,
      reg.studentName,
      reg.email,
      reg.phone,
      reg.dateOfBirth ? new Date(reg.dateOfBirth).toLocaleDateString() : "-",
      reg.currentClass || "-",
      reg.school || "-",
      reg.status,
      reg.marksObtained || "-",
      reg.rank || "-",
      reg.result || "pending",
      reg.enrollmentStatus,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${exam?.examCode || "export"}.csv`;
    a.click();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrintRegistration = (registration: Registration) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Registration Details - ${registration.registrationNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; }
            .section { margin: 20px 0; }
            .section h2 { font-size: 16px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
            .field { display: flex; margin: 10px 0; }
            .field-label { font-weight: bold; width: 180px; color: #555; }
            .field-value { flex: 1; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${exam?.examName || 'Scholarship Exam'}</h1>
            <p>Registration Number: <strong>${registration.registrationNumber}</strong></p>
            <p>Registration Date: ${formatDate(registration.createdAt)}</p>
          </div>

          <div class="section">
            <h2>Student Information</h2>
            <div class="field"><span class="field-label">Name:</span><span class="field-value">${registration.studentName}</span></div>
            <div class="field"><span class="field-label">Date of Birth:</span><span class="field-value">${registration.dateOfBirth ? formatDate(registration.dateOfBirth) : 'N/A'}</span></div>
            <div class="field"><span class="field-label">Gender:</span><span class="field-value">${registration.gender || 'N/A'}</span></div>
          </div>

          <div class="section">
            <h2>Contact Information</h2>
            <div class="field"><span class="field-label">Email:</span><span class="field-value">${registration.email}</span></div>
            <div class="field"><span class="field-label">Phone:</span><span class="field-value">${registration.phone}</span></div>
          </div>

          <div class="section">
            <h2>Parent/Guardian Information</h2>
            <div class="field"><span class="field-label">Father's Name:</span><span class="field-value">${registration.fatherName || 'N/A'}</span></div>
            <div class="field"><span class="field-label">Mother's Name:</span><span class="field-value">${registration.motherName || 'N/A'}</span></div>
            <div class="field"><span class="field-label">Parent Phone:</span><span class="field-value">${registration.parentPhone || 'N/A'}</span></div>
          </div>

          <div class="section">
            <h2>Academic Information</h2>
            <div class="field"><span class="field-label">Current Class:</span><span class="field-value">${registration.currentClass || 'N/A'}</span></div>
            <div class="field"><span class="field-label">School:</span><span class="field-value">${registration.school || 'N/A'}</span></div>
          </div>

          <div class="section">
            <h2>Address</h2>
            <div class="field"><span class="field-label">Address:</span><span class="field-value">${formatAddress(registration.address)}</span></div>
          </div>

          ${registration.marksObtained !== undefined ? `
          <div class="section">
            <h2>Exam Results</h2>
            <div class="field"><span class="field-label">Marks Obtained:</span><span class="field-value">${registration.marksObtained}</span></div>
            <div class="field"><span class="field-label">Rank:</span><span class="field-value">${registration.rank || 'N/A'}</span></div>
            <div class="field"><span class="field-label">Result:</span><span class="field-value">${registration.result || 'Pending'}</span></div>
          </div>
          ` : ''}

          <div class="section">
            <h2>Status Information</h2>
            <div class="field"><span class="field-label">Status:</span><span class="field-value">${registration.status}</span></div>
            <div class="field"><span class="field-label">Enrollment Status:</span><span class="field-value">${registration.enrollmentStatus}</span></div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>Printed on ${new Date().toLocaleString()}</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleEmailRegistration = (registration: Registration) => {
    const subject = `Registration Details - ${registration.registrationNumber}`;
    const body = `
Dear ${registration.studentName},

Your registration details for ${exam?.examName || 'Scholarship Exam'}:

Registration Number: ${registration.registrationNumber}
Name: ${registration.studentName}
Email: ${registration.email}
Phone: ${registration.phone}
Class: ${registration.currentClass || 'N/A'}
School: ${registration.school || 'N/A'}

Status: ${registration.status}

Thank you for registering!

Best regards,
${exam?.examName || 'Exam Team'}
    `.trim();

    window.location.href = `mailto:${registration.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Exams
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam?.examName}</h1>
            <p className="text-gray-600 mt-1">
              Registrations & Leads Management • Code: <span className="font-mono font-semibold">{exam?.examCode}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations/add`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <User size={20} />
              Add Registration
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{exam?.stats.totalRegistrations || 0}</h3>
          <p className="text-sm text-gray-600">Total Registrations</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{exam?.stats.totalAppeared || 0}</h3>
          <p className="text-sm text-gray-600">Appeared</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{exam?.stats.totalPassed || 0}</h3>
          <p className="text-sm text-gray-600">Passed ({exam?.stats.passPercentage?.toFixed(1) || 0}%)</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{exam?.stats.totalEnrolled || 0}</h3>
          <p className="text-sm text-gray-600">Converted ({exam?.stats.conversionRate?.toFixed(1) || 0}%)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="registered">Registered</option>
                <option value="approved">Approved</option>
                <option value="appeared">Appeared</option>
                <option value="resultPublished">Result Published</option>
              </select>
            </div>

            <select
              value={enrollmentFilter}
              onChange={(e) => setEnrollmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Enrollment Status</option>
              <option value="notInterested">Not Interested</option>
              <option value="interested">Interested</option>
              <option value="followUp">Follow Up</option>
              <option value="enrolled">Enrolled</option>
              <option value="converted">Converted</option>
              <option value="directAdmission">Direct Admission</option>
              <option value="waitingList">Waiting List</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="pending">Pending</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Found</h3>
          <p className="text-gray-600">
            {registrations.length === 0
              ? "No students have registered for this exam yet"
              : "No registrations match your search criteria"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{reg.studentName}</div>
                        <div className="text-xs text-gray-500 font-mono">{reg.registrationNumber}</div>
                        <div className="text-xs text-gray-500">Reg: {formatDate(reg.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Mail size={12} />
                          {reg.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone size={12} />
                          {reg.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">Class {reg.currentClass || 'N/A'}</div>
                        <div className="text-xs text-gray-600">{reg.school || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(reg.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reg.marksObtained !== undefined ? (
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {reg.marksObtained} marks • Rank {reg.rank}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {getResultBadge(reg.result)}
                            {reg.rewardEligible && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                🏆 Reward
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not published</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEnrollmentStatusDropdown(reg)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations/${reg._id}`)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Quick View"
                        >
                          <Eye size={16} />
                        </button>
                        {!reg.convertedToStudent && (
                          <button
                            onClick={() => router.push(`/dashboard/client/${tenantId}/students/add?regId=${reg._id}&examId=${examId}&from=scholarship`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                            title="Enroll Student"
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRegistration.studentName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-gray-600 font-mono">{selectedRegistration.registrationNumber}</p>
                    {selectedRegistration.convertedToStudent && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle size={14} />
                        ✓ Enrolled as Student
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {selectedRegistration.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {selectedRegistration.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="font-medium">{selectedRegistration.dateOfBirth ? formatDate(selectedRegistration.dateOfBirth) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{selectedRegistration.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Father's Name</p>
                    <p className="font-medium">{selectedRegistration.fatherName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mother's Name</p>
                    <p className="font-medium">{selectedRegistration.motherName || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Parent Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {selectedRegistration.parentPhone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Current Class</p>
                    <p className="font-medium">{selectedRegistration.currentClass || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">School</p>
                    <p className="font-medium">{selectedRegistration.school || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
                <p className="text-sm text-gray-700">
                  {formatAddress(selectedRegistration.address)}
                </p>
              </div>

              {/* Results */}
              {selectedRegistration.marksObtained !== undefined && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Exam Results</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Marks Obtained</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedRegistration.marksObtained}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rank</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedRegistration.rank}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Percentage</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedRegistration.percentage?.toFixed(1)}%</p>
                    </div>
                  </div>
                  {selectedRegistration.rewardEligible && selectedRegistration.rewardDetails && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-900 font-semibold mb-1">
                        <Award size={20} />
                        Reward/Scholarship Eligible
                      </div>
                      <p className="text-sm text-purple-700">{selectedRegistration.rewardDetails?.description || 'Reward details not available'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-3">
                  {/* Primary Actions */}
                  <button
                    onClick={() => handlePrintRegistration(selectedRegistration)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Printer size={18} />
                    Print
                  </button>
                  <button
                    onClick={() => handlePrintRegistration(selectedRegistration)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleEmailRegistration(selectedRegistration)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send size={18} />
                    Email Details
                  </button>
                  
                  {/* Secondary Actions */}
                  <div className="flex-1"></div>
                  
                  {!selectedRegistration.convertedToStudent && selectedRegistration.enrollmentStatus === "interested" && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleConvertToAdmission(selectedRegistration._id, selectedRegistration.studentName);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <UserCheck size={18} />
                      Convert to Admission
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
