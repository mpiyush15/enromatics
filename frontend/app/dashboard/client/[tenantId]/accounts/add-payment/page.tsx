"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AddPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;

  const [step, setStep] = useState<"select" | "payment">("select");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters for student selection
  const [selectedBatch, setSelectedBatch] = useState("");
  const [searchName, setSearchName] = useState("");
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    date: new Date().toISOString().split("T")[0],
    feeType: "tuition",
    month: "",
    academicYear: "2024-25",
    transactionId: "",
    remarks: "",
    generateReceipt: true,
  });

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const res = await fetch(`/api/academics/batches`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAvailableBatches(data.batches || []);
      }
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  // Fetch students by batch
  const fetchStudentsByBatch = async () => {
    if (!selectedBatch) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/students?batch=${selectedBatch}&limit=1000`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Filter students with pending fees
        const studentsWithPending = (data.students || [])
          .filter((s: any) => {
            const pending = (s.fees || 0) - (s.balance || 0);
            return pending > 0;
          })
          .map((s: any) => ({
            ...s,
            pendingAmount: (s.fees || 0) - (s.balance || 0),
          }));
        setStudents(studentsWithPending);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudentsByBatch();
    } else {
      setStudents([]);
      setFilteredStudents([]);
      setSelectedStudent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  // Filter students by name
  useEffect(() => {
    if (searchName.trim()) {
      const filtered = students.filter((student) =>
        student.name.toLowerCase().includes(searchName.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchName, students]);

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setPaymentForm({
      ...paymentForm,
      amount: student.pendingAmount.toString(),
    });
    setStep("payment");
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      
      console.log('📤 Submitting payment:', {
        studentId: selectedStudent._id,
        studentName: selectedStudent.name,
        amount: Number(paymentForm.amount),
        form: paymentForm
      });

      const res = await fetch(`/api/accounts/receipts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: selectedStudent._id,
          ...paymentForm,
          amount: Number(paymentForm.amount),
        }),
      });

      const data = await res.json();
      
      console.log('📥 Payment response:', { 
        status: res.status, 
        success: data.success, 
        message: data.message 
      });

      if (data.success) {
        alert("✅ Payment recorded successfully!");
        // Reset and go back to selection
        setStep("select");
        setSelectedStudent(null);
        setPaymentForm({
          amount: "",
          method: "cash",
          date: new Date().toISOString().split("T")[0],
          feeType: "tuition",
          month: "",
          academicYear: "2024-25",
          transactionId: "",
          remarks: "",
          generateReceipt: true,
        });
        // Refresh student list
        if (selectedBatch) {
          fetchStudentsByBatch();
        }
      } else {
        alert(`❌ Failed to record payment: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error("❌ Payment submission error:", err);
      alert(`❌ Error recording payment: ${err.message || 'Network error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              💰 Add Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === "select" ? "Select batch and student" : "Record payment details"}
            </p>
          </div>
          <Link href={`/dashboard/client/${tenantId}/accounts/overview`}>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition">
              ← Back to Overview
            </button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === "select" ? "text-blue-600" : "text-green-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "select" ? "bg-blue-100 dark:bg-blue-900" : "bg-green-100 dark:bg-green-900"}`}>
                {step === "payment" ? "✓" : "1"}
              </div>
              <span className="font-semibold">Select Student</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "payment" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}>
                2
              </div>
              <span className="font-semibold">Payment Details</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Student */}
        {step === "select" && (
          <>
            {/* Batch Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">� Search Students</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch Name
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                  >
                    <option value="">-- Select Batch --</option>
                    {availableBatches.map((batch) => (
                      <option key={batch._id} value={batch.name}>
                        {batch.name} ({batch.course})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search by name..."
                    disabled={!selectedBatch}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedBatch("");
                      setSearchName("");
                    }}
                    disabled={!selectedBatch}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 font-medium transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              {searchName && selectedBatch && (
                <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                  🔍 Filtering by: <span className="font-semibold">{searchName}</span>
                </div>
              )}
            </div>

            {/* Students List */}
            {selectedBatch && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      👥 Students with Pending Fees
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {searchName && (
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Filtered: {filteredStudents.length} of {students.length}
                      </span>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {!searchName ? `${students.length} student${students.length !== 1 ? "s" : ""} found` : ""}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No Pending Fees!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All students in this batch have cleared their fees.
                    </p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No students match the name "<span className="font-semibold">{searchName}</span>"
                    </p>
                    <button
                      onClick={() => setSearchName("")}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {student.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Roll: {student.rollNumber}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Fees:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(student.fees || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(student.balance || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">Pending:</span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(student.pendingAmount || 0)}
                            </span>
                          </div>
                        </div>
                        <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition">
                          Select & Pay →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 2: Payment Form */}
        {step === "payment" && selectedStudent && (
          <>
            {/* Student Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedStudent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-blue-100">Roll: {selectedStudent.rollNumber} • Batch: {selectedStudent.batch}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep("select");
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
                >
                  Change Student
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-blue-100 text-sm">Total Fees</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedStudent.fees || 0)}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Already Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedStudent.balance || 0)}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Pending Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedStudent.pendingAmount || 0)}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmitPayment} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💳 Payment Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 UPI</option>
                    <option value="card">💳 Card</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="cheque">📝 Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fee Type
                  </label>
                  <select
                    value={paymentForm.feeType}
                    onChange={(e) => setPaymentForm({ ...paymentForm, feeType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="tuition">📚 Tuition Fee</option>
                    <option value="admission">✍️ Admission Fee</option>
                    <option value="exam">📝 Exam Fee</option>
                    <option value="library">📖 Library Fee</option>
                    <option value="lab">🔬 Lab Fee</option>
                    <option value="transport">🚌 Transport Fee</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.month}
                    onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., January 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={paymentForm.academicYear}
                    onChange={(e) => setPaymentForm({ ...paymentForm, academicYear: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 2024-25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter transaction ID"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentForm.generateReceipt}
                      onChange={(e) => setPaymentForm({ ...paymentForm, generateReceipt: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      🧾 Generate Receipt Automatically
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setStep("select");
                    setSelectedStudent(null);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : "💰 Record Payment"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
