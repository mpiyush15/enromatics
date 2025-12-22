"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Transaction {
  _id: string;
  type: "payment" | "refund";
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
    batchName: string;
  };
  amount: number;
  method: string;
  date: string;
  status: string;
  receiptNumber?: string;
  receiptGenerated?: boolean;
  transactionId?: string;
  remarks?: string;
  feeType?: string;
  refundReason?: string;
  createdAt: string;
}

interface Batch {
  _id: string;
  name: string;
}

export default function AllTransactionsPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    type: "all", // all, payment, refund
    status: "all", // all, paid, pending, refunded
    batch: "all",
    dateFrom: "",
    dateTo: "",
    search: "", // student name or roll number
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch("/api/academics/batches", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setBatches(data.batches || []);
        }
      } catch (err) {
        console.error("Error loading batches:", err);
      }
    };
    fetchBatches();
  }, []);

  // Load all transactions on mount (fetch once)
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching all transactions...");

      const res = await fetch(`/api/accounts/transactions`, {
        credentials: "include",
      });

      console.log("📥 Response status:", res.status);

      const data = await res.json();
      
      console.log("📊 Response data:", {
        success: data.success,
        message: data.message,
        count: data.transactions?.length || 0
      });

      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        console.error("❌ Failed to load transactions:", data.message);
        alert(`❌ Failed to load transactions: ${data.message}`);
      }
    } catch (err: any) {
      console.error("❌ Error loading transactions:", err);
      alert(`❌ Error loading transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      batch: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleViewReceipt = async (transactionId: string) => {
    try {
      const res = await fetch(`/api/accounts/receipts/generate/${transactionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deliveryMethod: "hand" }),
      });

      const data = await res.json();
      if (data.success) {
        // Open receipt in new window or show modal
        alert("✅ Receipt generated! (Add receipt modal here)");
      } else {
        alert("❌ " + (data.message || "Failed to generate receipt"));
      }
    } catch (err) {
      console.error("Generate receipt error:", err);
      alert("❌ Error generating receipt");
    }
  };

  const handleDelete = async (transactionId: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const endpoint =
        type === "payment"
          ? `/api/accounts/payments/${transactionId}`
          : `/api/accounts/refunds/${transactionId}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        fetchTransactions();
      } else {
        alert("❌ " + (data.message || "Failed to delete"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Error deleting transaction");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Apply filters and sorting to transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Filter by batch
    if (filters.batch !== "all") {
      const selectedBatch = batches.find((b) => b._id === filters.batch);
      if (selectedBatch) {
        filtered = filtered.filter((t) => 
          t.studentId.batchName === selectedBatch.name
        );
      }
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter((t) => new Date(t.date).getTime() >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      filtered = filtered.filter((t) => new Date(t.date).getTime() <= toDate);
    }

    // Filter by search (student name or roll number)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter((t) => {
        const name = t.studentId.name?.toLowerCase() || "";
        const rollNumber = t.studentId.rollNumber?.toLowerCase() || "";
        return name.includes(searchLower) || rollNumber.includes(searchLower);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof Transaction];
      let bVal: any = b[sortField as keyof Transaction];

      // Handle nested fields
      if (sortField === "studentId.name") {
        aVal = a.studentId.name;
        bVal = b.studentId.name;
      }

      // Handle date fields
      if (sortField === "date" || sortField === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle string comparison
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle number comparison
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  };

  const filteredTransactions = getFilteredAndSortedTransactions();

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        ←
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 border rounded-lg transition ${
            currentPage === i
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        →
      </button>
    );

    return pages;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              💳 All Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete history of payments and refunds
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

        {/* Filters Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🔍</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Refine your search results
                </p>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition"
            >
              🧹 Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="payment">💰 Payments</option>
                <option value="refund">💸 Refunds</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="paid">✅ Paid</option>
                <option value="pending">⏳ Pending</option>
                <option value="refunded">💸 Refunded</option>
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch
              </label>
              <select
                value={filters.batch}
                onChange={(e) => handleFilterChange("batch", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Student
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Name or Roll No."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10 entries</option>
                <option value={15}>15 entries</option>
                <option value={25}>25 entries</option>
                <option value={50}>50 entries</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTransactions.length} {filters.type !== "all" || filters.status !== "all" || filters.batch !== "all" || filters.dateFrom || filters.dateTo || filters.search ? "filtered" : "total"} transactions
                {transactions.length !== filteredTransactions.length && (
                  <span className="ml-1 text-xs">({transactions.length} total)</span>
                )}
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading transactions...
                  </p>
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📭</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {transactions.length === 0 ? "No transactions found" : "No matching transactions"}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {transactions.length === 0 ? "Add a new payment to get started" : "Try adjusting your filters"}
                </p>
                {transactions.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th
                      onClick={() => handleSort("date")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortField === "date" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th
                      onClick={() => handleSort("studentId.name")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        Student
                        {sortField === "studentId.name" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Batch
                    </th>
                    <th
                      onClick={() => handleSort("amount")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        {sortField === "amount" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Receipt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentTransactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(transaction.date)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.type === "payment"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {transaction.type === "payment" ? "💰" : "💸"}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.studentId.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Roll: {transaction.studentId.rollNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-xs font-semibold">
                          {transaction.studentId.batchName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-bold ${
                            transaction.type === "payment"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "payment" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium uppercase">
                          {transaction.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.receiptGenerated ? (
                          <div>
                            <div className="text-xs font-bold text-green-600 dark:text-green-400">
                              ✓ {transaction.receiptNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            Not Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === "paid"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {transaction.status === "paid" && "✅"}
                          {transaction.status === "pending" && "⏳"}
                          {transaction.status === "refunded" && "💸"}
                          {" "}
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Receipt - Eye Icon */}
                          <button
                            onClick={() => handleViewReceipt(transaction._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group relative"
                            title="View Receipt"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              View Receipt
                            </span>
                          </button>

                          {/* Download Receipt */}
                          {transaction.receiptGenerated && (
                            <button
                              onClick={() => handleViewReceipt(transaction._id)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors group relative"
                              title="Download Receipt"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Download
                              </span>
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => alert("Edit functionality - To be implemented")}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors group relative"
                            title="Edit Transaction"
                          >
                            <span className="text-lg">✏️</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Edit
                            </span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(transaction._id, transaction.type)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group relative"
                            title="Delete Transaction"
                          >
                            <span className="text-lg">🗑️</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center gap-2">{renderPagination()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
