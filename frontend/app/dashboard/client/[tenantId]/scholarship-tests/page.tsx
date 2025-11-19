"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  TrendingUp,
  Award,
  AlertCircle,
  UserCheck,
  BookOpen,
} from "lucide-react";

interface ExamRegistration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  currentClass: string;
  school: string;
  hasAttended: boolean;
  marksObtained?: number;
  result?: "pass" | "fail" | "absent" | "pending";
  status: "registered" | "approved" | "appeared" | "resultPublished";
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  examDate: string;
  examTime: string;
  duration: number;
  venue: string;
  venueAddress: string;
  description: string;
  eligibilityCriteria: string[];
  maxMarks: number;
  passingMarks: number;
  fees: number;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  registrationDeadline: string;
  stats: {
    totalRegistrations: number;
    totalAppeared: number;
    totalPassed: number;
    totalFailed: number;
    totalAbsent: number;
    passPercentage: number;
    avgMarks: number;
  };
  createdAt: string;
}

export default function ScholarshipTestsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");

  useEffect(() => {
    fetchExams();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (examId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(`${API_URL}/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const handleViewTest = async (exam: Exam) => {
    setSelectedExam(exam);
    await fetchRegistrations(exam._id);
  };

  const markAttendance = async (registrationId: string, attended: boolean) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registrationId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hasAttended: attended }),
      });

      if (!response.ok) throw new Error("Failed to update attendance");
      
      // Refresh registrations
      if (selectedExam) {
        await fetchRegistrations(selectedExam._id);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
      published: { bg: "bg-blue-100", text: "text-blue-600", label: "Published" },
      ongoing: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Ongoing" },
      completed: { bg: "bg-green-100", text: "text-green-600", label: "Completed" },
      cancelled: { bg: "bg-red-100", text: "text-red-600", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const matchesAttendance = attendanceFilter === "all" || 
                             (attendanceFilter === "attended" && reg.hasAttended) ||
                             (attendanceFilter === "absent" && !reg.hasAttended);
    
    return matchesSearch && matchesStatus && matchesAttendance;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scholarship tests...</p>
        </div>
      </div>
    );
  }

  if (selectedExam) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedExam(null)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
            >
              ← Back to Tests
            </button>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedExam.examName}</h1>
                  <p className="text-gray-600 mt-1">{selectedExam.examCode}</p>
                </div>
                {getStatusBadge(selectedExam.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(selectedExam.examDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{formatTime(selectedExam.examTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Venue</p>
                    <p className="font-medium">{selectedExam.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Registrations</p>
                    <p className="font-medium">{selectedExam.stats.totalRegistrations}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Total Appeared</p>
                  <p className="text-2xl font-bold text-blue-700">{selectedExam.stats.totalAppeared}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Passed</p>
                  <p className="text-2xl font-bold text-green-700">{selectedExam.stats.totalPassed}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{selectedExam.stats.totalFailed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-gray-700">{selectedExam.stats.totalAbsent}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Pass %</p>
                  <p className="text-2xl font-bold text-purple-700">{selectedExam.stats.passPercentage.toFixed(1)}%</p>
                </div>
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
                    placeholder="Search students..."
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
                <option value="registered">Registered</option>
                <option value="appeared">Appeared</option>
                <option value="resultPublished">Result Published</option>
              </select>
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Attendance</option>
                <option value="attended">Attended</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{reg.studentName}</div>
                          <div className="text-xs text-gray-500 font-mono">{reg.registrationNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{reg.email}</div>
                          <div className="text-gray-500">{reg.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">Class {reg.currentClass}</div>
                          <div className="text-gray-500 truncate max-w-32">{reg.school}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          reg.status === 'appeared' ? 'bg-green-100 text-green-600' :
                          reg.status === 'registered' ? 'bg-blue-100 text-blue-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {reg.hasAttended ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={16} />
                              Present
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle size={16} />
                              Absent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {reg.marksObtained !== undefined ? (
                          <div className="text-sm">
                            <div className="font-medium">{reg.marksObtained}/{selectedExam.maxMarks}</div>
                            <div className={`text-xs ${
                              reg.result === 'pass' ? 'text-green-600' :
                              reg.result === 'fail' ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {reg.result || 'Pending'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not evaluated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markAttendance(reg._id, !reg.hasAttended)}
                            className={`px-3 py-1 text-xs rounded-lg font-medium ${
                              reg.hasAttended 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            {reg.hasAttended ? 'Mark Absent' : 'Mark Present'}
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${selectedExam._id}/registrations/${reg._id}`)}
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
            
            {filteredRegistrations.length === 0 && (
              <div className="p-12 text-center">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-600">No students match your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Test Management</h1>
          <p className="text-gray-600">Manage offline scholarship tests, track attendance, and view test details</p>
        </div>

        {/* Tests Grid */}
        {exams.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Found</h3>
            <p className="text-gray-600 mb-6">Create your first scholarship test to get started</p>
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/create`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Create Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.examName}</h3>
                    <p className="text-sm text-gray-500">{exam.examCode}</p>
                  </div>
                  {getStatusBadge(exam.status)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    {formatDate(exam.examDate)} at {formatTime(exam.examTime)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    {exam.venue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    {exam.stats.totalRegistrations} students registered
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{exam.stats.totalAppeared}</p>
                    <p className="text-xs text-gray-500">Appeared</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{exam.stats.totalPassed}</p>
                    <p className="text-xs text-gray-500">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600">{exam.stats.passPercentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Pass Rate</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewTest(exam)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${exam._id}/registrations`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Registrations
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}