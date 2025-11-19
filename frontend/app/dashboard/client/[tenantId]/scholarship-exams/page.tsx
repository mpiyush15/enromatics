"use client";

import React, { useState, useEffect } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Filter, Calendar, Users, Award, TrendingUp, Eye, Edit2, Trash2, ExternalLink, Copy, CheckCircle } from "lucide-react";

interface Reward {
  rankFrom: number;
  rankTo: number;
  rewardType: string;
  rewardValue: number;
  description: string;
}

interface ExamStats {
  totalRegistrations: number;
  totalAppeared: number;
  totalPassed: number;
  totalEnrolled: number;
  passPercentage: number;
  conversionRate: number;
}

interface ScholarshipExam {
  _id: string;
  examName: string;
  examCode: string;
  description: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examDate: string;
  examDates?: string[];
  resultDate: string;
  examDuration: number;
  totalMarks: number;
  passingMarks: number;
  examMode: "online" | "offline" | "hybrid";
  venue?: string;
  registrationFee: number;
  rewards: Reward[];
  status: "draft" | "active" | "registrationClosed" | "examCompleted" | "resultPublished" | "archived";
  stats: ExamStats;
  createdAt: string;
  updatedAt: string;
}

export default function ScholarshipExamsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;

  const [exams, setExams] = useState<ScholarshipExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch exams
  useEffect(() => {
    fetchExams();
  }, [tenantId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/scholarship-exams?tenantId=${tenantId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch exams");

      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      alert("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate stats
  const aggregateStats = exams.reduce(
    (acc, exam) => ({
      totalRegistrations: acc.totalRegistrations + (exam.stats?.totalRegistrations || 0),
      totalAppeared: acc.totalAppeared + (exam.stats?.totalAppeared || 0),
      totalPassed: acc.totalPassed + (exam.stats?.totalPassed || 0),
      totalEnrolled: acc.totalEnrolled + (exam.stats?.totalEnrolled || 0),
    }),
    { totalRegistrations: 0, totalAppeared: 0, totalPassed: 0, totalEnrolled: 0 }
  );

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
      active: { bg: "bg-green-100", text: "text-green-600", label: "Active" },
      registrationClosed: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Reg. Closed" },
      examCompleted: { bg: "bg-blue-100", text: "text-blue-600", label: "Completed" },
      resultPublished: { bg: "bg-purple-100", text: "text-purple-600", label: "Results Out" },
      archived: { bg: "bg-gray-100", text: "text-gray-400", label: "Archived" },
    };

    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (examId: string, examName: string) => {
    if (!confirm(`Are you sure you want to delete "${examName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete exam");

      alert("Exam deleted successfully");
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam");
    }
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
      <div className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scholarship Entrance Exams</h1>
            <p className="text-gray-600 mt-1">Manage scholarship tests, registrations, and admissions</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/create`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create New Exam
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{aggregateStats.totalRegistrations}</h3>
          <p className="text-sm text-gray-600">Total Registrations</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{aggregateStats.totalAppeared}</h3>
          <p className="text-sm text-gray-600">Students Appeared</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{aggregateStats.totalPassed}</h3>
          <p className="text-sm text-gray-600">Students Passed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{aggregateStats.totalEnrolled}</h3>
          <p className="text-sm text-gray-600">Converted to Students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by exam name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="registrationClosed">Registration Closed</option>
              <option value="examCompleted">Exam Completed</option>
              <option value="resultPublished">Result Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Found</h3>
          <p className="text-gray-600 mb-6">
            {exams.length === 0
              ? "Get started by creating your first scholarship entrance exam"
              : "No exams match your search criteria"}
          </p>
          {exams.length === 0 && (
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/create`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Your First Exam
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{exam.examName}</h3>
                    {getStatusBadge(exam.status)}
                  </div>
                  <p className="text-gray-600 mb-3">{exam.description}</p>

                  {/* Exam Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Exam Code</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-semibold text-blue-600">{exam.examCode}</p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/exam/${exam.examCode}`,
                              exam.examCode
                            )
                          }
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copy exam URL"
                        >
                          {copiedCode === exam.examCode ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Exam Date{exam.examDates && exam.examDates.length > 1 ? 's' : ''}</p>
                      {exam.examDates && exam.examDates.length > 0 ? (
                        <div className="font-semibold text-gray-900">
                          {exam.examDates.slice(0, 2).map((date, idx) => (
                            <div key={idx}>{formatDate(date)}</div>
                          ))}
                          {exam.examDates.length > 2 && (
                            <div className="text-xs text-blue-600">+{exam.examDates.length - 2} more</div>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-900">{formatDate(exam.examDate)}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Registration</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(exam.registrationStartDate)} - {formatDate(exam.registrationEndDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mode</p>
                      <p className="font-semibold text-gray-900 capitalize">{exam.examMode}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Registrations:</span>{" "}
                      <span className="font-semibold text-gray-900">{exam.stats?.totalRegistrations || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Appeared:</span>{" "}
                      <span className="font-semibold text-gray-900">{exam.stats?.totalAppeared || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Passed:</span>{" "}
                      <span className="font-semibold text-gray-900">{exam.stats?.totalPassed || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Enrolled:</span>{" "}
                      <span className="font-semibold text-orange-600 font-bold">{exam.stats?.totalEnrolled || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/client/${tenantId}/scholarship-exams/${exam._id}/registrations`)
                    }
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Registrations"
                  >
                    <Users size={20} />
                  </button>

                  <button
                    onClick={() => window.open(`/exam/${exam.examCode}`, "_blank")}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="View Landing Page"
                  >
                    <ExternalLink size={20} />
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/dashboard/client/${tenantId}/scholarship-exams/${exam._id}/edit`)
                    }
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Exam"
                  >
                    <Edit2 size={20} />
                  </button>

                  <button
                    onClick={() => handleDelete(exam._id, exam.examName)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Exam"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Rewards Preview */}
              {exam.rewards && exam.rewards.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Rewards/Scholarships:</p>
                  <div className="flex flex-wrap gap-2">
                    {exam.rewards.slice(0, 3).map((reward, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                        Rank {reward.rankFrom}
                        {reward.rankTo > reward.rankFrom && `-${reward.rankTo}`}: {reward.rewardValue}
                        {reward.rewardType === "percentage" ? "%" : "₹"}
                      </span>
                    ))}
                    {exam.rewards.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{exam.rewards.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
