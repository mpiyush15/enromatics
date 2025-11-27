"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import FeeReceipt from "@/components/accounts/FeeReceipt";

export default function FeeReceiptsPage() {
  const { tenantId } = useParams();
  const [searchType, setSearchType] = useState<"rollNumber" | "batch" | "name">("rollNumber");
  const [searchValue, setSearchValue] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Form for new payment
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    date: new Date().toISOString().split("T")[0],
    feeType: "tuition",
    month: "",
    academicYear: "",
    transactionId: "",
    remarks: "",
    generateReceipt: true,
    deliveryMethod: "none"
  });

  const searchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append(searchType, searchValue);

      // Use BFF route with caching
      const res = await fetch(`/api/accounts/receipts/search?${params.toString()}`, {
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        if (data.students.length === 1) {
          setSelectedStudent(data.students[0]);
        }
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      // Use BFF route
      const res = await fetch(`/api/accounts/receipts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: selectedStudent._id,
          ...paymentForm,
          amount: Number(paymentForm.amount)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Payment recorded successfully!");
        setSelectedPayment(data.payment);
        if (paymentForm.generateReceipt) {
          setShowReceipt(true);
        }
        setShowPaymentForm(false);
        // Refresh student data
        searchStudents();
      } else {
        alert("❌ " + (data.message || "Failed to record payment"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Error recording payment");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      // Use BFF route
      const res = await fetch(`/api/accounts/receipts/generate/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deliveryMethod: "hand" })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedPayment(data.payment);
        setShowReceipt(true);
      }
    } catch (err) {
      console.error("Generate receipt error:", err);
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
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🧾 Fee Receipts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search students and generate fee receipts
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🔍 Search Student</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search By
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="rollNumber">Roll Number</option>
                <option value="batch">Batch</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Value
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchStudents()}
                placeholder={`Enter ${searchType === "rollNumber" ? "roll number" : searchType}...`}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={searchStudents}
                disabled={loading || !searchValue}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "🔍 Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {students.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Results ({students.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedStudent?._id === student._id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Roll: {student.rollNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {student.course} | Batch {student.batch}
                        </div>
                      </div>
                    </div>
                    {selectedStudent?._id === student._id && (
                      <span className="text-blue-600 text-xl">✓</span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Total Fees</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(student.fees)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Paid</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(student.totalPaid)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Due</div>
                      <div className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(student.totalDue)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Student Details */}
        {selectedStudent && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedStudent.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="opacity-80">Roll Number</div>
                  <div className="font-semibold">{selectedStudent.rollNumber}</div>
                </div>
                <div>
                  <div className="opacity-80">Course</div>
                  <div className="font-semibold">{selectedStudent.course}</div>
                </div>
                <div>
                  <div className="opacity-80">Batch</div>
                  <div className="font-semibold">{selectedStudent.batch}</div>
                </div>
                <div>
                  <div className="opacity-80">Phone</div>
                  <div className="font-semibold">{selectedStudent.phone}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h4>
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-md transition"
                >
                  ➕ Record New Payment
                </button>
              </div>

              {/* New Payment Form */}
              {showPaymentForm && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Record New Payment</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount *
                      </label>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={paymentForm.date}
                        onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fee Type
                      </label>
                      <select
                        value={paymentForm.feeType}
                        onChange={(e) => setPaymentForm({ ...paymentForm, feeType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="tuition">Tuition Fee</option>
                        <option value="admission">Admission Fee</option>
                        <option value="exam">Exam Fee</option>
                        <option value="library">Library Fee</option>
                        <option value="transport">Transport Fee</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Month/Period
                      </label>
                      <input
                        type="text"
                        value={paymentForm.month}
                        onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., January 2025"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={paymentForm.remarks}
                        onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Optional remarks"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentForm.generateReceipt}
                          onChange={(e) => setPaymentForm({ ...paymentForm, generateReceipt: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Generate Receipt
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleCreatePayment}
                      disabled={loading || !paymentForm.amount}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-md transition disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "💾 Save Payment"}
                    </button>
                    <button
                      onClick={() => setShowPaymentForm(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Payment History Table */}
              {selectedStudent.payments && selectedStudent.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Receipt</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedStudent.payments.map((payment: any) => (
                        <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 uppercase">
                              {payment.method}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {payment.receiptGenerated ? (
                              <div>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  ✓ {payment.receiptNumber}
                                </span>
                                {payment.receiptDelivered && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Delivered via {payment.receiptDeliveryMethod}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Not Generated
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleGenerateReceipt(payment._id)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              🧾 View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No payment history found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && selectedPayment && (
          <FeeReceipt
            payment={selectedPayment}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
    </div>
  );
}
