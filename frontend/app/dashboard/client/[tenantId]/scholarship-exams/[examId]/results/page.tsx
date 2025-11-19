"use client";

import React, { useState, useEffect } from "react";
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrations</h2>
        <p className="text-gray-600">
          Total Registrations: {registrations.length}
        </p>
        
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found for this exam</p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="grid gap-4">
              {registrations.map((registration) => (
                <div key={registration._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{registration.studentName}</h3>
                      <p className="text-sm text-gray-500">{registration.email}</p>
                      <p className="text-sm text-gray-500 font-mono">{registration.registrationNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        registration.status === "registered" 
                          ? "bg-blue-100 text-blue-600"
                          : registration.status === "approved"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {registration.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}