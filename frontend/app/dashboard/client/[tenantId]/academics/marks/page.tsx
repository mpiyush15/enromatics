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

interface MarksRecord {
  studentId: string;
  marksObtained: number;
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
  passingMarks: number;
}

interface AttendanceApiRecord {
  studentId: { _id: string } | string;
  present: boolean;
}

interface MarksApiRecord {
  studentId: { _id: string } | string;
  marksObtained: number;
  remarks?: string;
}

export default function MarksEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const searchParams = useSearchParams();
  const testId = searchParams?.get("testId");

  const [test, setTest] = useState<Test | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Map<string, MarksRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchTestAndStudents = async () => {
    try {
      // Fetch test details via BFF with cookie auth
      const testRes = await fetch(`/api/academics/tests?testId=${testId}`, {
        credentials: "include",
      });
      const testData = await testRes.json();
      if (testRes.ok && testData.test) {
        const testDetails = testData.test;
        setTest(testDetails);

        // Fetch attendance via BFF with cookie auth
        const attendanceRes = await fetch(
          `/api/academics/attendance?testId=${testId}`,
          { credentials: "include" }
        );
        const attendanceData = await attendanceRes.json();
        
        if (attendanceRes.ok && attendanceData.attendance) {
          const presentStudentIds = new Set<string>(
            attendanceData.attendance
              .filter((record: AttendanceApiRecord) => record.present)
              .map((record: AttendanceApiRecord) => {
                const studentId = typeof record.studentId === 'string' ? record.studentId : record.studentId._id;
                return studentId;
              })
          );

          // Only fetch students who were present
          if (presentStudentIds.size > 0) {
            const studentsRes = await fetch(
              `/api/students?course=${testDetails.course}${testDetails.batch ? `&batch=${testDetails.batch}` : ""}`,
              { credentials: "include" }
            );
            const studentsData = await studentsRes.json();
            if (studentsRes.ok) {
              // Filter to only show present students
              const filteredStudents = (studentsData.students || []).filter((student: Student) => 
                presentStudentIds.has(student._id)
              );
              setStudents(filteredStudents);

              // Fetch existing marks via BFF with cookie auth
              const marksRes = await fetch(
                `/api/academics/marks?testId=${testId}`,
                { credentials: "include" }
              );
              const marksData = await marksRes.json();
              if (marksRes.ok) {
                const marksMap = new Map();
                marksData.marks.forEach((record: MarksApiRecord) => {
                  const studentId = typeof record.studentId === 'string' ? record.studentId : record.studentId._id;
                  marksMap.set(studentId, {
                    studentId,
                    marksObtained: record.marksObtained,
                    remarks: record.remarks || "",
                  });
                });
                setMarks(marksMap);
              }
            }
          } else {
            setStatus("ℹ️ No students marked present for this test. Please mark attendance first.");
          }
        } else {
          setStatus("ℹ️ No attendance records found. Please mark attendance first.");
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

  const updateMarks = (studentId: string, marksObtained: number) => {
    const newMarks = new Map(marks);
    const current = newMarks.get(studentId);
    newMarks.set(studentId, {
      studentId,
      marksObtained,
      remarks: current?.remarks || "",
    });
    setMarks(newMarks);
  };

  const updateRemarks = (studentId: string, remarks: string) => {
    const newMarks = new Map(marks);
    const current = newMarks.get(studentId);
    newMarks.set(studentId, {
      studentId,
      marksObtained: current?.marksObtained || 0,
      remarks,
    });
    setMarks(newMarks);
  };

  const calculateGrade = (marksObtained: number) => {
    if (!test) return "-";
    const percentage = (marksObtained / test.totalMarks) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const calculatePercentage = (marksObtained: number) => {
    if (!test) return 0;
    return ((marksObtained / test.totalMarks) * 100).toFixed(2);
  };

  const isPassed = (marksObtained: number) => {
    if (!test) return false;
    return marksObtained >= test.passingMarks;
  };

  const handleSubmit = async () => {
    setStatus("Saving marks...");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const marksData = students.map((student) => {
        const record = marks.get(student._id);
        return {
          studentId: student._id,
          marksObtained: record?.marksObtained || 0,
          remarks: record?.remarks || "",
        };
      });

      const res = await fetch(`/api/academics/marks?testId=${testId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ marksData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("✅ Marks saved successfully!");
      setTimeout(() => {
        router.push(`/dashboard/client/${tenantId}/academics/schedules`);
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save marks";
      setStatus("❌ " + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading marks entry...</p>
        </div>
      </div>
    );
  }

  if (!testId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-red-600 text-xl mb-4">No test selected</p>
          <p className="text-gray-600 mb-6">Please select a test from Test Schedules to enter marks.</p>
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

  const totalEntered = Array.from(marks.values()).filter((r) => r.marksObtained > 0).length;
  const passedCount = Array.from(marks.values()).filter((r) => isPassed(r.marksObtained)).length;
  const avgMarks = totalEntered > 0
    ? (Array.from(marks.values()).reduce((sum, r) => sum + r.marksObtained, 0) / totalEntered).toFixed(2)
    : 0;

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

          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl shadow-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">📝 Enter Marks</h1>
            <p className="text-purple-100 mb-4">{test.name} - {test.subject}</p>
            <div className="flex gap-4 text-sm">
              <span>📅 {new Date(test.testDate).toLocaleDateString()}</span>
              <span>📚 {test.course} {test.batch && `- ${test.batch}`}</span>
              <span>💯 Total Marks: {test.totalMarks}</span>
              <span>✅ Passing: {test.passingMarks}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Marks Entered</p>
                <p className="text-3xl font-bold">{totalEntered}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Passed</p>
                <p className="text-3xl font-bold">{passedCount}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Average</p>
                <p className="text-3xl font-bold">{avgMarks}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Marks Entry Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Enter Student Marks</h2>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
            >
              💾 Save All Marks
            </button>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No Students Present</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No students were marked present for this test. Please mark attendance first.
              </p>
              <button
                onClick={() => router.push(`/dashboard/client/${tenantId}/academics/attendance?testId=${testId}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
              >
                Mark Attendance
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Roll No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Student Name</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase">Marks Obtained</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase">Percentage</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase">Grade</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase">Result</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => {
                    const record = marks.get(student._id);
                    const marksObtained = record?.marksObtained || 0;
                    const percentage = calculatePercentage(marksObtained);
                    const grade = calculateGrade(marksObtained);
                    const passed = isPassed(marksObtained);

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
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={test.totalMarks}
                            value={marksObtained}
                            onChange={(e) => updateMarks(student._id, Number(e.target.value))}
                            className="w-24 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-center font-semibold"
                          />
                          <span className="ml-2 text-gray-600 dark:text-gray-400">/ {test.totalMarks}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg">{percentage}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                            grade === "A+" || grade === "A" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            grade === "B+" || grade === "B" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                            grade === "C" || grade === "D" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                            passed 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {passed ? "✓ Pass" : "✗ Fail"}
                          </span>
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
