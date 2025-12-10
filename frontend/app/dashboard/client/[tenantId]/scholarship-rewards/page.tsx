"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  Gift,
  Target,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

interface RewardData {
  _id: string;
  examId: string;
  examName: string;
  examCode: string;
  examDate: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  currentClass: string;
  school: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  rank: number;
  rewardType: string;
  rewardAmount?: number;
  rewardDescription: string;
  status: "pending" | "approved" | "disbursed" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  disbursedAt?: string;
  createdAt: string;
}

interface RewardStats {
  totalRewards: number;
  totalAmount: number;
  pendingRewards: number;
  approvedRewards: number;
  disbursedRewards: number;
  rejectedRewards: number;
  avgRewardAmount: number;
  topRewardAmount: number;
  rewardsByType: { [key: string]: number };
  rewardsByExam: { [key: string]: number };
}

interface RewardsResponse {
  success: boolean;
  rewards: RewardData[];
  stats: RewardStats;
}

export default function ScholarshipRewardsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rewardTypeFilter, setRewardTypeFilter] = useState<string>("all");
  const [examFilter, setExamFilter] = useState<string>("all");

  // Build query string for SWR
  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (rewardTypeFilter !== "all") queryParams.set("rewardType", rewardTypeFilter);
  if (examFilter !== "all") queryParams.set("examId", examFilter);
  if (searchTerm) queryParams.set("search", searchTerm);

  const rewardsUrl = `/api/scholarship-rewards${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  // ✅ SWR: Auto-caching scholarship rewards with dynamic filters
  const { data: response, isLoading: loading } = useDashboardData<RewardsResponse>(
    tenantId ? rewardsUrl : null
  );

  const rewards = response?.rewards || [];
  const stats = response?.stats || null;

  const updateRewardStatus = async (rewardId: string, status: string) => {
    try {
      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(`/api/scholarship-rewards/${rewardId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      
      // Refresh data
      // Note: SWR will auto-refresh via mutation if we add mutate() here
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update reward status");
    }
  };

  const exportRewards = () => {
    if (filteredRewards.length === 0) {
      alert("No rewards to export");
      return;
    }

    const headers = [
      "Exam Name",
      "Student Name",
      "Registration Number",
      "Email",
      "Phone",
      "Class",
      "School",
      "Marks",
      "Percentage",
      "Rank",
      "Reward Type",
      "Reward Amount",
      "Description",
      "Status",
      "Created Date"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRewards.map(reward => [
        reward.examName,
        reward.studentName,
        reward.registrationNumber,
        reward.email,
        reward.phone,
        reward.currentClass,
        reward.school,
        `${reward.marksObtained}/${reward.maxMarks}`,
        reward.percentage.toFixed(2) + "%",
        reward.rank,
        reward.rewardType,
        reward.rewardAmount || "",
        reward.rewardDescription,
        reward.status,
        formatDate(reward.createdAt)
      ].map(field => `"${field}"`).join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scholarship_rewards_${new Date().toISOString().split('T')[0]}.csv`;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Pending" },
      approved: { bg: "bg-blue-100", text: "text-blue-600", label: "Approved" },
      disbursed: { bg: "bg-green-100", text: "text-green-600", label: "Disbursed" },
      rejected: { bg: "bg-red-100", text: "text-red-600", label: "Rejected" },
    };

    const badge = config[status as keyof typeof config];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.rewardType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reward.status === statusFilter;
    const matchesType = rewardTypeFilter === "all" || reward.rewardType === rewardTypeFilter;
    const matchesExam = examFilter === "all" || reward.examId === examFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesExam;
  });

  // Get unique values for filters
  const uniqueRewardTypes = [...new Set(rewards.map(r => r.rewardType))];
  const uniqueExams = [...new Set(rewards.map(r => ({ id: r.examId, name: r.examName })))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards Overview</h1>
          <p className="text-gray-600">Manage and track scholarship rewards and incentives</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Rewards</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRewards}</p>
                </div>
                <Gift className="text-purple-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingRewards}</p>
                </div>
                <Clock className="text-yellow-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Disbursed</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.disbursedRewards}</p>
                </div>
                <CheckCircle className="text-blue-600" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards by Type</h3>
              <div className="space-y-3">
                {Object.entries(stats.rewardsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-600">{type}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRewards}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.approvedRewards}</p>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.disbursedRewards}</p>
                  <p className="text-sm text-gray-500">Disbursed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedRewards}</p>
                  <p className="text-sm text-gray-500">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search students, exams, or rewards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={rewardTypeFilter}
              onChange={(e) => setRewardTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {uniqueRewardTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Exams</option>
              {uniqueExams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
            
            <button
              onClick={exportRewards}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Rewards Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRewards.map((reward) => (
                  <tr key={reward._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{reward.studentName}</div>
                        <div className="text-sm text-gray-500">{reward.registrationNumber}</div>
                        <div className="text-xs text-gray-400">{reward.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{reward.examName}</div>
                        <div className="text-sm text-gray-500">{reward.examCode}</div>
                        <div className="text-xs text-gray-400">{formatDate(reward.examDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {reward.marksObtained}/{reward.maxMarks}
                        </div>
                        <div className="text-sm text-gray-500">{reward.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-purple-600 font-medium">Rank #{reward.rank}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{reward.rewardType}</div>
                        <div className="text-sm text-gray-500 max-w-32 truncate">
                          {reward.rewardDescription}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {reward.rewardAmount ? (
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(reward.rewardAmount)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(reward.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {reward.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateRewardStatus(reward._id, "approved")}
                              className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 text-xs font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateRewardStatus(reward._id, "rejected")}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {reward.status === "approved" && (
                          <button
                            onClick={() => updateRewardStatus(reward._id, "disbursed")}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-xs font-medium"
                          >
                            Mark Disbursed
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${reward.examId}/registrations`)}
                          className="p-1 text-gray-400 hover:text-purple-600"
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
          
          {filteredRewards.length === 0 && (
            <div className="p-12 text-center">
              <Award className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rewards Found</h3>
              <p className="text-gray-600">
                {rewards.length === 0 
                  ? "No rewards have been assigned yet"
                  : "No rewards match your search criteria"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}