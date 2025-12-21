"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import type { StudentDTO, StudentFormData, StudentDetailResponse, StudentMutationResponse } from "@/types/student";
import { api, safeApiCall } from "@/lib/apiClient";

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
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "attendance">("overview");
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
  }, [activeTab, currentMonth, studentId]);

  useEffect(() => {
    if (!user) return;
    fetchStudent();
    fetchBatches();
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
    setStatus("Adding payment...");
    try {
      const [data, err] = await safeApiCall(() =>
        api.post<any>(`/api/payments`, { 
          studentId, 
          amount: Number(paymentAmount),
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

  const feesPaid = student.balance ?? 0;
  const feesTotal = student.fees ?? 0;
  const feesPending = feesTotal - feesPaid;
  const feesPercentage = feesTotal > 0 ? (feesPaid / feesTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Fee</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{feesTotal.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{feesPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{payments.length} payments</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{feesPending.toLocaleString()}</p>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full transition-all" style={{ width: `${feesPercentage}%` }}></div>
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 p-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                  activeTab === "payments"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => {
                  setActiveTab("attendance");
                  if (attendanceHistory.length === 0) {
                    fetchAttendance();
                  }
                }}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                  activeTab === "attendance"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Attendance
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
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
                    <input 
                      name="course" 
                      value={form.course} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600" 
                    />
                  ) : (
                    <p className="text-lg font-semibold">{student.course}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Batch</label>
                  {editing ? (
                    <select
                      name="batchId"
                      value={form.batchId || ''}
                      onChange={handleChange}
                      disabled={loadingBatches}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                    >
                      <option value="">
                        {loadingBatches ? 'Loading batches...' : 'Select batch'}
                      </option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.name}
                        </option>
                      ))}                   
                    </select>
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

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete Payment"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min={0}
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
    </div>
  );
}
