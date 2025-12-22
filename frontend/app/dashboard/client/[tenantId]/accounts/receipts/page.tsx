"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import FeeReceipt from "@/components/accounts/FeeReceipt";

export default function FeeReceiptsPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const searchParams = useSearchParams();
  
  const [searchType, setSearchType] = useState<"rollNumber" | "batch" | "name">("rollNumber");
  const [searchValue, setSearchValue] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  // Fetch tenant info on mount
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const res = await fetch(`/api/tenant/${tenantId}`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setTenantInfo(data.tenant);
        }
      } catch (err) {
        console.error("Failed to fetch tenant info:", err);
      }
    };
    
    if (tenantId) {
      fetchTenantInfo();
    }
  }, [tenantId]);

  // Pre-fill search from URL params
  useEffect(() => {
    const search = searchParams?.get('search');
    if (search) {
      setSearchValue(search);
      setSearchType('rollNumber');
      setTimeout(() => searchStudents(), 100);
    }
  }, [searchParams]);

  const searchStudents = async () => {
    if (!searchValue.trim()) {
      alert('⚠️ Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      setStudents([]);
      setSelectedStudent(null);
      
      const params = new URLSearchParams();
      params.append(searchType, searchValue.trim());

      const res = await fetch(`/api/accounts/receipts/search?${params.toString()}`, {
        credentials: "include"
      });

      const data = await res.json();

      if (data.success) {
        setStudents(data.students);
        if (data.students.length === 1) {
          setSelectedStudent(data.students[0]);
        }
        if (data.students.length === 0) {
          alert('ℹ️ No students found with the given search criteria');
        }
      } else {
        alert('❌ ' + (data.message || 'Failed to search students'));
      }
    } catch (err: any) {
      console.error("❌ Search error:", err);
      alert('❌ Error searching students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/accounts/receipts/generate/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deliveryMethod: "hand" })
      });

      const data = await res.json();
      if (data.success) {
        // Show the receipt modal
        setSelectedPayment(data.payment);
        setShowReceipt(true);
        
        // Update the student's payment in the UI to reflect receipt generation
        if (selectedStudent) {
          const updatedPayments = selectedStudent.payments.map((p: any) => 
            p._id === paymentId 
              ? { ...p, receiptGenerated: true, receiptNumber: data.payment.receiptNumber }
              : p
          );
          setSelectedStudent({ ...selectedStudent, payments: updatedPayments });
        }
      } else {
        alert('❌ ' + (data.message || 'Failed to generate receipt'));
      }
    } catch (err: any) {
      console.error("❌ Generate receipt error:", err);
      alert('❌ Error generating receipt: ' + err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🧾 Fee Receipts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search students and view their payment receipts
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/dashboard/client/${tenantId}/accounts/add-payment`}>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-md hover:shadow-lg transition-all">
                💰 Add Payment
              </button>
            </Link>
            <Link href={`/dashboard/client/${tenantId}/accounts/overview`}>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition">
                ← Back to Overview
              </button>
            </Link>
          </div>
        </div>

        {/* Clean Search Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🔍</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Search Student</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find by roll number, name, or batch</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Search Type Pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Search By
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchType("rollNumber")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    searchType === "rollNumber"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  🎯 Roll Number
                </button>
                <button
                  onClick={() => setSearchType("name")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    searchType === "name"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  👤 Student Name
                </button>
                <button
                  onClick={() => setSearchType("batch")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    searchType === "batch"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  📚 Batch
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {searchType === "rollNumber" 
                  ? "Enter Roll Number" 
                  : searchType === "name" 
                  ? "Enter Student Name" 
                  : "Enter Batch Name"}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchStudents()}
                  placeholder={
                    searchType === "rollNumber" 
                      ? "e.g., 2024001" 
                      : searchType === "name" 
                      ? "e.g., Piyush" 
                      : "e.g., NEET 2026"
                  }
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  autoFocus
                />
                <button
                  onClick={searchStudents}
                  disabled={loading || !searchValue.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🔍</span>
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {students.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                📋 Search Results
              </h3>
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                {students.length} {students.length === 1 ? 'Student' : 'Students'} Found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`group relative p-5 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-xl ${
                    selectedStudent?._id === student._id
                      ? "border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  {selectedStudent?._id === student._id && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Roll: {student.rollNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg text-xs font-semibold">
                      {student.course}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-xs font-semibold">
                      {student.batchName}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(student.fees)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid</div>
                      <div className="font-bold text-green-600 dark:text-green-400 text-sm">
                        {formatCurrency(student.totalPaid)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due</div>
                      <div className="font-bold text-red-600 dark:text-red-400 text-sm">
                        {formatCurrency(student.totalDue)}
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 border-2 border-blue-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Student Payment History */}
        {selectedStudent && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-3">{selectedStudent.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <div className="opacity-80 mb-1">Roll Number</div>
                      <div className="font-bold text-lg">{selectedStudent.rollNumber}</div>
                    </div>
                    <div>
                      <div className="opacity-80 mb-1">Course</div>
                      <div className="font-bold text-lg">{selectedStudent.course}</div>
                    </div>
                    <div>
                      <div className="opacity-80 mb-1">Batch</div>
                      <div className="font-bold text-lg">{selectedStudent.batchName}</div>
                    </div>
                    <div>
                      <div className="opacity-80 mb-1">Phone</div>
                      <div className="font-bold text-lg">{selectedStudent.phone}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition backdrop-blur-sm"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">💳</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedStudent.payments?.length || 0} payments recorded
                    </p>
                  </div>
                </div>
              </div>

              {/* Receipt Info Banner */}
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">How to Generate Receipts</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Click <strong>"Generate Receipt"</strong> for payments without receipts to create a receipt number. 
                      Once generated, you can print the receipt. Already generated receipts can be viewed anytime.
                    </p>
                  </div>
                </div>
              </div>

              {selectedStudent.payments && selectedStudent.payments.length > 0 ? (
                <div className="space-y-3">
                  {selectedStudent.payments.map((payment: any) => (
                    <div
                      key={payment._id}
                      className="group p-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {new Date(payment.date).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</div>
                            <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                              {formatCurrency(payment.amount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Method</div>
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-semibold uppercase">
                              {payment.method}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receipt</div>
                            {payment.receiptGenerated ? (
                              <div>
                                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-bold">
                                  ✓ {payment.receiptNumber}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm font-semibold">
                                Not Generated
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateReceipt(payment._id)}
                          className={`px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                            payment.receiptGenerated
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                              : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                          }`}
                        >
                          <span className="text-lg">{payment.receiptGenerated ? "🧾" : "✨"}</span>
                          <span>{payment.receiptGenerated ? "View Receipt" : "Generate Receipt"}</span>
                        </button>
                      </div>

                      {(payment.feeType || payment.remarks) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-2 text-xs">
                          {payment.feeType && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded">
                              {payment.feeType}
                            </span>
                          )}
                          {payment.remarks && (
                            <span className="text-gray-600 dark:text-gray-400 italic">
                              "{payment.remarks}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📭</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    No payment history found
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    This student hasn't made any payments yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showReceipt && selectedPayment && (
          <FeeReceipt
            payment={selectedPayment}
            tenantInfo={tenantInfo}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
    </div>
  );
}
