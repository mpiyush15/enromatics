"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

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

  const fetchTestAndStudents = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch test details via BFF
      const testRes = await fetch(`/api/academics/tests?testId=${testId}`, {
        headers,
      });
      const testData = await testRes.json();
      if (testRes.ok) {
        setTest(testData.test);

        // Fetch students for this course/batch via BFF
        const studentsRes = await fetch(
          `/api/students?course=${testData.test.course}${testData.test.batch ? `&batch=${testData.test.batch}` : ""}`,
          { headers }
        );
        const studentsData = await studentsRes.json();
        if (studentsRes.ok) {
          setStudents(studentsData.students || []);

          // Fetch existing attendance via BFF
          const attendanceRes = await fetch(
            `/api/academics/attendance?testId=${testId}`,
            { headers }
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
    newAttendance.set(studentId, {
      studentId,
      present: current ? !current.present : true,
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

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
        headers,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading attendance...</p>
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

  const presentCount = Array.from(attendance.values()).filter((r) => r.present).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/academics/schedules`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Student List</h2>
            <div className="flex gap-4">
              <button
                onClick={handleSelectAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
              >
                {selectAll ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
              >
                💾 Save Attendance
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No students found for this course/batch</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Roll No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Student Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Email</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase">Attendance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => {
                    const record = attendance.get(student._id);
                    const isPresent = record?.present || false;

                    return (
                      <tr key={student._id} className="hover:bg-blue-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 font-semibold">{student.rollNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleAttendance(student._id)}
                            className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
                              isPresent
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-red-600 text-white hover:bg-red-700"
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
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-sm"
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
