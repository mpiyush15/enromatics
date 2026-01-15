"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

interface Test {
  _id: string;
  name: string;
  subject: string;
  course: string;
  batch: string;
  testDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  testType: string;
  description?: string;
  status: string;
  lessonId?: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface Course {
  _id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Lesson {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  email?: string;
  rollNo?: string;
}

export default function TestSchedulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"schedules" | "attendance" | "marks">("schedules");
  
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [status, setStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Course, Subject, Lesson data
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Attendance state
  const [selectedTestForAttendance, setSelectedTestForAttendance] = useState<Test | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [batchStudents, setBatchStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [submittedAttendanceData, setSubmittedAttendanceData] = useState<Record<string, boolean>>({});

  // Marks state
  const [selectedTestForMarks, setSelectedTestForMarks] = useState<Test | null>(null);
  const [marksData, setMarksData] = useState<Record<string, number>>({});
  const [marksSaving, setMarksSaving] = useState(false);
  const [marksSubmitted, setMarksSubmitted] = useState(false);
  const [submittedMarksData, setSubmittedMarksData] = useState<Record<string, number>>({});
  const [absentStudents, setAbsentStudents] = useState<Set<string>>(new Set()); // Track absent students

  // Batches loading state
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    course: "",
    courseId: "", // Store course ID for fetching batches
    batch: "",
    testDate: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    testType: "Unit Test",
    description: "",
    lessonId: "",
    status: "scheduled",
  });

  const fetchTests = async () => {
    try {
      let url = `/api/academics/tests`;
      const params = new URLSearchParams();
      if (filterCourse) params.append("course", filterCourse);
      if (filterStatus) params.append("status", filterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/academics/courses?tenantId=${tenantId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setCourses(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSubjects = async (courseId: string) => {
    try {
      if (!courseId) {
        setSubjects([]);
        setLessons([]);
        return;
      }
      
      const res = await fetch(`/api/academics/subjects?tenantId=${tenantId}`, {
        credentials: "include",
      });
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setSubjects(list.map((s: any) => ({ id: s._id || s.name, name: s.name })));
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchLessons = async (subject: string) => {
    try {
      if (!subject) {
        setLessons([]);
        return;
      }

      const res = await fetch(`/api/academics/lessons?tenantId=${tenantId}`, {
        credentials: "include",
      });
      const data = await res.json();
      const allLessons = Array.isArray(data.data) ? data.data : [];
      const filtered = allLessons.filter((l: any) => l.subject === subject);
      setLessons(filtered);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchBatches = async (courseId: string) => {
    try {
      if (!courseId) {
        setBatches([]);
        return;
      }

      setLoadingBatches(true);
      const res = await fetch(
        `/api/academics/courses/${courseId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      
      // Extract batches from course (check multiple possible locations)
      const courseData = data.data || data.course || data;
      
      if (courseData.batches && Array.isArray(courseData.batches)) {
        console.log(`[FETCH BATCHES] Found ${courseData.batches.length} batches for course ${courseId}`, courseData.batches);
        setBatches(courseData.batches);
      } else {
        console.log('[FETCH BATCHES] No batches found for course', courseId, courseData);
        setBatches([]);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchStudents = async (batchName: string) => {
    try {
      if (!batchName) {
        setBatchStudents([]);
        return;
      }

      setLoadingStudents(true);
      const res = await fetch(
        `/api/students?batch=${encodeURIComponent(batchName)}&tenantId=${tenantId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      
      if (res.ok) {
        const students = Array.isArray(data.data) ? data.data : Array.isArray(data.students) ? data.students : [];
        setBatchStudents(students);
      } else {
        console.error("Error fetching students:", data.message);
        setBatchStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setBatchStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSavedAttendance = async (testId: string) => {
    try {
      const res = await fetch(`/api/academics/tests/${testId}/attendance`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (res.ok && data.attendance && Array.isArray(data.attendance)) {
        // Convert array to record format
        const attendanceRecord: Record<string, boolean> = {};
        let hasValidSubmittedData = false;
        
        data.attendance.forEach((record: any) => {
          const studentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
          attendanceRecord[studentId] = record.present;
          // Only mark as submitted if record has markedBy (was officially submitted)
          if (record.markedBy) {
            hasValidSubmittedData = true;
          }
        });
        
        setAttendanceData(attendanceRecord);
        
        // Only set as submitted if there's actual marked data with markedBy field
        if (hasValidSubmittedData) {
          setSubmittedAttendanceData(attendanceRecord);
          setAttendanceSubmitted(true);
          console.log("✅ Loaded SUBMITTED attendance:", attendanceRecord);
        } else {
          // No markedBy = not officially submitted yet, allow editing
          setAttendanceData({});
          setSubmittedAttendanceData({});
          setAttendanceSubmitted(false);
          console.log("📝 No officially submitted attendance yet");
        }
      } else {
        setAttendanceData({});
        setSubmittedAttendanceData({});
        setAttendanceSubmitted(false);
      }
    } catch (error) {
      console.log("❌ No saved attendance found:", error);
      setAttendanceData({});
      setSubmittedAttendanceData({});
      setAttendanceSubmitted(false);
    }
  };

  const fetchSavedMarks = async (testId: string) => {
    try {
      const res = await fetch(`/api/academics/tests/${testId}/marks`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (res.ok && data.marks && Array.isArray(data.marks)) {
        // Convert array to record format
        const marksRecord: Record<string, number> = {};
        let hasValidSubmittedData = false;
        
        data.marks.forEach((record: any) => {
          const studentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
          marksRecord[studentId] = record.marksObtained;
          // Only mark as submitted if record has enteredBy (was officially submitted)
          if (record.enteredBy) {
            hasValidSubmittedData = true;
          }
        });
        
        setMarksData(marksRecord);
        
        // Only set as submitted if there's actual marked data with enteredBy field
        if (hasValidSubmittedData) {
          setSubmittedMarksData(marksRecord);
          setMarksSubmitted(true);
          console.log("✅ Loaded SUBMITTED marks:", marksRecord);
        } else {
          // No enteredBy = not officially submitted yet, allow editing
          setMarksData({});
          setSubmittedMarksData({});
          setMarksSubmitted(false);
          console.log("📝 No officially submitted marks yet");
        }
      } else {
        setMarksData({});
        setSubmittedMarksData({});
        setMarksSubmitted(false);
      }
    } catch (error) {
      console.log("❌ No saved marks found:", error);
      setMarksData({});
      setSubmittedMarksData({});
      setMarksSubmitted(false);
    }
  };

  const fetchAttendanceForMarksTab = async (testId: string) => {
    try {
      const res = await fetch(`/api/academics/tests/${testId}/attendance`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (res.ok && data.attendance && Array.isArray(data.attendance)) {
        console.log("📋 Attendance records returned:", data.attendance.length);
        
        // Find all students marked as absent (present === false)
        const absent = new Set<string>();
        data.attendance.forEach((record: any) => {
          const studentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
          console.log(`  Student ${studentId}: present = ${record.present}`);
          // If student is NOT present (false), mark as absent
          if (record.present === false) {
            absent.add(studentId);
          }
        });
        setAbsentStudents(absent);
        console.log("🔴 Absent students identified:", absent.size, "IDs:", Array.from(absent));
      } else {
        console.log("⚠️ No attendance data found");
        setAbsentStudents(new Set());
      }
    } catch (error) {
      console.log("⚠️ Could not fetch attendance for marks tab:", error);
      setAbsentStudents(new Set());
    }
  };

  useEffect(() => {
    if (user) {
      fetchTests();
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterCourse, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate batch is required
    if (!form.batch || form.batch.trim() === "") {
      setStatus("❌ Batch is required to assign attendance and marks");
      return;
    }

    // Validate subject is required
    if (!form.subject || form.subject.trim() === "") {
      setStatus("❌ Subject is required");
      return;
    }

    // Validate course is required
    if (!form.course || form.course.trim() === "") {
      setStatus("❌ Course is required to select batch");
      return;
    }
    
    // Validate date - must be today or later (but skip for cancelled tests)
    if (form.status !== "cancelled") {
      const selectedDate = new Date(form.testDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setStatus("❌ Test date must be today or in the future");
        return;
      }
    }

    // Check if trying to mark as completed without attendance/marks
    if (form.status === "completed" && editingTest) {
      // For now, show warning - in future could check if attendance/marks exist
      const confirm = window.confirm(
        "Are you sure you want to mark this test as completed? Make sure attendance or marks have been allocated."
      );
      if (!confirm) return;
    }
    
    setStatus("Saving...");
    
    try {
      console.log("Submitting test form:", form);
      
      const url = editingTest
        ? `/api/academics/tests/${editingTest._id}`
        : `/api/academics/tests`;
      
      // Prepare data - remove courseId before sending (backend expects course name)
      const { courseId, ...submitData } = form;
      
      const res = await fetch(url, {
        method: editingTest ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submitData,
          tenantId,
        }),
      });

      const data = await res.json();
      console.log("Response:", data);
      
      if (!res.ok) throw new Error(data.message || "Failed to save test");

      setStatus("✅ " + (editingTest ? "Updated" : "Created") + " successfully!");
      setShowAddModal(false);
      setEditingTest(null);
      resetForm();
      fetchTests();
      setTimeout(() => setStatus(""), 3000);
    } catch (error: any) {
      console.error("Error submitting test:", error);
      setStatus("❌ " + (error.message || "Failed to save test"));
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm("Delete this test? All attendance and marks data will be removed.")) return;
    
    try {
      const res = await fetch(`/api/academics/tests/${testId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to delete");
      
      setStatus("✅ Test deleted successfully");
      fetchTests();
      setTimeout(() => setStatus(""), 3000);
    } catch (error: any) {
      setStatus("❌ " + error.message);
    }
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    const selectedCourse = courses.find(c => c.name === test.course);
    setForm({
      name: test.name,
      subject: test.subject,
      course: test.course,
      courseId: selectedCourse?._id || "",
      batch: test.batch,
      testDate: new Date(test.testDate).toISOString().split("T")[0],
      duration: test.duration,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      testType: test.testType,
      description: test.description || "",
      lessonId: test.lessonId || "",
      status: test.status,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      subject: "",
      course: "",
      courseId: "",
      batch: "",
      testDate: "",
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      testType: "Unit Test",
      description: "",
      lessonId: "",
      status: "scheduled",
    });
    setBatches([]);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.scheduled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading test schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">📅 Test Management</h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "schedules"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            📋 Schedules
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "attendance"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            ✅ Attendance
          </button>
          <button
            onClick={() => setActiveTab("marks")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "marks"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            📝 Marks
          </button>
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

        {/* SCHEDULES TAB */}
        {activeTab === "schedules" && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                  <input
                    type="text"
                    placeholder="Filter by course..."
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 flex-1"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingTest(null);
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors"
                >
                  ➕ Add New Test
                </button>
              </div>
            </div>

            {/* Tests Grid */}
            {tests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">No Tests Scheduled</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first test schedule to get started</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Create Test
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Test Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Course / Batch</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Marks</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tests.map((test) => (
                        <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium truncate max-w-xs">{test.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{test.subject}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {test.course} {test.batch && `- ${test.batch}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(test.testDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{test.duration} min</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {test.totalMarks}/{test.passingMarks}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(test.status)}`}>
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setEditingTest(test);
                                  setForm({
                                    name: test.name,
                                    subject: test.subject,
                                    course: test.course,
                                    courseId: "",
                                    batch: test.batch,
                                    testDate: test.testDate.split('T')[0],
                                    duration: test.duration,
                                    totalMarks: test.totalMarks,
                                    passingMarks: test.passingMarks,
                                    testType: test.testType,
                                    description: test.description || "",
                                    lessonId: test.lessonId || "",
                                    status: test.status,
                                  });
                                  setShowAddModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(test._id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Side Panel */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false);
              setEditingTest(null);
              resetForm();
            }}
          ></div>
        )}

        {showAddModal && (
          <div
            className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 overflow-y-auto`}
          >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingTest ? "Edit Test" : "Create New Test"}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTest(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-3xl p-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Test Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>

              {/* Course Selection - Required */}
              <div>
                <label className="block text-sm font-semibold mb-2">Course *</label>
                <select
                  required
                  value={form.courseId || form.course}
                  onChange={(e) => {
                    const selectedCourse = courses.find(c => c._id === e.target.value);
                    setForm({ 
                      ...form, 
                      courseId: e.target.value,
                      course: selectedCourse?.name || e.target.value, 
                      batch: "", 
                      subject: "" 
                    });
                    if (e.target.value) {
                      fetchSubjects(e.target.value);
                      fetchBatches(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Required to assign batch and mark attendance</p>
              </div>

              {/* Batch Selection - Required */}
              {form.course && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Batch *</label>
                  {loadingBatches ? (
                    <div className="w-full px-4 py-2 border-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      Loading batches...
                    </div>
                  ) : batches.length > 0 ? (
                    <select
                      required
                      value={form.batch}
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((b) => (
                        <option key={b._id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2 border-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                      No batches available for this course. Add batches to the course first.
                    </div>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">ℹ️ Batch is required to mark attendance and assign marks</p>
                </div>
              )}

              {/* Subject Selection - Optional */}
              {form.course && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Subject (Optional)</label>
                  <select
                    value={form.subject}
                    onChange={(e) => {
                      setForm({ ...form, subject: e.target.value });
                      if (e.target.value) {
                        fetchLessons(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="">Select Subject (Optional)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lesson Selection Dropdown */}
              {form.subject && lessons.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Lesson (Optional)</label>
                  <select
                    value={form.lessonId}
                    onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="">Select Lesson</option>
                    {lessons.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject Manual Input - Fallback */}
              {!form.subject && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Subject (Manual Entry) *</label>
                  <input
                    required={!form.subject}
                    type="text"
                    placeholder="Enter subject name"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>
              )}

              {/* Test Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Test Date *</label>
                  <input
                    required
                    type="date"
                    min={editingTest && editingTest.status === "scheduled" ? undefined : new Date().toISOString().split('T')[0]}
                    value={form.testDate}
                    onChange={(e) => setForm({ ...form, testDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  {editingTest && editingTest.status === "scheduled" && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">ℹ️ Scheduled tests can be updated to any date</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Duration (minutes) *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Total Marks *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.totalMarks}
                    onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Passing Marks *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.passingMarks}
                    onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Test Type *</label>
                  <select
                    required
                    value={form.testType}
                    onChange={(e) => setForm({ ...form, testType: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final Exam">Final Exam</option>
                    <option value="Practice Test">Practice Test</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Status {editingTest && "(Manual Change)"}</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {editingTest && form.status === "completed" && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      ⚠️ Make sure attendance or marks have been allocated before marking as completed
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  {editingTest ? "Update Test" : "Create Test"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTest(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Additional Actions for Existing Tests */}
              {editingTest && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <p className="text-sm font-semibold mb-3">Manage Test</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("attendance")}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                  >
                    ✅ Mark Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("marks")}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm"
                  >
                    📝 Enter Marks
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === "attendance" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">📋 Mark Test Attendance</h2>
          
          {!selectedTestForAttendance ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">Select a test to mark attendance:</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No tests available</p>
                ) : (
                  tests.map((test) => (
                    <button
                      key={test._id}
                      onClick={() => {
                        setSelectedTestForAttendance(test);
                        fetchStudents(test.batch);
                        fetchSavedAttendance(test._id);
                      }}
                      className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{test.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {test.course} {test.batch && `- ${test.batch}`} • {new Date(test.testDate).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTestForAttendance.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTestForAttendance.course} {selectedTestForAttendance.batch && `- ${selectedTestForAttendance.batch}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTestForAttendance(null);
                      setAttendanceData({});
                      setAttendanceSubmitted(false);
                      setSubmittedAttendanceData({});
                    }}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Change Test
                  </button>
                </div>
              </div>

              {attendanceSubmitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">✅ Attendance Submitted Successfully!</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{batchStudents.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Present</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{Object.values(submittedAttendanceData).filter(Boolean).length}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-4">Mark Attendance (Batch: {selectedTestForAttendance.batch || "N/A"})</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {loadingStudents ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
                    </div>
                  ) : batchStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">No students found in this batch</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {batchStudents.map((student) => {
                        const studentId = student._id;
                        return (
                          <label
                            key={studentId}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                          >
                            <input
                              type="checkbox"
                              checked={attendanceData[studentId] || false}
                              onChange={(e) =>
                                setAttendanceData({
                                  ...attendanceData,
                                  [studentId]: e.target.checked,
                                })
                              }
                              disabled={attendanceSubmitted}
                              className="w-4 h-4 rounded cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 dark:text-white block">{student.name}</span>
                              {student.rollNo && <span className="text-xs text-gray-600 dark:text-gray-400">Roll: {student.rollNo}</span>}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                              {attendanceData[studentId] ? "✅ Present" : "❌ Absent"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!selectedTestForAttendance) return;
                    
                    setAttendanceSaving(true);
                    try {
                      // Convert attendance data to array format
                      // IMPORTANT: Send ALL students from batch, both present and absent
                      const records = batchStudents.map((student) => ({
                        studentId: student._id,
                        present: Boolean(attendanceData[student._id]) // true if checked, false if not
                      }));
                      
                      console.log("📤 Saving attendance for all students:", records.length);
                      
                      // Save to BFF (which forwards to backend)
                      const response = await fetch(`/api/academics/tests/${selectedTestForAttendance._id}/attendance`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                          attendanceData: records
                        }),
                      });

                      // Get response text first to debug
                      const responseText = await response.text();
                      console.log("Response status:", response.status);
                      console.log("Response text:", responseText);
                      
                      let result;
                      try {
                        result = JSON.parse(responseText);
                      } catch (e) {
                        throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
                      }
                      
                      if (!response.ok) {
                        throw new Error(result.message || `Error: ${response.status}`);
                      }
                      
                      // Success
                      setStatus("✅ Attendance saved successfully!");
                      setAttendanceSubmitted(true);
                      setSubmittedAttendanceData({...attendanceData});
                      
                    } catch (error) {
                      const message = error instanceof Error ? error.message : "Unknown error";
                      setStatus("❌ " + message);
                      console.error("Attendance save error:", error);
                    } finally {
                      setAttendanceSaving(false);
                    }
                  }}
                  disabled={attendanceSaving}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 font-semibold transition-colors"
                >
                  {attendanceSaving ? "Saving..." : "✅ Save Attendance"}
                </button>
                {!attendanceSubmitted && (
                  <button
                    onClick={() => {
                      setSelectedTestForAttendance(null);
                      setAttendanceData({});
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                )}
                {attendanceSubmitted && (
                  <button
                    onClick={() => {
                      setSelectedTestForAttendance(null);
                      setAttendanceData({});
                      setAttendanceSubmitted(false);
                      setSubmittedAttendanceData({});
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                  >
                    Mark Another Test
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MARKS TAB */}
      {activeTab === "marks" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">📝 Enter Test Marks</h2>
          
          {!selectedTestForMarks ? (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">Select a test to enter marks:</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No tests available</p>
                ) : (
                  tests.map((test) => (
                    <button
                      key={test._id}
                      onClick={() => {
                        setSelectedTestForMarks(test);
                        fetchStudents(test.batch);
                        fetchSavedMarks(test._id);
                        // Also fetch attendance to check for absent students
                        fetchAttendanceForMarksTab(test._id);
                      }}
                      className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{test.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {test.course} {test.batch && `- ${test.batch}`} • Max: {test.totalMarks} marks
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTestForMarks.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTestForMarks.course} {selectedTestForMarks.batch && `- ${selectedTestForMarks.batch}`} • Total Marks: {selectedTestForMarks.totalMarks}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTestForMarks(null);
                      setMarksData({});
                      setMarksSubmitted(false);
                      setSubmittedMarksData({});
                      setAbsentStudents(new Set()); // Clear absent students list
                    }}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Change Test
                  </button>
                </div>
              </div>

              {marksSubmitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">✅ Marks Submitted Successfully!</h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Marks Entered:</h5>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {batchStudents.map((student) => {
                        const marks = submittedMarksData[student._id] || 0;
                        if (marks === 0) return null;
                        const isPassing = marks >= selectedTestForMarks.passingMarks;
                        const percentage = ((marks / selectedTestForMarks.totalMarks) * 100).toFixed(1);
                        return (
                          <div key={student._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-900 dark:text-white">{student.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{marks}/{selectedTestForMarks.totalMarks}</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">({percentage}%)</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isPassing ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
                                {isPassing ? "✅" : "❌"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-4">Enter Student Marks (Batch: {selectedTestForMarks.batch || "N/A"})</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {loadingStudents ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
                    </div>
                  ) : batchStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">No students found in this batch</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {batchStudents.map((student) => {
                        const studentId = student._id;
                        const marks = marksData[studentId] || 0;
                        const isPassing = marks >= selectedTestForMarks.passingMarks;
                        const isAbsent = absentStudents.has(studentId);
                        
                        return (
                          <div
                            key={studentId}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              isAbsent 
                                ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" 
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 dark:text-white block">{student.name}</span>
                              {student.rollNo && <span className="text-xs text-gray-600 dark:text-gray-400">Roll: {student.rollNo}</span>}
                              {isAbsent && <span className="text-xs text-red-600 dark:text-red-400 font-semibold">❌ Absent - Cannot mark</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={selectedTestForMarks.totalMarks}
                                value={marks}
                                onChange={(e) =>
                                  setMarksData({
                                    ...marksData,
                                    [studentId]: Math.min(Number(e.target.value), selectedTestForMarks.totalMarks),
                                  })
                                }
                                placeholder="0"
                                disabled={marksSubmitted || isAbsent}
                                className={`w-20 px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-center ${
                                  isAbsent
                                    ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 cursor-not-allowed opacity-50"
                                    : "disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:bg-gray-600"
                                }`}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-fit">
                                / {selectedTestForMarks.totalMarks}
                              </span>
                              {marks > 0 && !isAbsent && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                  isPassing 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}>
                                  {isPassing ? "✅ Pass" : "❌ Fail"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!selectedTestForMarks) return;
                      
                      setMarksSaving(true);
                      try {
                        // Convert marks data to array format
                        const records = Object.entries(marksData).map(([studentId, marksObtained]) => ({
                          studentId,
                          marksObtained: Number(marksObtained)
                        }));
                        
                        // Save to BFF (which forwards to backend)
                        const response = await fetch(`/api/academics/tests/${selectedTestForMarks._id}/marks`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            marksData: records,
                          }),
                        });

                        // Get response text first to debug
                        const responseText = await response.text();
                        console.log("Marks Response status:", response.status);
                        console.log("Marks Response text:", responseText);
                        
                        let result;
                        try {
                          result = JSON.parse(responseText);
                        } catch (e) {
                          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
                        }
                        
                        if (!response.ok) {
                          throw new Error(result.message || `Error: ${response.status}`);
                        }
                        
                        // Success
                        setStatus("✅ Marks saved successfully!");
                        setMarksSubmitted(true);
                        setSubmittedMarksData({...marksData});
                        
                      } catch (error) {
                        const message = error instanceof Error ? error.message : "Unknown error";
                        setStatus("❌ " + message);
                        console.error("Marks save error:", error);
                      } finally {
                        setMarksSaving(false);
                      }
                    }}
                    disabled={marksSaving}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 font-semibold transition-colors"
                  >
                    {marksSaving ? "Saving..." : "📝 Save Marks"}
                  </button>
                  {!marksSubmitted && (
                    <button
                      onClick={() => {
                        setSelectedTestForMarks(null);
                        setMarksData({});
                        setAbsentStudents(new Set()); // Clear absent students list
                      }}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                  {marksSubmitted && (
                    <button
                      onClick={() => {
                        setSelectedTestForMarks(null);
                        setMarksData({});
                        setMarksSubmitted(false);
                        setSubmittedMarksData({});
                        setAbsentStudents(new Set()); // Clear absent students list
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
                    >
                      Enter Marks for Another Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
