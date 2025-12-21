"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UpsellModal } from "@/components/PlanGating";
import useAuth from "@/hooks/useAuth";
import { StudentListSkeleton } from "@/components/ui/Skeleton";
import type { StudentDTO, StudentListResponse } from "@/types/student";

interface Quota {
  current: number;
  cap: number;
  canAdd: boolean;
  plan: string;
}

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = params?.tenantId as string;
  const { user } = useAuth();

  /* ================= DATA ================= */
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [limit, setLimit] = useState(10); // Per page limit

  /* ================= FILTER INPUTS ================= */
  const [batchFilter, setBatchFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [rollFilter, setRollFilter] = useState("");
  const [feesStatus, setFeesStatus] = useState("all");

  /* ================= APPLIED FILTERS ================= */
  const [appliedFilters, setAppliedFilters] = useState({
    batch: "",
    course: "",
    roll: "",
    fees: "all",
  });

  /* ================= UI ================= */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  /* ================= DEBOUNCE FILTER INPUT ================= */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPage(1);
      setAppliedFilters({
        batch: batchFilter,
        course: courseFilter,
        roll: rollFilter,
        fees: feesStatus,
      });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [batchFilter, courseFilter, rollFilter, feesStatus]);

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      if (isInitialLoad.current) setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (appliedFilters.batch) params.set("batch", appliedFilters.batch);
      if (appliedFilters.course) params.set("course", appliedFilters.course);
      if (appliedFilters.roll) params.set("rollNumber", appliedFilters.roll);
      if (appliedFilters.fees !== "all") params.set("feesStatus", appliedFilters.fees);

      const res = await fetch(`/api/students?${params.toString()}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Fetch failed");

      setStudents(data.students || []);
      setPages(data.pages || 1);
      if (data.quota) setQuota(data.quota);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      isInitialLoad.current = false;
      setLoading(false);
    }
  };

  /* ================= FETCH ON PAGE / FILTER / LIMIT APPLY ================= */
  useEffect(() => {
    fetchStudents();
  }, [page, appliedFilters, limit]);

  /* ================= HANDLE ?refresh=1 ================= */
  useEffect(() => {
    if (searchParams?.get("refresh") === "1") {
      setPage(1);
      // 🔥 Immediately fetch with cache bust (_ts parameter)
      // This prevents returning stale cached data
      const bustedFetch = async () => {
        try {
          setLoading(true);
          const params = new URLSearchParams();
          params.set("page", "1");
          params.set("limit", "10");
          params.set("_ts", Date.now().toString()); // Cache buster
          
          if (appliedFilters.batch) params.set("batch", appliedFilters.batch);
          if (appliedFilters.course) params.set("course", appliedFilters.course);
          if (appliedFilters.roll) params.set("rollNumber", appliedFilters.roll);
          if (appliedFilters.fees !== "all") params.set("feesStatus", appliedFilters.fees);

          const res = await fetch(`/api/students?${params.toString()}`, {
            credentials: "include",
          });

          const data = await res.json();
          if (!data.success) throw new Error(data.message || "Fetch failed");

          setStudents(data.students || []);
          setPages(data.pages || 1);
          if (data.quota) setQuota(data.quota);
        } catch (err: any) {
          console.error(err);
          setError(err.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
      };
      
      bustedFetch();
      router.replace(`/dashboard/client/${tenantId}/students`, { scroll: false });
    }
  }, [searchParams]);

  /* ================= CSV ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadFile(e.target.files[0]);
      setUploadResults(null);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.split(",");
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = values[i]?.trim() || ""));
      return obj;
    });
  };

  const handleUploadCSV = async () => {
    if (!uploadFile) return;
    setUploading(true);

    try {
      const studentsData = parseCSV(await uploadFile.text());

      const res = await fetch("/api/students/bulk-upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: studentsData }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setUploadResults(data.results);
      setPage(1);
    } catch (e) {
      console.error(e);
      alert("CSV upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = `name,email,phone,gender,course,batch,address,fees
John Doe,john@example.com,1234567890,Male,Math,2024,Street 1,5000`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_sample.csv";
    a.click();
  };

  if (loading) return <StudentListSkeleton />;

  /* ================= UI (UNCHANGED) ================= */
  return (
    <>
      <UpsellModal
        isOpen={showUpsellModal}
        featureName="adding more students"
        currentTier={user?.subscriptionTier || "basic"}
        suggestedTier="pro"
        onClose={() => setShowUpsellModal(false)}
      />
<div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              👥 Students Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and view all enrolled students
              {quota && (
                <span className={`ml-2 text-sm font-medium ${quota.canAdd ? 'text-green-600' : 'text-red-600'}`}>
                  ({quota.current}/{quota.cap === -1 ? '∞' : quota.cap} students)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">📤</span>
              Upload CSV
            </button>
            <div className="relative group">
              <button 
                onClick={() => {
                  if (quota && !quota.canAdd) {
                    setShowUpsellModal(true);
                    return;
                  }
                  router.push(`/dashboard/client/${tenantId}/students/add`);
                }}
                disabled={quota !== null && !quota.canAdd}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform flex items-center gap-2 ${
                  quota && !quota.canAdd
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105'
                }`}
              >
                <span className="text-xl">➕</span>
                Add Student
              </button>
              {/* Tooltip for disabled button */}
              {quota && !quota.canAdd && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Student limit reached ({quota.current}/{quota.cap}).
                  <button
                    onClick={() => router.push(`/dashboard/client/${tenantId}/my-subscription`)}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Upgrade Plan
                  </button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🔍 Search & Filter</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎓 Batch
              </label>
              <input
                type="text"
                placeholder="Enter batch..."
                value={batchFilter}
                onChange={(e) => {
                  setBatchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📚 Course
              </label>
              <input
                type="text"
                placeholder="Enter course..."
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔢 Roll Number
              </label>
              <input
                type="text"
                placeholder="Enter roll number..."
                value={rollFilter}
                onChange={(e) => {
                  setRollFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💰 Fees Status
              </label>
              <select
                value={feesStatus}
                onChange={(e) => {
                  setFeesStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              >
                <option value="all">All Students</option>
                <option value="paid_gt_50">Paid &gt; 50%</option>
                <option value="remaining_gt_50">Remaining &gt; 50%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 p-4 rounded-xl shadow-md">
            <p className="font-medium">❌ {error}</p>
          </div>
        )}

        {/* Students List */}
        {students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Students Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {batchFilter || courseFilter || rollFilter || feesStatus !== "all"
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first student."}
            </p>
            <Link href={`/dashboard/client/${tenantId}/students/add`}>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                ➕ Add First Student
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Course Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student, index) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/client/${tenantId}/students/${student._id}`}>
                            <div className="flex items-center cursor-pointer group">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                  {student.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {student.gender || "N/A"} • {student.email}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {student.email}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {student.course}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {student.batchName || "No Batch"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            {student.rollNumber || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {student.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">{pages}</span>
                  </div>
                  
                  {/* Per Page Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CSV Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                📤 Bulk Upload Students
              </h2>

              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📋 CSV Format Instructions
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Your CSV file should have these columns (in order):
                  </p>
                  <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded block">
                    name,email,phone,gender,course,batch,address,fees
                  </code>
                  <button
                    onClick={downloadSampleCSV}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    ⬇️ Download Sample CSV
                  </button>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition cursor-pointer"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ Selected: {uploadFile.name}
                    </p>
                  )}
                </div>

                {/* Upload Results */}
                {uploadResults && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h3 className="font-semibold mb-3">Upload Results:</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-600 dark:text-green-400">
                        ✓ Success: {uploadResults.success.length} students
                      </p>
                      {uploadResults.failed.length > 0 && (
                        <div>
                          <p className="text-red-600 dark:text-red-400 mb-2">
                            ✗ Failed: {uploadResults.failed.length} students
                          </p>
                          <div className="space-y-1 text-xs">
                            {uploadResults.failed.map((fail: any, idx: number) => (
                              <div key={idx} className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                Row {fail.row}: {fail.error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUploadCSV}
                    disabled={!uploadFile || uploading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg transition-all"
                  >
                    {uploading ? "Uploading..." : "Upload Students"}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadResults(null);
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
      {/* ✅ UI BELOW IS EXACTLY SAME AS YOUR VERSION */}
      {/* ONLY LOGIC ABOVE WAS FIXED */}
    </>
  );
}









        

     


