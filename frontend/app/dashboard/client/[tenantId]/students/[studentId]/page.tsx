"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import type { StudentDTO, StudentFormData, StudentDetailResponse, StudentMutationResponse } from "@/types/student";
import { api, safeApiCall } from "@/lib/apiClient";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StudentProfilePage() {
  const { user } = useAuth();
 
  const params = useParams<{ tenantId: string; studentId?: string }>();
  const tenantId = params?.tenantId;
  const studentId = params?.studentId;

  const router = useRouter();

  const [student, setStudent] = useState<StudentDTO | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<StudentFormData>({});
  const [status, setStatus] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("general");
  const [notificationPriority, setNotificationPriority] = useState("medium");
  const [sendingNotification, setSendingNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "attendance" | "progress">("overview");
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [testMarks, setTestMarks] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);

  const fetchStudent = async () => {
    try {
      const [data, err] = await safeApiCall(() =>
        api.get<StudentDetailResponse>(`/api/students/${studentId}`)
      );

      if (err) {
        setStatus(err.message || "Failed to fetch student");
        setLoading(false);
        return;
      }

      if (data && data.success && data.student) {
        setStudent(data.student);
        setPayments(data.payments || []);
        setForm({
          name: data.student.name || "",
          email: data.student.email || "",
          phone: data.student.phone || "",
          gender: data.student.gender,
          course: data.student.course || "",
          batchId: data.student.batchId || "",
          address: data.student.address || "",
          fees: data.student.fees ?? 0,
          status: data.student.status || "active",
        });
      } else {
        setStatus(data?.message || "Failed to fetch student");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error fetching student");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const [data, err] = await safeApiCall(() =>
        api.get<any>(`/api/academics/batches?tenantId=${tenantId}&active=true`)
      );

      if (err) {
        console.warn("Failed to fetch batches:", err.message);
        return;
      }

      if (data && data.success) {
        setBatches(data.batches || []);
      } else {
        console.warn("Failed to fetch batches:", data?.message);
      }
    } catch (err: any) {
      console.error("Error fetching batches:", err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchTenant = async () => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        const tenantData = data.tenant || data.data;
        setTenant(tenantData);
        console.log('✅ Tenant fetched:', tenantData);
        console.log('✅ Tenant name:', tenantData?.name || tenantData?.instituteName);
      } else {
        console.warn("Failed to fetch tenant:", data?.message);
        setTenant({ name: 'Institute' });
      }
    } catch (err: any) {
      console.error("Error fetching tenant:", err);
      setTenant({ name: 'Institute' });
    }
  };

  const fetchCourses = async () => {
    console.log("[FETCH COURSES] Starting fetch with tenantId:", tenantId);
    setLoadingCourses(true);
    
    if (!tenantId) {
      console.warn("[FETCH COURSES] Missing tenantId, skipping fetch");
      setCourses([]);
      setLoadingCourses(false);
      return;
    }

    try {
      const url = `/api/academics/courses?tenantId=${tenantId}`;
      console.log("[FETCH COURSES] Calling:", url);
      
      const res = await fetch(url, { credentials: 'include' });
      console.log("[FETCH COURSES] Response status:", res.status);
      
      const data = await res.json();
      console.log("[FETCH COURSES] Full response:", data);

      if (!res.ok) {
        console.error("[FETCH COURSES] API returned error:", data.message);
        setCourses([]);
        setLoadingCourses(false);
        return;
      }

      // Extract courses from response
      const coursesList = data.data || data.courses || [];
      console.log("[FETCH COURSES] Extracted courses count:", coursesList.length);
      console.log("[FETCH COURSES] Courses:", coursesList);
      
      setCourses(Array.isArray(coursesList) ? coursesList : []);
    } catch (err: any) {
      console.error("[FETCH COURSES] Error:", err.message);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchAttendance = async () => {
    if (!studentId) return;
    try {
      setLoadingAttendance(true);
      
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      const [data, err] = await safeApiCall(() =>
        api.get<any>(`/api/attendance/student/${studentId}?startDate=${startDate}&endDate=${endDate}&limit=100`)
      );

      if (err) {
        console.error("Failed to fetch attendance:", err.message);
        setAttendanceHistory([]);
        setAttendanceSummary(null);
        return;
      }

      if (data && data.success) {
        setAttendanceHistory(data.records || []);
        setAttendanceSummary(data.summary || null);
      } else {
        setAttendanceHistory([]);
        setAttendanceSummary(null);
      }
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      setAttendanceHistory([]);
      setAttendanceSummary(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchTestProgress = async () => {
    if (!studentId) return;
    
    try {
      setLoadingProgress(true);
      
      // Fetch all tests first
      const testsRes = await fetch(`/api/academics/tests`, {
        credentials: 'include',
      });

      if (!testsRes.ok) throw new Error('Failed to fetch tests');

      const testsData = await testsRes.json();
      const allTests = testsData.tests || testsData.data || [];

      const results: any[] = [];

      // For each test, fetch marks and find this student's result
      for (const test of allTests) {
        try {
          const marksRes = await fetch(`/api/academics/tests/${test._id}/marks`, {
            credentials: 'include',
          });

          if (!marksRes.ok) continue;

          const marksData = await marksRes.json();
          const marks = marksData.marks || [];

          // Find marks for this student
          const studentMark = marks.find(
            (m: any) =>
              (typeof m.studentId === 'string' ? m.studentId : m.studentId?._id) ===
              studentId
          );

          if (studentMark) {
            const marksObtained = studentMark.marksObtained || 0;
            const percentage = (marksObtained / test.totalMarks) * 100;
            const passed = marksObtained >= test.passingMarks;

            // Calculate rank: sort all marks by marksObtained descending
            const sortedMarks = [...marks].sort((a, b) => (b.marksObtained || 0) - (a.marksObtained || 0));
            const rank = sortedMarks.findIndex(
              (m: any) =>
                (typeof m.studentId === 'string' ? m.studentId : m.studentId?._id) ===
                studentId
            ) + 1;

            results.push({
              _id: test._id,
              name: test.name,
              subject: test.subject || 'General',
              marks: marksObtained,
              totalMarks: test.totalMarks,
              percentage: Math.round(percentage * 100) / 100,
              date: test.testDate,
              passed,
              rank: rank > 0 ? rank : null,
              batchRank: rank > 0 ? rank : null,
            });
          }
        } catch (err) {
          console.error(`Error fetching marks for test ${test._id}:`, err);
        }
      }

      // Sort by test date
      results.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateA - dateB;
      });

      setTestMarks(results);

      // Calculate statistics
      if (results.length > 0) {
        const totalTests = results.length;
        const passedTests = results.filter((r: any) => r.passed).length;
        const totalPercentage = results.reduce((sum: number, r: any) => sum + r.percentage, 0);
        const avgPercentage = (totalPercentage / totalTests).toFixed(2);

        const sortedByPercentage = [...results].sort((a: any, b: any) => b.percentage - a.percentage);
        const bestTest = sortedByPercentage[0];
        const worstTest = sortedByPercentage[sortedByPercentage.length - 1];

        setProgressStats({
          totalTests,
          passedTests,
          failedTests: totalTests - passedTests,
          avgPercentage,
          bestTest,
          worstTest,
          passRate: ((passedTests / totalTests) * 100).toFixed(1)
        });
      } else {
        setProgressStats(null);
      }
    } catch (err: any) {
      console.error("Error fetching test progress:", err);
      setTestMarks([]);
      setProgressStats(null);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    } else if (activeTab === "progress") {
      fetchTestProgress();
    }
  }, [activeTab, currentMonth, studentId]);

  useEffect(() => {
    if (!user) return;
    fetchStudent();
    fetchBatches();
    fetchCourses();
    if (tenantId) fetchTenant();
  }, [user, studentId, tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setStatus("Saving...");
    try {
      const [data, err] = await safeApiCall(() =>
        api.put<StudentMutationResponse>(`/api/students/${studentId}`, form)
      );

      if (err) {
        setStatus("❌ " + (err.message || "Error saving"));
        return;
      }

      if (data && data.student) {
        setStudent(data.student);
        // 🔄 Broadcast refresh signal to other pages
        window.dispatchEvent(new CustomEvent('studentDataUpdated', { 
          detail: { studentId, batchId: data.student.batchId, courseId: data.student.course } 
        }));
        // Trigger students list page refresh via localStorage
        localStorage.setItem('studentsRefreshNeeded', Date.now().toString());
      }
      setEditing(false);
      setStatus("✅ Saved successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ " + (err.message || "Error saving"));
    }
  };

  const handleResetPassword = async () => {
    const ok = confirm("Generate/reset password for this student? The new password will be shown to you.");
    if (!ok) return;
    setStatus("Resetting password...");
    try {
      const [data, err] = await safeApiCall(() =>
        api.put<StudentMutationResponse>(`/api/students/${studentId}/reset-password`, {})
      );

      if (err) {
        setStatus("❌ " + (err.message || "Error resetting password"));
        return;
      }

      const newPwd = data?.newPassword;
      alert(`Password reset successfully!\n\nNew Password: ${newPwd}\n\nPlease share this with the student.`);
      setStatus(`✅ Password reset. New password: ${newPwd}`);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ " + (err.message || "Error resetting password"));
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount) return setStatus("❌ Enter amount");
    
    // Calculate remaining fees to be paid
    const totalFees = student?.fees || 0;
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingFees = totalFees - totalPaid;
    const paymentAmountNum = Number(paymentAmount);
    
    // Validation: Payment amount should not exceed remaining fees
    if (paymentAmountNum > remainingFees) {
      return setStatus(`❌ Payment amount (₹${paymentAmountNum}) exceeds remaining fees (₹${remainingFees}). Please enter an amount equal to or less than ₹${remainingFees}`);
    }
    
    setStatus("Adding payment...");
    try {
      const [data, err] = await safeApiCall(() =>
        api.post<any>(`/api/payments`, { 
          studentId, 
          amount: paymentAmountNum,
          method: paymentMethod,
          remarks: paymentRemarks,
          date: paymentDate
        })
      );

      if (err) {
        setStatus("❌ " + (err.message || "Error adding payment"));
        return;
      }

      setPaymentAmount("");
      setPaymentMethod("cash");
      setPaymentRemarks("");
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setShowPaymentModal(false);
      setStatus("✅ Payment added successfully!");
      fetchStudent();
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ " + (err.message || "Error adding payment"));
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      setStatus("❌ Please fill in title and message");
      return;
    }

    setSendingNotification(true);
    setStatus("Sending notification...");
    
    try {
      const [data, err] = await safeApiCall(() =>
        api.post<any>(`/api/notifications/create`, {
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          priority: notificationPriority,
          studentIds: [studentId],
          tenantId: tenantId
        })
      );

      if (err) {
        setStatus("❌ " + (err.message || "Failed to send notification"));
        setSendingNotification(false);
        return;
      }

      if (data && data.success) {
        setStatus(`✅ Notification sent successfully to ${student?.name}!`);
        setShowNotificationModal(false);
        setNotificationTitle("");
        setNotificationMessage("");
        setNotificationType("general");
        setNotificationPriority("medium");
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("❌ " + (data?.message || "Failed to send notification"));
      }
    } catch (err: any) {
      console.error("Send notification error:", err);
      setStatus("❌ " + (err.message || "Error sending notification"));
    } finally {
      setSendingNotification(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const ok = confirm("Are you sure you want to delete this payment receipt?");
    if (!ok) return;
    try {
      const [data, err] = await safeApiCall(() =>
        api.delete<any>(`/api/payments/${paymentId}`)
      );

      if (err) {
        setStatus("❌ " + (err.message || "Error deleting payment"));
        return;
      }

      setStatus("✅ Payment deleted");
      fetchStudent();
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ " + (err.message || "Error deleting payment"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl">{status || "Student not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const feesPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const feesTotal = student.fees ?? 0;
  const feesPending = Math.max(feesTotal - feesPaid, 0);
  const feesPercentage = feesTotal > 0 ? (feesPaid / feesTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-in-out;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card {
          transition: all 0.3s ease;
          transform: translateY(0);
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Students</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                  student.status === "active" ? "bg-green-500" : "bg-red-500"
                }`}></div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    student.status === "active" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {student.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Roll: {student.rollNumber} • {student.course}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{student.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-2 flex-shrink-0">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Reset
                    </button>
                    <button
                      onClick={() => setShowNotificationModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Send Notification
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchStudent();
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 p-3 cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">Total Fee</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-200 truncate">₹{feesTotal.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-700/50 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700 p-3 cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium truncate">Total Paid</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-200 truncate">₹{feesPaid.toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{payments.length} payments</p>
              </div>
              <div className="p-2 bg-green-200 dark:bg-green-700/50 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-700 p-3 cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium truncate">Pending</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-200 truncate">₹{feesPending.toLocaleString()}</p>
                <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${feesPercentage}%` }}></div>
                </div>
              </div>
              <div className="p-2 bg-red-200 dark:bg-red-700/50 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            status.includes('✅') 
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <div className="flex gap-1 p-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                👤 Overview
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === "payments"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                💳 Payments
              </button>
              <button
                onClick={() => {
                  setActiveTab("attendance");
                  if (attendanceHistory.length === 0) {
                    fetchAttendance();
                  }
                }}
                className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === "attendance"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                📋 Attendance
              </button>
              <button
                onClick={() => {
                  setActiveTab("progress");
                  if (testMarks.length === 0) {
                    fetchTestProgress();
                  }
                }}
                className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === "progress"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                📈 Progress Report
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 animate-fadeIn">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Email</label>
                  {editing ? (
                    <input 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600" 
                    />
                  ) : (
                    <p className="text-lg font-semibold">{student.email}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Phone</label>
                  {editing ? (
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600" 
                    />
                  ) : (
                    <p className="text-lg font-semibold">{student.phone || "Not provided"}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Gender</label>
                  {editing ? (
                    <select 
                      name="gender" 
                      value={form.gender} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold capitalize">{student.gender || "Not specified"}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Course</label>
                  {editing ? (
                    <>
                      {loadingCourses ? (
                        <div className="w-full px-4 py-2 border-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                          Loading courses...
                        </div>
                      ) : courses.length === 0 ? (
                        <div className="w-full px-4 py-2 border-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                          ❌ No courses available
                        </div>
                      ) : (
                        <select
                          name="course"
                          value={form.course || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                        >
                          <option value="">-- Select Course --</option>
                          {courses.map((c: any) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-semibold">
                      {(() => {
                        // Find the course name from courses array using the course ID
                        if (!student.course) return "Not assigned";
                        
                        // First try to find using courses array
                        const foundCourse = courses.find((c: any) => c._id === student.course);
                        if (foundCourse) return foundCourse.name;
                        
                        // Fallback to course name stored on student (for old data)
                        return student.course;
                      })()}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Batch</label>
                  {editing ? (
                    <>
                      {!form.course ? (
                        <div className="w-full px-4 py-2 border-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                          📌 Select a course first to see available batches
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const filteredBatches = batches.filter((batch) => {
                              // Handle batch.courseId as both object and string
                              const batchCourseId = typeof batch.courseId === 'object' && batch.courseId?._id 
                                ? batch.courseId._id 
                                : batch.courseId;
                              return batchCourseId === form.course;
                            });
                            
                            console.log("[BATCH FILTER]", {
                              selectedCourse: form.course,
                              totalBatches: batches.length,
                              filteredBatches: filteredBatches.length,
                              batches: batches.map(b => ({ name: b.name, courseId: b.courseId }))
                            });

                            return filteredBatches.length > 0 ? (
                              <select
                                name="batchId"
                                value={form.batchId || ''}
                                onChange={handleChange}
                                disabled={loadingBatches}
                                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                              >
                                <option value="">-- Select Batch --</option>
                                {filteredBatches.map((batch) => (
                                  <option key={batch._id} value={batch._id}>
                                    {batch.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="w-full px-4 py-2 border-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                                ❌ No batches available for this course
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-semibold">{student.batchName || "Not assigned"}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Total Fees</label>
                  {editing ? (
                    <input 
                      name="fees" 
                      value={form.fees} 
                      onChange={handleChange} 
                      type="number"
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600" 
                    />
                  ) : (
                    <p className="text-lg font-semibold">₹{feesTotal.toLocaleString()}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Status</label>
                  {editing ? (
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold capitalize">{student.status}</p>
                  )}
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Address</label>
                  {editing ? (
                    <input 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600" 
                    />
                  ) : (
                    <p className="text-lg font-semibold">{student.address || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              {/* Add Payment Button */}
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Payment
                </button>
              </div>

              {/* Payment List */}
              {payments.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No payments yet</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click "Add Payment" button to record the first payment</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment, index) => {
                    const methodIcons: any = {
                      cash: "💵",
                      online: "🌐",
                      card: "💳",
                      cheque: "📝",
                      bank_transfer: "🏦"
                    };

                    const methodColors: any = {
                      cash: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                      online: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      card: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                      cheque: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
                      bank_transfer: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    };

                    return (
                      <div 
                        key={payment._id} 
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Amount */}
                          <div className="flex-shrink-0">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(payment.date).toLocaleDateString('en-IN', { 
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          {/* Method Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${methodColors[payment.method] || methodColors.cash}`}>
                            {methodIcons[payment.method] || "💵"} {(payment.method || "cash").replace("_", " ")}
                          </span>

                          {/* Remarks */}
                          {payment.remarks && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                              {payment.remarks}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex gap-2">
                          {/* Download Receipt Button */}
                          <a
                            href={`/api/payments/${payment._id}/receipt`}
                            download
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Download Receipt"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>

                          {/* Delete Button - DISABLED */}
                          <button
                            disabled
                            className="p-2 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                            title="Payments cannot be deleted (Use remarks/notes for corrections)"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div>
              {/* Month Selector */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  ← Previous
                </button>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Next →
                </button>
              </div>

              {/* Summary Stats */}
              {attendanceSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 rounded-xl">
                    <p className="text-sm text-green-600 dark:text-green-300 font-semibold mb-1">Present</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-200">{attendanceSummary.present || 0}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-300 font-semibold mb-1">Absent</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-200">{attendanceSummary.absent || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl">
                    <p className="text-sm text-yellow-600 dark:text-yellow-300 font-semibold mb-1">Late</p>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">{attendanceSummary.late || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 rounded-xl">
                    <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold mb-1">Excused</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">{attendanceSummary.excused || 0}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loadingAttendance && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading attendance...</p>
                </div>
              )}

              {/* Calendar Grid */}
              {!loadingAttendance && (
                <>
                  <div className="mb-6">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-400 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDay = new Date(year, month, 1);
                        const lastDay = new Date(year, month + 1, 0);
                        const daysInMonth = lastDay.getDate();
                        const startingDayOfWeek = firstDay.getDay();

                        // Create attendance map for quick lookup
                        const attendanceMap = new Map();
                        attendanceHistory.forEach((record: any) => {
                          const dateStr = new Date(record.date).toDateString();
                          attendanceMap.set(dateStr, record);
                        });

                        const days = [];

                        // Empty cells for days before month starts
                        for (let i = 0; i < startingDayOfWeek; i++) {
                          days.push(
                            <div key={`empty-${i}`} className="aspect-square"></div>
                          );
                        }

                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(year, month, day);
                          const dateStr = date.toDateString();
                          const record = attendanceMap.get(dateStr);
                          const isToday = dateStr === new Date().toDateString();

                          const statusStyles = {
                            present: "bg-green-100 border-green-500 dark:bg-green-900",
                            absent: "bg-red-100 border-red-500 dark:bg-red-900",
                            late: "bg-yellow-100 border-yellow-500 dark:bg-yellow-900",
                            excused: "bg-purple-100 border-purple-500 dark:bg-purple-900"
                          };

                          const statusIcons = {
                            present: "✓",
                            absent: "✗",
                            late: "⏰",
                            excused: "📝"
                          };

                          const statusTextColors = {
                            present: "text-green-700 dark:text-green-200",
                            absent: "text-red-700 dark:text-red-200",
                            late: "text-yellow-700 dark:text-yellow-200",
                            excused: "text-purple-700 dark:text-purple-200"
                          };

                          days.push(
                            <div
                              key={day}
                              className={`aspect-square p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-lg cursor-pointer ${
                                record 
                                  ? statusStyles[record.status as keyof typeof statusStyles]
                                  : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                              } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                              title={record ? `${record.status} - ${date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}${record.markedBy ? `\nMarked by: ${record.markedBy.name}` : ''}` : date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                            >
                              <div className={`text-lg font-bold ${
                                record 
                                  ? statusTextColors[record.status as keyof typeof statusTextColors]
                                  : "text-gray-700 dark:text-gray-300"
                              }`}>
                                {day}
                              </div>
                              {record && (
                                <div className={`text-2xl mt-1 ${statusTextColors[record.status as keyof typeof statusTextColors]}`}>
                                  {statusIcons[record.status as keyof typeof statusIcons]}
                                </div>
                              )}
                              {isToday && !record && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Today</div>
                              )}
                            </div>
                          );
                        }

                        return days;
                      })()}
                    </div>
                  </div>

                  {/* No Records Message */}
                  {attendanceHistory.length === 0 && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">No attendance records for this month</p>
                    </div>
                  )}
                </>
              )}

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Legend:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-green-600">✓</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-red-600">✗</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-yellow-600">⏰</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-purple-600">📝</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Excused</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-6">
              {loadingProgress ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading progress data...</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{testMarks.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Passed</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {testMarks.filter((t: any) => (t.marks || 0) >= 50).length}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg %</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {testMarks.length > 0 ? Math.round(testMarks.reduce((sum: number, t: any) => sum + (t.marks || 0), 0) / testMarks.length) : 0}%
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pass Rate</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {testMarks.length > 0 ? Math.round((testMarks.filter((t: any) => (t.marks || 0) >= 50).length / testMarks.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Charts Section */}
                  {testMarks.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Marks Progression Chart */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Marks Progression</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={testMarks.map((t: any) => ({
                            date: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
                            marks: t.marks || 0,
                            percentage: t.totalMarks ? parseFloat(((t.marks / t.totalMarks) * 100).toFixed(1)) : 0,
                            testName: t.name?.substring(0, 10) || 'Test',
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} style={{fontSize: '12px'}} />
                            <YAxis domain={[0, 100]} label={{ value: 'Percentage %', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend />
                            <Line type="monotone" dataKey="percentage" stroke="#8b5cf6" name="Percentage %" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="marks" stroke="#3b82f6" name="Marks Obtained" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Subject Performance Chart */}
                      {(() => {
                        const subjectMap: { [key: string]: { total: number; count: number; passed: number } } = {};
                        testMarks.forEach((t: any) => {
                          const subject = t.subject || 'General';
                          if (!subjectMap[subject]) {
                            subjectMap[subject] = { total: 0, count: 0, passed: 0 };
                          }
                          subjectMap[subject].total += t.marks || 0;
                          subjectMap[subject].count += 1;
                          if ((t.marks || 0) >= 50) {
                            subjectMap[subject].passed += 1;
                          }
                        });

                        const subjectData = Object.entries(subjectMap).map(([subject, stats]) => ({
                          subject,
                          avgMarks: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
                          passRate: stats.count > 0 ? Math.round((stats.passed / stats.count) * 100) : 0,
                        }));

                        return (
                          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📚 Subject Performance</h3>
                            {subjectData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={subjectData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={70} style={{fontSize: '12px'}} />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="avgMarks" fill="#10b981" name="Avg Marks" />
                                  <Bar dataKey="passRate" fill="#f59e0b" name="Pass Rate %" />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No subject data available</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Test Results Table */}
                  {testMarks.length > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left text-gray-900 dark:text-white font-semibold">Test</th>
                              <th className="px-3 py-2 text-left text-gray-900 dark:text-white font-semibold">Subject</th>
                              <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">Date</th>
                              <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">Marks</th>
                              <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">%</th>
                              <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">Rank</th>
                              <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {testMarks.map((test: any, index: number) => {
                              const percentage = test.totalMarks ? parseFloat(((test.marks / test.totalMarks) * 100).toFixed(1)) : 0;
                              const passed = percentage >= 50;
                              const rank = test.rank || test.batchRank || '-';
                              return (
                                <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                  <td className="px-3 py-2 text-gray-900 dark:text-white font-medium text-xs">{test.name}</td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{test.subject}</td>
                                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-xs">
                                    {test.date ? new Date(test.date).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-center font-semibold text-gray-900 dark:text-white text-xs">
                                    {test.marks || 0}/{test.totalMarks || 100}
                                  </td>
                                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-xs font-semibold">{percentage.toFixed(1)}%</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-bold text-xs">
                                    {typeof rank === 'number' ? (
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                        rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        rank <= 3 ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' :
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                      }`}>
                                        #{rank}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                                      passed 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                      {passed ? '✅ Pass' : '❌ Fail'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Export Buttons */}
                  {testMarks.length > 0 && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          if (!tenant?.name) {
                            setStatus("⏳ Loading institute name... Please wait a moment and try again.");
                            setTimeout(() => setStatus(""), 3000);
                            return;
                          }
                          // Generate minimal school-style report
                          const calculateMonthlyAttendance = () => {
                            const monthlyData: { [key: string]: { present: number; total: number } } = {};
                            attendanceHistory.forEach((record: any) => {
                              const date = new Date(record.date || record.createdAt);
                              const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                              if (!monthlyData[monthKey]) {
                                monthlyData[monthKey] = { present: 0, total: 0 };
                              }
                              monthlyData[monthKey].total += 1;
                              if (record.present) monthlyData[monthKey].present += 1;
                            });
                            return monthlyData;
                          };

                          const monthlyAttendance = calculateMonthlyAttendance();
                          const last3Months = Object.entries(monthlyAttendance).slice(-3).reverse();
                          const passedTests = testMarks.filter((t: any) => t.passed).length;
                          const avgPercentage = testMarks.length > 0 
                            ? (testMarks.reduce((sum: number, t: any) => sum + t.percentage, 0) / testMarks.length).toFixed(1)
                            : 0;

                          const printWindow = window.open('', '', 'height=900,width=850');
                          if (printWindow) {
                            const html = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <title>${student?.name} - Report Card</title>
                                <style>
                                  * { margin: 0; padding: 0; }
                                  body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
                                  .page { max-width: 800px; margin: 20px auto; padding: 30px; background: white; }
                                  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                                  .header h1 { font-size: 18px; margin-bottom: 5px; }
                                  .header p { font-size: 12px; color: #666; margin: 3px 0; }
                                  .header p { font-size: 12px; color: #666; }
                                  
                                  .info-row { display: flex; margin: 8px 0; font-size: 13px; }
                                  .info-label { width: 150px; font-weight: bold; }
                                  .info-value { flex: 1; }
                                  
                                  .section-title { font-weight: bold; font-size: 14px; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 5px; }
                                  
                                  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
                                  th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
                                  td { padding: 8px; border: 1px solid #ddd; }
                                  
                                  .summary { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 15px 0; }
                                  .summary-item { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 13px; }
                                  .summary-item .value { font-size: 18px; font-weight: bold; }
                                  .summary-item .label { font-size: 11px; color: #666; margin-top: 3px; }
                                  
                                  .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
                                  @media print { body { margin: 0; padding: 0; } .page { margin: 0; padding: 20px; } }
                                </style>
                              </head>
                              <body>
                                <div class="page">
                                  <div class="header">
                                    <h1>${tenant?.name || tenant?.instituteName || 'INSTITUTE'}</h1>
                                    <p>STUDENT REPORT CARD</p>
                                    <p style="font-size: 12px; color: #666; margin: 5px 0;">Academic Performance Summary</p>
                                  </div>

                                  <div class="info-row">
                                    <span class="info-label">Student Name:</span>
                                    <span class="info-value">${student?.name || 'N/A'}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">Course:</span>
                                    <span class="info-value">${student?.course || 'N/A'}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">Batch:</span>
                                    <span class="info-value">${batches.find((b: any) => b._id === student?.batchId)?.name || 'N/A'}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">Report Date:</span>
                                    <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  </div>

                                  <div class="section-title">ACADEMIC PERFORMANCE</div>
                                  <div class="summary">
                                    <div class="summary-item">
                                      <div class="value">${testMarks.length}</div>
                                      <div class="label">Total Tests</div>
                                    </div>
                                    <div class="summary-item">
                                      <div class="value">${passedTests}</div>
                                      <div class="label">Passed</div>
                                    </div>
                                    <div class="summary-item">
                                      <div class="value">${avgPercentage}%</div>
                                      <div class="label">Avg %</div>
                                    </div>
                                    <div class="summary-item">
                                      <div class="value">${testMarks.length > 0 ? Math.round((passedTests / testMarks.length) * 100) : 0}%</div>
                                      <div class="label">Pass Rate</div>
                                    </div>
                                  </div>

                                  <div class="section-title">TEST RESULTS</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Test</th>
                                        <th>Subject</th>
                                        <th>Date</th>
                                        <th>Marks</th>
                                        <th>%</th>
                                        <th>Rank</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${testMarks.map((test: any) => `
                                        <tr>
                                          <td>${test.name}</td>
                                          <td>${test.subject}</td>
                                          <td>${new Date(test.date || 0).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</td>
                                          <td>${test.marks}/${test.totalMarks}</td>
                                          <td>${test.percentage.toFixed(1)}</td>
                                          <td>#${test.rank || '-'}</td>
                                          <td>${test.passed ? 'PASS' : 'FAIL'}</td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>

                                  <div class="section-title">PROGRESS GRAPH</div>
                                  <pre style="font-family: monospace; font-size: 11px; line-height: 1.4; background: #f5f5f5; padding: 10px; border-radius: 4px;">
${testMarks.map((test: any) => {
  const barLength = 25;
  const filledLength = Math.round((test.percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `${test.name.substring(0, 12).padEnd(12)} ${bar} ${test.percentage.toFixed(1)}%`;
}).join('\n')}
                                  </pre>

                                  <div class="footer">
                                    Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            printWindow.document.write(html);
                            printWindow.document.close();
                            setTimeout(() => {
                              printWindow.print();
                              printWindow.close();
                            }, 250);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        PDF
                      </button>
                      <button
                        onClick={() => {
                          if (!tenant?.name) {
                            setStatus("⏳ Loading institute name... Please wait a moment and try again.");
                            setTimeout(() => setStatus(""), 3000);
                            return;
                          }
                          // Print minimal school-style report
                          const calculateMonthlyAttendance = () => {
                            const monthlyData: { [key: string]: { present: number; total: number } } = {};
                            attendanceHistory.forEach((record: any) => {
                              const date = new Date(record.date || record.createdAt);
                              const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                              if (!monthlyData[monthKey]) {
                                monthlyData[monthKey] = { present: 0, total: 0 };
                              }
                              monthlyData[monthKey].total += 1;
                              if (record.present) monthlyData[monthKey].present += 1;
                            });
                            return monthlyData;
                          };

                          const monthlyAttendance = calculateMonthlyAttendance();
                          const last3Months = Object.entries(monthlyAttendance).slice(-3).reverse();
                          const passedTests = testMarks.filter((t: any) => t.passed).length;
                          const avgPercentage = testMarks.length > 0 
                            ? (testMarks.reduce((sum: number, t: any) => sum + t.percentage, 0) / testMarks.length).toFixed(1)
                            : 0;

                          const printWindow = window.open('', '', 'height=900,width=850');
                          if (printWindow) {
                            const html = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <title>${student?.name} - Report Card</title>
                                <style>
                                  * { margin: 0; padding: 0; }
                                  body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
                                  .page { max-width: 800px; margin: 20px auto; padding: 30px; background: white; }
                                  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                                  .header h1 { font-size: 18px; margin-bottom: 5px; }
                                  .header p { font-size: 12px; color: #666; margin: 3px 0; }
                                  
                                  .info-row { display: flex; margin: 8px 0; font-size: 13px; }
                                  .info-label { width: 150px; font-weight: bold; }
                                  .info-value { flex: 1; }
                                  
                                  .section-title { font-weight: bold; font-size: 14px; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 5px; }
                                  
                                  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
                                  th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
                                  td { padding: 8px; border: 1px solid #ddd; }
                                  
                                  .summary { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 15px 0; }
                                  .summary-item { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 13px; }
                                  .summary-item .value { font-size: 18px; font-weight: bold; }
                                  .summary-item .label { font-size: 11px; color: #666; margin-top: 3px; }
                                  
                                  .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
                                  @media print { body { margin: 0; padding: 0; } .page { margin: 0; padding: 20px; } }
                                </style>
                              </head>
                              <body>
                                <div class="page">
                                  <div class="header">
                                    <h1>${tenant?.name || tenant?.instituteName || tenant?.title || 'INSTITUTE'}</h1>
                                    <p>STUDENT REPORT CARD</p>
                                    <p style="font-size: 12px; color: #666; margin: 5px 0;">Academic Performance Summary</p>
                                  </div>

                                  <div class="info-row">
                                    <span class="info-label">Student Name:</span>
                                    <span class="info-value">${student?.name || 'N/A'}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">Course:</span>
                                    <span class="info-value">${student?.course || 'N/A'}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">Batch:</span>
                                    <span class="info-value">${batches.find((b: any) => b._id === student?.batchId)?.name || 'N/A'}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">Report Date:</span>
                                    <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  </div>

                                  <div class="section-title">ACADEMIC PERFORMANCE</div>
                                  <div class="summary">
                                    <div class="summary-item">
                                      <div class="value">${testMarks.length}</div>
                                      <div class="label">Total Tests</div>
                                    </div>
                                    <div class="summary-item">
                                      <div class="value">${passedTests}</div>
                                      <div class="label">Passed</div>
                                    </div>
                                    <div class="summary-item">
                                      <div class="value">${avgPercentage}%</div>
                                      <div class="label">Avg %</div>
                                    </div>
                                    <div class="summary-item">
                                      <div class="value">${testMarks.length > 0 ? Math.round((passedTests / testMarks.length) * 100) : 0}%</div>
                                      <div class="label">Pass Rate</div>
                                    </div>
                                  </div>

                                  <div class="section-title">ATTENDANCE (Last 3 Months)</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Month</th>
                                        <th>Present</th>
                                        <th>Total</th>
                                        <th>%</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${last3Months.map(([month, data]: any) => {
                                        const percentage = data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : 0;
                                        return `
                                          <tr>
                                            <td><strong>${month}</strong></td>
                                            <td>${data.present}</td>
                                            <td>${data.total}</td>
                                            <td><strong>${percentage}%</strong></td>
                                          </tr>
                                        `;
                                      }).join('')}
                                    </tbody>
                                  </table>

                                  <div class="section-title">TEST RESULTS</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Test</th>
                                        <th>Subject</th>
                                        <th>Date</th>
                                        <th>Marks</th>
                                        <th>%</th>
                                        <th>Rank</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${testMarks.map((test: any) => `
                                        <tr>
                                          <td>${test.name}</td>
                                          <td>${test.subject}</td>
                                          <td>${new Date(test.date || 0).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</td>
                                          <td>${test.marks}/${test.totalMarks}</td>
                                          <td>${test.percentage.toFixed(1)}</td>
                                          <td>#${test.rank || '-'}</td>
                                          <td>${test.passed ? 'PASS' : 'FAIL'}</td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>

                                  <div class="section-title">PROGRESS GRAPH</div>
                                  <pre style="font-family: monospace; font-size: 11px; line-height: 1.4; background: #f5f5f5; padding: 10px; border-radius: 4px;">
${testMarks.map((test: any) => {
  const barLength = 25;
  const filledLength = Math.round((test.percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `${test.name.substring(0, 12).padEnd(12)} ${bar} ${test.percentage.toFixed(1)}%`;
}).join('\n')}
                                  </pre>

                                  <div class="section-title">ATTENDANCE (Last 3 Months)</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Month</th>
                                        <th>Present</th>
                                        <th>Total</th>
                                        <th>%</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${last3Months.map(([month, data]: any) => {
                                        const percentage = data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : 0;
                                        return `
                                          <tr>
                                            <td>${month}</td>
                                            <td>${data.present}</td>
                                            <td>${data.total}</td>
                                            <td>${percentage}</td>
                                          </tr>
                                        `;
                                      }).join('')}
                                    </tbody>
                                  </table>

                                  <div class="footer">
                                    Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            printWindow.document.write(html);
                            printWindow.document.close();
                            setTimeout(() => printWindow.print(), 250);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm-6 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                        </svg>
                        Print
                      </button>
                    </div>
                  )}

                  {testMarks.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No test results available yet</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Fee Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Total Fees:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{student?.fees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Already Paid:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Remaining to Pay:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">₹{(student?.fees || 0) - payments.reduce((sum, p) => sum + (p.amount || 0), 0)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹) * <span className="text-xs text-orange-600 dark:text-orange-400">(Max: ₹{(student?.fees || 0) - payments.reduce((sum, p) => sum + (p.amount || 0), 0)})</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={(student?.fees || 0) - payments.reduce((sum, p) => sum + (p.amount || 0), 0)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online/UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                disabled={!paymentAmount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Send Notification to {student?.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  📧 Email will be sent to: {student?.email || 'No email on file'}
                </p>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span>
                    This will send both an <strong>in-app notification</strong> and an <strong>email</strong> to the student.
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="announcement">Announcement</option>
                  <option value="fee">Fee Reminder</option>
                  <option value="test">Test/Exam</option>
                  <option value="attendance">Attendance Alert</option>
                  <option value="result">Result</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={notificationPriority}
                  onChange={(e) => setNotificationPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowNotificationModal(false)}
                disabled={sendingNotification}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={!notificationTitle || !notificationMessage || sendingNotification}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {sendingNotification ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    Send Notification & Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
