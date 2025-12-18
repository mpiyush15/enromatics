"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  course: string;
  batch: string;
}

interface AttendanceRecord {
  studentId: string;
  present: boolean;
  remarks: string;
}

interface Test {
  _id: string;
  name: string;
  subject: string;
  course: string;
  batch?: string;
  date: string;
  testDate: string;
  totalMarks: number;
}

interface AttendanceApiRecord {
  studentId: { _id: string } | string;
  present: boolean;
  remarks?: string;
}

export default function TestAttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const searchParams = useSearchParams();
  const testId = searchParams?.get("testId");

  const [test, setTest] = useState<Test | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all");

  const fetchTestAndStudents = async () => {
    try {
      // Fetch test details via BFF with cookie auth using the correct endpoint
      console.log('📤 Fetching test:', testId);
      const testRes = await fetch(`/api/academics/tests/${testId}`, {
        credentials: "include",
      });
      const testData = await testRes.json();
      console.log('📥 Test response:', testRes.status, testData);
      
      if (!testRes.ok) {
        setStatus(`❌ Failed to load test: ${testData.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      if (testData.test) {
        const testDetails = testData.test;
        setTest(testDetails);

        // Fetch students for this course/batch via BFF with cookie auth
        const studentsRes = await fetch(
          `/api/students?course=${testDetails.course}${testDetails.batch ? `&batch=${testDetails.batch}` : ""}`,
          { credentials: "include" }
        );
        const studentsData = await studentsRes.json();
        if (studentsRes.ok) {
          setStudents(studentsData.students || []);

          // Fetch existing attendance via BFF with cookie auth
          const attendanceRes = await fetch(
            `/api/academics/attendance?testId=${testId}`,
            { credentials: "include" }
          );
          const attendanceData = await attendanceRes.json();
          if (attendanceRes.ok) {
            const attendanceMap = new Map();
            attendanceData.attendance.forEach((record: AttendanceApiRecord) => {
              const studentId = typeof record.studentId === 'string' ? record.studentId : record.studentId._id;
              attendanceMap.set(studentId, {
                studentId,
                present: record.present,
                remarks: record.remarks || "",
              });
            });
            setAttendance(attendanceMap);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setStatus("❌ Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      setStatus("❌ No test selected. Please select a test from Test Schedules.");
      return;
    }
    if (user && testId) {
      fetchTestAndStudents();
    }
  }, [user, testId, fetchTestAndStudents]);

  const toggleAttendance = (studentId: string) => {
    const newAttendance = new Map(attendance);
    const current = newAttendance.get(studentId);
    // If no record exists, default to false (absent), then toggle to true (present)
    const currentPresent = current?.present ?? false;
    newAttendance.set(studentId, {
      studentId,
      present: !currentPresent,
      remarks: current?.remarks || "",
    });
    setAttendance(newAttendance);
  };

  const updateRemarks = (studentId: string, remarks: string) => {
    const newAttendance = new Map(attendance);
    const current = newAttendance.get(studentId);
    newAttendance.set(studentId, {
      studentId,
      present: current?.present || false,
      remarks,
    });
    setAttendance(newAttendance);
  };

  const handleSelectAll = () => {
    const newAttendance = new Map(attendance);
    students.forEach((student) => {
      newAttendance.set(student._id, {
        studentId: student._id,
        present: !selectAll,
        remarks: attendance.get(student._id)?.remarks || "",
      });
    });
    setAttendance(newAttendance);
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    setStatus("Saving attendance...");
    try {
      const attendanceData = students.map((student) => {
        const record = attendance.get(student._id);
        return {
          studentId: student._id,
          present: record?.present || false,
          remarks: record?.remarks || "",
        };
      });

      const res = await fetch(`/api/academics/attendance?testId=${testId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("✅ Attendance saved successfully!");
      setTimeout(() => {
        router.push(`/dashboard/client/${tenantId}/academics/schedules`);
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save attendance";
      setStatus("❌ " + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <TableSkeleton rows={8} />
        </div>
      </div>
    );
  }

  if (!testId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-red-600 text-xl mb-4">No test selected</p>
          <p className="text-gray-600 mb-6">Please select a test from Test Schedules to mark attendance.</p>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/academics/schedules`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
          >
            Go to Test Schedules
          </button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Test not found</p>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/academics/schedules`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Schedules
          </button>
        </div>
      </div>
    );
  }

  // Get unique batches for filter
  const uniqueBatches = Array.from(new Set(students.map(s => s.batch).filter(Boolean)));
  
  // Filtered students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterBatch !== "all" && student.batch !== filterBatch) return false;
    
    if (filterStatus === "all") return true;
    const record = attendance.get(student._id);
    if (filterStatus === "present") return record?.present === true;
    if (filterStatus === "absent") return record?.present === false;
    return true;
  });

  const presentCount = Array.from(attendance.values()).filter((r) => r.present).length;
  const absentCount = students.length - presentCount;
  const presentPercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const markAllPresent = () => {
    const newAttendance = new Map(attendance);
    filteredStudents.forEach((student) => {
      newAttendance.set(student._id, {
        studentId: student._id,
        present: true,
        remarks: attendance.get(student._id)?.remarks || "",
      });
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance = new Map(attendance);
    filteredStudents.forEach((student) => {
      newAttendance.set(student._id, {
        studentId: student._id,
        present: false,
        remarks: attendance.get(student._id)?.remarks || "",
      });
    });
    setAttendance(newAttendance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/academics/schedules`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Test Schedules</span>
          </button>

          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">✅ Mark Attendance</h1>
            <p className="text-blue-100 mb-4">{test.name} - {test.subject}</p>
            <div className="flex gap-4 text-sm">
              <span>📅 {new Date(test.testDate).toLocaleDateString()}</span>
              <span>📚 {test.course} {test.batch && `- ${test.batch}`}</span>
              <span>📊 {presentPercentage}% Present</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl font-semibold ${
            status.includes("✅") 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}>
            {status}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Present</p>
                <p className="text-3xl font-bold">{presentCount}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Absent</p>
                <p className="text-3xl font-bold">{absentCount}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Attendance Rate</p>
                <p className="text-3xl font-bold">{presentPercentage}%</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">🔍 Search Student</label>
              <input
                type="text"
                placeholder="Search by name, roll number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">📚 Filter by Batch</label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="all">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">📊 Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "present" | "absent")}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="all">All Students</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={markAllPresent}
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors"
            >
              ✗ Mark All Absent
            </button>
            <button
              onClick={handleSelectAll}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
            >
              {selectAll ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={handleSubmit}
              className="ml-auto px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg transition-all"
            >
              💾 Save Attendance
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Student List <span className="text-gray-500 text-lg">({filteredStudents.length} students)</span></h2>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-16 text-center">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No students found</p>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Roll No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((student) => {
                    const record = attendance.get(student._id);
                    const isPresent = record?.present ?? false;

                    return (
                      <tr key={student._id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{student.rollNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-lg">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
                            {student.batch || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleAttendance(student._id)}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-md ${
                              isPresent
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                                : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                            }`}
                          >
                            {isPresent ? "✓ Present" : "✗ Absent"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Add remarks..."
                            value={record?.remarks || ""}
                            onChange={(e) => updateRemarks(student._id, e.target.value)}
                            className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-sm transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
