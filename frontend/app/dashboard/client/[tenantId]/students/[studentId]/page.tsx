"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { tenantId, studentId } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [status, setStatus] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "payments">("overview");

  // Helper to get auth headers
  const getHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "GET",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStudent(data.student);
        setPayments(data.payments || []);
        setForm({
          name: data.student.name || "",
          email: data.student.email || "",
          phone: data.student.phone || "",
          gender: data.student.gender || "",
          course: data.student.course || "",
          batch: data.student.batch || "",
          address: data.student.address || "",
          fees: data.student.fees ?? 0,
          status: data.student.status || "active",
        });
      } else {
        setStatus(data.message || "Failed to fetch student");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error fetching student");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchStudent();
  }, [user, studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update student");
      setStudent(data.student);
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
      const res = await fetch(`/api/students/${studentId}/reset-password`, {
        method: "PUT",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      const newPwd = data.newPassword;
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
      const res = await fetch(`/api/payments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ studentId, amount: Number(paymentAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add payment");
      setPaymentAmount("");
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
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
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
            <span>Back to Students</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${
                  student.status === "active" ? "bg-green-500" : "bg-red-500"
                }`}></div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    student.status === "active" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {student.status}
                  </span>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Roll No: {student.rollNumber}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{student.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{student.course} - {student.batch}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors"
                    >
                      🔑 Reset Password
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchStudent();
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Fees Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Fees Paid</p>
                <p className="text-3xl font-bold">₹{feesPaid.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500" 
                style={{ width: `${feesPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm opacity-90">Pending: ₹{feesPending.toLocaleString()} / Total: ₹{feesTotal.toLocaleString()}</p>
          </div>

          {/* Payments Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Payments</p>
                <p className="text-3xl font-bold">{payments.length}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">
              Last payment: {payments.length > 0 
                ? new Date(payments[payments.length - 1].date).toLocaleDateString() 
                : "No payments yet"}
            </p>
          </div>

          {/* Course Info Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Course</p>
                <p className="text-2xl font-bold">{student.course}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Batch: {student.batch}</p>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl font-semibold ${
            status.includes("✅") 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : status.includes("❌") 
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}>
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
              }`}
            >
              📋 Overview
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === "payments"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
              }`}
            >
              💳 Payments ({payments.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg p-8">
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
                    <input 
                      name="batch" 
                      value={form.batch} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600" 
                    />
                  ) : (
                    <p className="text-lg font-semibold">{student.batch || "Not assigned"}</p>
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
              {/* Add Payment Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl border-2 border-blue-200 dark:border-gray-600">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Payment
                </h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount (₹)"
                    className="flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <button 
                    onClick={handleAddPayment}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                  >
                    💰 Add Payment
                  </button>
                </div>
              </div>

              {/* Payments List */}
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Payment History</h3>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">No payments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{payment.method || "Payment"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(payment.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(payment._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 rounded-lg font-semibold text-sm transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
