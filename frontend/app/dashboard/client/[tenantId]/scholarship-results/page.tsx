"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Upload,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Eye,
  RefreshCw,
  BarChart3,
} from "lucide-react";

interface ExamResult {
  _id: string;
  examId: string;
  examName: string;
  examCode: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  currentClass: string;
  school: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  rank: number;
  result: "pass" | "fail" | "absent";
  rewardEligible: boolean;
  rewardDetails?: {
    type: string;
    amount?: number;
    description: string;
  };
  uploadedAt: string;
  updatedAt: string;
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  stats: {
    totalRegistrations: number;
    totalAppeared: number;
    totalPassed: number;
    totalFailed: number;
    passPercentage: number;
    avgMarks: number;
    topScore: number;
  };
}

export default function ScholarshipResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [rewardFilter, setRewardFilter] = useState<string>("all");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExams();
    fetchResults();
  }, [tenantId]);

  const fetchExams = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(`${API_URL}/api/scholarship-exams?tenantId=${tenantId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch exams");
      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchResults = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const url = selectedExam === "all" 
        ? `${API_URL}/api/scholarship-results?tenantId=${tenantId}`
        : `${API_URL}/api/scholarship-results?tenantId=${tenantId}&examId=${selectedExam}`;
      
      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file to upload");
      return;
    }

    if (selectedExam === "all") {
      alert("Please select a specific exam for uploading results");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("examId", selectedExam);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(`${API_URL}/api/scholarship-results/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload results");
      }

      alert("Results uploaded successfully!");
      setUploadFile(null);
      fetchResults();
    } catch (error) {
      console.error("Error uploading results:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      "Registration Number",
      "Student Name",
      "Marks Obtained",
      "Attendance (Present/Absent)",
      "Reward Type (Optional)",
      "Reward Amount (Optional)",
      "Reward Description (Optional)"
    ];
    
    const csvContent = headers.join(",") + "\n" +
                      "REG001,John Doe,85,Present,Scholarship,5000,Merit Scholarship\n" +
                      "REG002,Jane Smith,78,Present,,,,\n" +
                      "REG003,Bob Johnson,0,Absent,,,";
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    if (filteredResults.length === 0) {
      alert("No results to export");
      return;
    }

    const headers = [
      "Exam Name",
      "Registration Number", 
      "Student Name",
      "Email",
      "Phone",
      "Class",
      "School",
      "Marks Obtained",
      "Max Marks",
      "Percentage",
      "Rank",
      "Result",
      "Reward Eligible",
      "Reward Type",
      "Reward Description"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredResults.map(result => [
        result.examName,
        result.registrationNumber,
        result.studentName,
        result.email,
        result.phone,
        result.currentClass,
        result.school,
        result.marksObtained,
        result.maxMarks,
        result.percentage.toFixed(2),
        result.rank,
        result.result,
        result.rewardEligible ? "Yes" : "No",
        result.rewardDetails?.type || "",
        result.rewardDetails?.description || ""
      ].map(field => `"${field}"`).join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scholarship_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getResultBadge = (result: string) => {
    const config = {
      pass: { bg: "bg-green-100", text: "text-green-600", label: "Pass" },
      fail: { bg: "bg-red-100", text: "text-red-600", label: "Fail" },
      absent: { bg: "bg-gray-100", text: "text-gray-600", label: "Absent" },
    };

    const badge = config[result as keyof typeof config];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.examName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResult = resultFilter === "all" || result.result === resultFilter;
    const matchesReward = rewardFilter === "all" || 
                         (rewardFilter === "eligible" && result.rewardEligible) ||
                         (rewardFilter === "not_eligible" && !result.rewardEligible);
    
    return matchesSearch && matchesResult && matchesReward;
  });

  // Calculate stats
  const stats = {
    totalResults: results.length,
    passCount: results.filter(r => r.result === "pass").length,
    failCount: results.filter(r => r.result === "fail").length,
    absentCount: results.filter(r => r.result === "absent").length,
    rewardEligibleCount: results.filter(r => r.rewardEligible).length,
    avgMarks: results.length > 0 ? results.reduce((sum, r) => sum + r.marksObtained, 0) / results.length : 0,
    topScore: results.length > 0 ? Math.max(...results.map(r => r.marksObtained)) : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Results Management</h1>
          <p className="text-gray-600">Upload, manage, and analyze scholarship exam results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Results</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResults}</p>
              </div>
              <BarChart3 className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pass Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalResults > 0 ? ((stats.passCount / stats.totalResults) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reward Eligible</p>
                <p className="text-3xl font-bold text-purple-600">{stats.rewardEligibleCount}</p>
              </div>
              <Award className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Top Score</p>
                <p className="text-3xl font-bold text-blue-600">{stats.topScore}</p>
              </div>
              <Award className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Results</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Exams</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.examName} ({exam.examCode})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || selectedExam === "all" || uploading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download size={16} />
              Download Template
            </button>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <AlertCircle size={16} />
              Supported formats: CSV, Excel (.xlsx, .xls)
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search students, exams, or registration numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="absent">Absent</option>
            </select>
            <select
              value={rewardFilter}
              onChange={(e) => setRewardFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Rewards</option>
              <option value="eligible">Reward Eligible</option>
              <option value="not_eligible">Not Eligible</option>
            </select>
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{result.studentName}</div>
                        <div className="text-sm text-gray-500">{result.registrationNumber}</div>
                        <div className="text-xs text-gray-400">{result.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{result.examName}</div>
                        <div className="text-sm text-gray-500">{result.examCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {result.marksObtained}/{result.maxMarks}
                        </div>
                        <div className="text-sm text-gray-500">{result.percentage.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getResultBadge(result.result)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-purple-600">#{result.rank}</div>
                    </td>
                    <td className="px-6 py-4">
                      {result.rewardEligible ? (
                        <div>
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <Award size={16} />
                            Eligible
                          </span>
                          {result.rewardDetails && (
                            <div className="text-xs text-gray-500 mt-1">
                              {result.rewardDetails.type}
                              {result.rewardDetails.amount && ` - ₹${result.rewardDetails.amount}`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not Eligible</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${result.examId}/registrations`)}
                        className="p-2 text-gray-400 hover:text-purple-600"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredResults.length === 0 && (
            <div className="p-12 text-center">
              <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">
                {results.length === 0 
                  ? "Upload result files to see student performance data"
                  : "No results match your search criteria"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}