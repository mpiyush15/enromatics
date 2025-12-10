"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  Award,
  TrendingUp,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  Upload,
  Download,
  Eye,
  UserCheck,
  Clock,
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  description: string;
  registrationCount?: number;
  examDate: string;
  resultDate: string;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  registrationStartDate: string;
  registrationEndDate: string;
  registrationFee: {
    amount: number;
    paymentRequired: boolean;
  };
  isActive: boolean;
  resultsPublished: boolean;
  status: string;
  stats: {
    totalRegistrations: number;
    totalAppearedStudents: number;
    passedStudents: number;
    averageMarks: number;
    highestMarks: number;
  };
  rewards: Array<{
    rankFrom: number;
    rankTo: number;
    rewardType: string;
    rewardValue: number;
    description: string;
  }>;
}

interface RecentRegistration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  currentClass: string;
  enrollmentStatus: string;
  hasAttended: boolean;
  marksObtained?: number;
  result?: string;
  convertedToStudent: boolean;
  createdAt: string;
}

interface ExamDetailsResponse {
  success: boolean;
  exam: Exam;
  recentRegistrations?: RecentRegistration[];
}

export default function ExamDashboard() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;
  const examId = params?.examId as string;

  // ✅ SWR: Auto-caching exam details
  const { data: response, isLoading: loading } = useDashboardData<ExamDetailsResponse>(
    examId ? `/api/scholarship-exams/${examId}` : null
  );

  const exam = response?.exam || null;
  const recentRegistrations = response?.recentRegistrations || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (exam: Exam) => {
    const now = new Date();
    const examDate = new Date(exam.examDate);
    const registrationEndDate = new Date(exam.registrationEndDate);

    if (now < registrationEndDate) {
      return { label: "Registration Open", color: "bg-green-100 text-green-600", icon: CheckCircle };
    } else if (now < examDate) {
      return { label: "Registration Closed", color: "bg-yellow-100 text-yellow-600", icon: AlertCircle };
    } else if (!exam.resultsPublished) {
      return { label: "Exam Completed", color: "bg-blue-100 text-blue-600", icon: CheckCircle };
    } else {
      return { label: "Results Published", color: "bg-purple-100 text-purple-600", icon: Award };
    }
  };

  const quickActions = [
    {
      title: "Manage Students",
      description: "View all registered students with enroll buttons",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
      route: `/dashboard/client/${tenantId}/scholarship-exams/${examId}/students`,
    },
    {
      title: "Test Management",
      description: "Select exam date and manage attendance",
      icon: Clock,
      color: "bg-indigo-500 hover:bg-indigo-600",
      route: `/dashboard/client/${tenantId}/scholarship-exams/${examId}/test-management`,
    },
    {
      title: "View Registrations",
      description: "Detailed view of all registrations",
      icon: FileText,
      color: "bg-green-500 hover:bg-green-600",
      route: `/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`,
    },
    {
      title: "Manage Results",
      description: "Upload and manage exam results",
      icon: BarChart3,
      color: "bg-purple-500 hover:bg-purple-600",
      route: `/dashboard/client/${tenantId}/scholarship-exams/${examId}/results`,
    },
    {
      title: "Edit Exam",
      description: "Update exam details and settings",
      icon: Settings,
      color: "bg-orange-500 hover:bg-orange-600",
      route: `/dashboard/client/${tenantId}/scholarship-exams/${examId}/edit`,
    },
  ];

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
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Found</h2>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(exam);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Scholarship Exams
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{exam.examName}</h1>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                  <StatusIcon size={16} />
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {exam.description} • Code: <span className="font-mono font-semibold">{exam.examCode}</span>
              </p>

              {/* Key Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Exam: {formatDate(exam.examDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award size={16} />
                  <span>Total Marks: {exam.totalMarks}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} />
                  <span>Passing: {exam.passingMarks} marks</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Registration Fee</div>
              <div className="text-2xl font-bold text-gray-900">
                {exam.registrationFee.paymentRequired ? `₹${exam.registrationFee.amount}` : "FREE"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{exam.stats.totalRegistrations}</div>
              <div className="text-sm text-gray-600">
                Total Registered
                {exam.registrationCount && exam.registrationCount > 0 && (
                  <span className="text-xs text-blue-600 ml-1">(Display: {exam.registrationCount})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{exam.stats.totalAppearedStudents}</div>
              <div className="text-sm text-gray-600">Appeared</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{exam.stats.passedStudents}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{exam.stats.averageMarks?.toFixed(1) || 0}</div>
              <div className="text-sm text-gray-600">Average Marks</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <GraduationCap className="text-red-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {recentRegistrations.filter(r => r.convertedToStudent).length}
              </div>
              <div className="text-sm text-gray-600">Converted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(action.route)}
                className={`p-6 rounded-xl text-white text-left transition-colors ${action.color}`}
              >
                <Icon size={32} className="mb-3" />
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
              <button
                onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto text-gray-400 mb-4" size={32} />
                <p className="text-gray-500">No registrations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRegistrations.map((reg) => (
                  <div key={reg._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{reg.studentName}</div>
                      <div className="text-sm text-gray-600">{reg.email} • Class {reg.currentClass}</div>
                      <div className="text-xs text-gray-500 font-mono">{reg.registrationNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{formatDate(reg.createdAt)}</div>
                      <div className="flex gap-1 mt-1">
                        {reg.convertedToStudent ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Student</span>
                        ) : reg.enrollmentStatus === "interested" ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Interested</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Registered</span>
                        )}
                        {reg.result && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reg.result === "pass" ? "bg-green-100 text-green-600" : 
                            reg.result === "fail" ? "bg-red-100 text-red-600" : 
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {reg.result === "pass" ? "Pass" : reg.result === "fail" ? "Fail" : "Absent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rewards Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Scholarship Rewards</h3>
          </div>
          <div className="p-6">
            {exam.rewards.length === 0 ? (
              <div className="text-center py-8">
                <Award className="mx-auto text-gray-400 mb-4" size={32} />
                <p className="text-gray-500">No rewards configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exam.rewards.map((reward, index) => (
                  <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-purple-900">
                          Rank {reward.rankFrom}
                          {reward.rankTo > reward.rankFrom && ` - ${reward.rankTo}`}
                        </div>
                        <div className="text-sm text-purple-700">{reward.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {reward.rewardValue}
                          {reward.rewardType === "percentage" ? "%" : "₹"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}