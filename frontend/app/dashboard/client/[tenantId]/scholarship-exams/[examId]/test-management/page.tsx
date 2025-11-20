"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  RefreshCw,
  UserCheck,
  Search,
  Filter,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

interface ExamData {
  _id: string;
  examName: string;
  examCode: string;
  examDate: string;
  examDates: string[];
  totalMarks: number;
  passingMarks: number;
}

interface Registration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  currentClass: string;
  school: string;
  preferredExamDate?: string;
  hasAttended: boolean;
  examDateAttended?: string;
  marksObtained?: number;
  result?: "pass" | "fail" | "absent" | "pending";
  createdAt: string;
}

export default function TestManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;

  const [exam, setExam] = useState<ExamData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    fetchData();
  }, [examId]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, selectedDate, searchTerm, attendanceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch exam details
      const examResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        console.log("📅 Exam data fetched:", examData.exam);
        console.log("📅 Available exam dates:", examData.exam.examDates);
        console.log("📅 Single exam date:", examData.exam.examDate);
        
        setExam(examData.exam);
        
        // Set default selected date to the first exam date
        if (examData.exam.examDates && examData.exam.examDates.length > 0) {
          console.log("📅 Setting first exam date:", examData.exam.examDates[0]);
          setSelectedDate(examData.exam.examDates[0]);
        } else if (examData.exam.examDate) {
          console.log("📅 Setting single exam date:", examData.exam.examDate);
          setSelectedDate(examData.exam.examDate);
        } else {
          console.log("❌ No exam dates found in exam data");
        }
      } else {
        console.error("❌ Failed to fetch exam data:", examResponse.status);
      }

      // Fetch registrations
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

  const filterRegistrations = () => {
    let filtered = registrations;

    // Filter by selected date (show students who preferred this date or all if no preference)
    if (selectedDate) {
      filtered = filtered.filter(reg => 
        !reg.preferredExamDate || 
        reg.preferredExamDate === selectedDate ||
        (reg.examDateAttended && reg.examDateAttended === selectedDate)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm)
      );
    }

    // Filter by attendance status
    if (attendanceFilter === "present") {
      filtered = filtered.filter(reg => reg.hasAttended && reg.examDateAttended === selectedDate);
    } else if (attendanceFilter === "absent") {
      filtered = filtered.filter(reg => !reg.hasAttended || reg.examDateAttended !== selectedDate);
    }

    setFilteredRegistrations(filtered);
  };

  const updateAttendance = async (registrationId: string, attended: boolean) => {
    try {
      console.log("🔄 Updating attendance:", { 
        registrationId, 
        attended, 
        selectedDate, 
        apiUrl: `${API_URL}/api/scholarship-exams/registration/${registrationId}/attendance` 
      });
      
      if (!selectedDate) {
        alert("Please select an exam date first");
        return false;
      }
      
      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registrationId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hasAttended: attended,
          examDateAttended: attended ? selectedDate : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        throw new Error(errorData.message || `Failed to update attendance (${response.status})`);
      }

      const data = await response.json();
      console.log("Attendance updated successfully:", data);

      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg._id === registrationId
            ? { 
                ...reg, 
                hasAttended: attended,
                examDateAttended: attended ? selectedDate : undefined,
              }
            : reg
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert(`Failed to update attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleBulkAttendance = async (markAsPresent: boolean) => {
    if (selectedStudents.length === 0) {
      alert("Please select students first");
      return;
    }

    setSaving(true);
    try {
      const promises = selectedStudents.map(studentId =>
        updateAttendance(studentId, markAsPresent)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      
      alert(`Successfully updated attendance for ${successCount} students`);
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error updating bulk attendance:", error);
      alert("Failed to update attendance");
    } finally {
      setSaving(false);
    }
  };

  const exportAttendance = () => {
    const csvContent = [
      ["Date", "Registration Number", "Student Name", "Email", "Phone", "Class", "School", "Attendance Status"].join(","),
      ...filteredRegistrations.map(reg => [
        formatDate(selectedDate),
        reg.registrationNumber,
        reg.studentName,
        reg.email,
        reg.phone,
        reg.currentClass,
        reg.school,
        (reg.hasAttended && reg.examDateAttended === selectedDate) ? "Present" : "Absent"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam?.examCode}_attendance_${selectedDate?.split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvailableDates = () => {
    if (!exam) {
      console.log("📅 No exam data available for dates");
      return [];
    }
    
    console.log("📅 Getting available dates from exam:", {
      examDates: exam.examDates,
      examDate: exam.examDate,
      examDatesLength: exam.examDates?.length
    });
    
    if (exam.examDates && exam.examDates.length > 0) {
      console.log("📅 Returning examDates:", exam.examDates);
      return exam.examDates;
    } else if (exam.examDate) {
      console.log("📅 Returning single examDate:", [exam.examDate]);
      return [exam.examDate];
    }
    
    console.log("❌ No dates available");
    return [];
  };

  const getAttendanceStats = () => {
    const totalStudents = filteredRegistrations.length;
    const presentStudents = filteredRegistrations.filter(reg => 
      reg.hasAttended && reg.examDateAttended === selectedDate
    ).length;
    const absentStudents = totalStudents - presentStudents;
    
    return {
      total: totalStudents,
      present: presentStudents,
      absent: absentStudents,
      percentage: totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : "0",
    };
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

  const availableDates = getAvailableDates();
  const stats = getAttendanceStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
            <p className="text-gray-600">{exam.examName} - {exam.examCode}</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Debug: Selected Date: {selectedDate || 'None'} | Available Dates: {availableDates.length}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportAttendance}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={20} />
              Export Attendance
            </button>
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Select Exam Date
        </h2>
        
        {availableDates.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={32} />
            <p className="text-gray-500">No exam dates configured</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedDate === date
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{formatDate(date)}</div>
                  <div className="text-sm text-gray-500">{formatTime(date)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedDate && availableDates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-800">Please Select an Exam Date</h3>
              <p className="text-yellow-700">Choose an exam date above to view and manage student attendance.</p>
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <>
          {/* Current Selected Date Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <h3 className="font-semibold text-blue-800">Managing Attendance For:</h3>
                <p className="text-blue-700">{formatDate(selectedDate)} at {formatTime(selectedDate)}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.present}</div>
                  <div className="text-sm text-gray-600">Present</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.absent}</div>
                  <div className="text-sm text-gray-600">Absent</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCheck className="text-purple-600" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.percentage}%</div>
                  <div className="text-sm text-gray-600">Attendance Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, registration number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-700">
                  {selectedStudents.length} students selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAttendance(true)}
                    disabled={saving}
                    className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Updating..." : "Mark Present"}
                  </button>
                  <button
                    onClick={() => handleBulkAttendance(false)}
                    disabled={saving}
                    className="px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Updating..." : "Mark Absent"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Table */}
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student Details</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Academic Info</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preferred Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Attendance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((registration) => {
                    const isPresent = registration.hasAttended && registration.examDateAttended === selectedDate;
                    
                    return (
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
                            <p className="text-sm text-gray-600">{registration.email}</p>
                            <p className="text-sm text-gray-600">{registration.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Class: {registration.currentClass}</p>
                            <p className="text-sm text-gray-500">{registration.school}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {registration.preferredExamDate 
                              ? formatDate(registration.preferredExamDate)
                              : "No preference"
                            }
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              isPresent 
                                ? "bg-green-100 text-green-600" 
                                : "bg-red-100 text-red-600"
                            }`}>
                              {isPresent ? (
                                <>
                                  <CheckCircle size={12} />
                                  Present
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} />
                                  Absent
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateAttendance(registration._id, !isPresent)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                isPresent
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {isPresent ? "Mark Absent" : "Mark Present"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No students found for the selected criteria</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}