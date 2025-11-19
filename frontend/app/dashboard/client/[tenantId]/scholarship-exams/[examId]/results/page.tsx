"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Users,
  Send,
  Edit,
  Save,
  Eye,
  UserCheck,
  Mail,
  Phone,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface Registration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  hasAttended: boolean;
  marksObtained?: number;
  percentage?: number;
  rank?: number;
  result?: "pass" | "fail" | "absent" | "pending";
  rewardEligible: boolean;
  rewardDetails?: any;
  enrollmentStatus: "notInterested" | "interested" | "enrolled" | "converted";
  convertedToStudent: boolean;
  studentId?: string;
  status: "registered" | "approved" | "rejected" | "appeared" | "resultPublished";
  createdAt: string;
}

interface ExamData {
  _id: string;
  examName: string;
  examCode: string;
  totalMarks: number;
  passingMarks: number;
  resultsPublished: boolean;
  rewards: Array<{
    rankFrom: number;
    rankTo: number;
    rewardType: string;
    rewardValue: number;
    description: string;
  }>;
}

export default function ResultManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;

  const [exam, setExam] = useState<ExamData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [editingResults, setEditingResults] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingResults, setUploadingResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const examResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        setExam(examData.exam);
      }

      const regResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      if (regResponse.ok) {
        const regData = await regResponse.json();
        setRegistrations(regData.registrations || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleResultUpdate = (regId: string, field: string, value: any) => {
    setRegistrations(prev => 
      prev.map(reg => 
        reg._id === regId 
          ? { ...reg, [field]: value }
          : reg
      )
    );
  };

  const saveIndividualResult = async (registration: Registration) => {
    try {
      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registration._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          marksObtained: registration.marksObtained,
          hasAttended: registration.hasAttended,
          result: registration.result,
        }),
      });

      if (!response.ok) throw new Error("Failed to update result");
      
      alert("Result updated successfully");
    } catch (error) {
      console.error("Error updating result:", error);
      alert("Failed to update result");
    }
  };

  const publishResults = async () => {
    if (!confirm("Are you sure you want to publish results? Students will be able to see their results immediately.")) {
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`${API_URL}/api/scholarship-exams/${examId}/publish-results`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to publish results");

      setExam(prev => prev ? { ...prev, resultsPublished: true } : null);
      alert("Results published successfully! Students can now check their results.");
    } catch (error) {
      console.error("Error publishing results:", error);
      alert("Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  const handleBulkAction = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select students first");
      return;
    }

    if (!bulkAction) {
      alert("Please select an action");
      return;
    }

    try {
      console.log("Bulk action:", bulkAction, "Students:", selectedStudents);
      alert(`${bulkAction} applied to ${selectedStudents.length} students`);
      setSelectedStudents([]);
      setBulkAction("");
    } catch (error) {
      console.log("Error applying bulk action:", error);
      alert("Failed to apply bulk action");
    }
  };

  const exportResults = () => {
    const csvContent = [
      ["Registration Number", "Student Name", "Email", "Phone", "Marks", "Percentage", "Rank", "Result", "Reward Eligible"].join(","),
      ...filteredRegistrations.map(reg => [
        reg.registrationNumber,
        reg.studentName,
        reg.email,
        reg.phone,
        reg.marksObtained || 0,
        reg.percentage || 0,
        reg.rank || 0,
        reg.result || "pending",
        reg.rewardEligible ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam?.examCode}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('resultsFile', file);

    try {
      setUploadingResults(true);
      const response = await fetch(`${API_URL}/api/scholarship-exams/${examId}/upload-results`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload results');
      }

      const data = await response.json();
      alert(`Results uploaded successfully! Updated ${data.updatedCount} students.`);
      setShowUploadModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error uploading results:', error);
      alert(`Failed to upload results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingResults(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadResultsTemplate = () => {
    const templateData = [
      ['Registration Number', 'Marks Obtained', 'Has Attended', 'Result', 'Rank'],
      ['EXAM250002-00001', '85', 'TRUE', 'pass', '1'],
      ['EXAM250002-00002', '72', 'TRUE', 'pass', '2'],
      ['EXAM250002-00003', '0', 'FALSE', 'absent', ''],
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam?.examCode}_results_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const matchesResult = resultFilter === "all" || reg.result === resultFilter;

    return matchesSearch && matchesStatus && matchesResult;
  });

  const stats = {
    totalRegistrations: registrations.length,
    totalAppeared: registrations.filter(r => r.hasAttended).length,
    totalPassed: registrations.filter(r => r.result === "pass").length,
    totalEnrolled: registrations.filter(r => r.enrollmentStatus === "interested" || r.enrollmentStatus === "enrolled").length,
    averageMarks: registrations.filter(r => r.marksObtained).reduce((sum, r) => sum + (r.marksObtained || 0), 0) / registrations.filter(r => r.marksObtained).length || 0,
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      registered: { bg: "bg-blue-100", text: "text-blue-600", label: "Registered", icon: Clock },
      approved: { bg: "bg-green-100", text: "text-green-600", label: "Approved", icon: CheckCircle },
      appeared: { bg: "bg-purple-100", text: "text-purple-600", label: "Appeared", icon: CheckCircle },
      resultPublished: { bg: "bg-orange-100", text: "text-orange-600", label: "Result Out", icon: Award },
    };

    const badge = badges[status] || badges.registered;
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getResultBadge = (result?: string) => {
    if (!result || result === "pending") return <span className="text-gray-400">-</span>;

    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pass: { bg: "bg-green-100", text: "text-green-600", label: "✓ Pass" },
      fail: { bg: "bg-red-100", text: "text-red-600", label: "✗ Fail" },
      absent: { bg: "bg-gray-100", text: "text-gray-600", label: "Absent" },
    };

    const badge = badges[result];
    if (!badge) return <span className="text-gray-400">-</span>;

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
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
          <p className="text-gray-600">The exam you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Result Management</h1>
            <p className="text-gray-600">{exam.examName} - {exam.examCode}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Upload size={20} />
              Upload Results CSV
            </button>
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={20} />
              Export Results
            </button>
            {!exam.resultsPublished ? (
              <button
                onClick={publishResults}
                disabled={publishing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Publish Results
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle size={20} />
                Results Published
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</h3>
          <p className="text-sm text-gray-600">Total Registrations</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalAppeared}</h3>
          <p className="text-sm text-gray-600">Students Appeared</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalPassed}</h3>
          <p className="text-sm text-gray-600">Students Passed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserCheck className="text-orange-600" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalEnrolled}</h3>
          <p className="text-sm text-gray-600">Enrollment Interested</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="text-indigo-600" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.averageMarks.toFixed(1)}</h3>
          <p className="text-sm text-gray-600">Average Marks</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Results</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="absent">Absent</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              {selectedStudents.length} students selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1 border border-blue-300 rounded text-sm"
            >
              <option value="">Select Action</option>
              <option value="approve">Approve All</option>
              <option value="markAttended">Mark as Attended</option>
              <option value="sendEmail">Send Email</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(filteredRegistrations.map(r => r._id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Attendance</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Marks</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Result</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Enrollment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(registration._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, registration._id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== registration._id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{registration.studentName}</p>
                      <p className="text-sm text-gray-500 font-mono">{registration.registrationNumber}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail size={12} />
                        {registration.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone size={12} />
                        {registration.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(registration.status)}
                  </td>
                  <td className="px-4 py-3">
                    {editingResults ? (
                      <input
                        type="checkbox"
                        checked={registration.hasAttended}
                        onChange={(e) => handleResultUpdate(registration._id, "hasAttended", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <span className={registration.hasAttended ? "text-green-600" : "text-gray-400"}>
                        {registration.hasAttended ? "✓ Present" : "✗ Absent"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingResults ? (
                      <input
                        type="number"
                        value={registration.marksObtained || ""}
                        onChange={(e) => handleResultUpdate(registration._id, "marksObtained", Number(e.target.value))}
                        min={0}
                        max={exam.totalMarks}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="0"
                      />
                    ) : (
                      <span>{registration.marksObtained || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingResults ? (
                      <select
                        value={registration.result || "pending"}
                        onChange={(e) => handleResultUpdate(registration._id, "result", e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                        <option value="absent">Absent</option>
                      </select>
                    ) : (
                      getResultBadge(registration.result)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      {registration.rank ? `#${registration.rank}` : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      registration.enrollmentStatus === "interested" || registration.enrollmentStatus === "enrolled"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {registration.enrollmentStatus === "interested" ? "Interested" : 
                       registration.enrollmentStatus === "enrolled" ? "Enrolled" :
                       registration.enrollmentStatus === "converted" ? "Student" : 
                       "Not Applied"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editingResults && (
                        <button
                          onClick={() => saveIndividualResult(registration)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Save Result"
                        >
                          <Save size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations/${registration._id}`)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Edit Mode Toggle */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setEditingResults(!editingResults)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            editingResults
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {editingResults ? (
            <>
              <XCircle size={20} />
              Exit Edit Mode
            </>
          ) : (
            <>
              <Edit size={20} />
              Edit Results
            </>
          )}
        </button>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Results CSV</h2>
                  <p className="text-gray-600 mt-1">Upload exam results in bulk using a CSV file</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-blue-900">CSV Format Requirements</h3>
                    <div className="text-sm text-blue-800 mt-2 space-y-1">
                      <p>• <strong>Registration Number:</strong> Student's registration number (required)</p>
                      <p>• <strong>Marks Obtained:</strong> Number (0 to {exam?.totalMarks})</p>
                      <p>• <strong>Has Attended:</strong> TRUE or FALSE</p>
                      <p>• <strong>Result:</strong> pass, fail, or absent</p>
                      <p>• <strong>Rank:</strong> Number (optional)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Need a template?</h4>
                  <p className="text-sm text-gray-600">Download a sample CSV file with the correct format</p>
                </div>
                <button
                  onClick={downloadResultsTemplate}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  disabled={uploadingResults}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {uploadingResults && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="text-yellow-800 font-medium">Uploading and processing results...</span>
                </div>
              )}

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-orange-900">Important Notes</h4>
                    <ul className="text-sm text-orange-800 mt-2 space-y-1">
                      <li>• This will update existing student records</li>
                      <li>• Make sure registration numbers match exactly</li>
                      <li>• Invalid rows will be skipped with an error report</li>
                      <li>• Results will be calculated automatically based on passing marks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploadingResults}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}