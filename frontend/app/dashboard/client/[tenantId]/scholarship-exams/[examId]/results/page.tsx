"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Download,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

interface Registration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  currentClass: string;
  hasAttended: boolean;
  marksObtained?: number;
  percentage?: number;
  rank?: number;
  result?: "pass" | "fail" | "absent" | "pending";
  rewardEligible: boolean;
  rewardDetails?: any;
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  totalMarks: number;
  passingMarks: number;
  rewards: Array<{
    rankFrom: number;
    rankTo: number;
    rewardType: string;
    rewardValue: number;
    description: string;
  }>;
  status: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishMode, setPublishMode] = useState(false);

  // Track marks for each student
  const [marks, setMarks] = useState<Record<string, { attended: boolean; marks: number }>>({});

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch exam
      const examResponse = await fetch(`/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        setExam(examData.exam);
      }

      // Fetch registrations
      const regResponse = await fetch(`/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      if (regResponse.ok) {
        const regData = await regResponse.json();
        const regs = regData.registrations || [];
        setRegistrations(regs);

        // Initialize marks state
        const initialMarks: Record<string, { attended: boolean; marks: number }> = {};
        regs.forEach((reg: Registration) => {
          initialMarks[reg._id] = {
            attended: reg.hasAttended || false,
            marks: reg.marksObtained || 0,
          };
        });
        setMarks(initialMarks);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (regId: string, attended: boolean) => {
    setMarks((prev) => ({
      ...prev,
      [regId]: { ...prev[regId], attended, marks: attended ? prev[regId].marks : 0 },
    }));
  };

  const handleMarksChange = (regId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.min(Math.max(0, numValue), exam?.totalMarks || 100);
    setMarks((prev) => ({
      ...prev,
      [regId]: { ...prev[regId], marks: clampedValue },
    }));
  };

  const handleSaveMarks = async () => {
    try {
      setSaving(true);

      const updates = Object.entries(marks).map(([regId, data]) => ({
        registrationId: regId,
        hasAttended: data.attended,
        marksObtained: data.attended ? data.marks : undefined,
      }));

      for (const update of updates) {
        await fetch(`/api/scholarship-exams/registration/${update.registrationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            hasAttended: update.hasAttended,
            marksObtained: update.marksObtained,
          }),
        });
      }

      alert("Marks saved successfully!");
      fetchData();
    } catch (error) {
      console.error("Error saving marks:", error);
      alert("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResults = async () => {
    if (!confirm("Are you sure you want to publish the results? Students will be able to view them.")) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/scholarship-exams/${examId}/publish-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to publish results");

      alert("Results published successfully! Students can now view their results.");
      fetchData();
      setPublishMode(false);
    } catch (error) {
      console.error("Error publishing results:", error);
      alert("Failed to publish results");
    } finally {
      setSaving(false);
    }
  };

  const downloadSampleCSV = () => {
    const headers = ["Registration Number", "Attended (yes/no)", "Marks Obtained"];
    const sampleRows = registrations.slice(0, 3).map((reg) => [reg.registrationNumber, "yes", "0"]);

    const csvContent = [headers, ...sampleRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks-template-${exam?.examCode || "exam"}.csv`;
    a.click();
  };

  const exportResultsCSV = () => {
    const headers = [
      "Registration Number",
      "Name",
      "Class",
      "Attended",
      "Marks",
      "Percentage",
      "Rank",
      "Result",
      "Reward",
    ];

    const sortedRegs = [...registrations].sort((a, b) => (a.rank || 999) - (b.rank || 999));

    const rows = sortedRegs.map((reg) => [
      reg.registrationNumber,
      reg.studentName,
      reg.currentClass,
      reg.hasAttended ? "Yes" : "No",
      reg.marksObtained || "-",
      reg.percentage?.toFixed(1) || "-",
      reg.rank || "-",
      reg.result || "pending",
      reg.rewardEligible ? reg.rewardDetails?.description || "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${exam?.examCode || "exam"}.csv`;
    a.click();
  };

  const getResultStats = () => {
    const attended = registrations.filter((r) => r.hasAttended).length;
    const passed = registrations.filter((r) => r.result === "pass").length;
    const failed = registrations.filter((r) => r.result === "fail").length;
    const absent = registrations.filter((r) => r.result === "absent" || !r.hasAttended).length;
    const withRewards = registrations.filter((r) => r.rewardEligible).length;

    return { attended, passed, failed, absent, withRewards };
  };

  const stats = getResultStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sortedRegistrations = [...registrations].sort((a, b) => {
    if (!a.hasAttended && b.hasAttended) return 1;
    if (a.hasAttended && !b.hasAttended) return -1;
    return (b.marksObtained || 0) - (a.marksObtained || 0);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Exams
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam?.examName}</h1>
            <p className="text-gray-600 mt-1">Results Management • Total Marks: {exam?.totalMarks} • Passing: {exam?.passingMarks}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={20} />
              Sample CSV
            </button>
            <button
              onClick={exportResultsCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileSpreadsheet size={20} />
              Export Results
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Students</div>
          <div className="text-2xl font-bold text-gray-900">{registrations.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Attended</div>
          <div className="text-2xl font-bold text-blue-600">{stats.attended}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Passed</div>
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">With Rewards</div>
          <div className="text-2xl font-bold text-purple-600">{stats.withRewards}</div>
        </div>
      </div>

      {/* Rewards Preview */}
      {exam?.rewards && exam.rewards.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-purple-900">Configured Rewards/Scholarships</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exam.rewards.map((reward, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="font-semibold text-purple-900 mb-1">
                  Rank {reward.rankFrom}
                  {reward.rankTo > reward.rankFrom && `-${reward.rankTo}`}
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {reward.rewardValue}
                  {reward.rewardType === "percentage" ? "%" : reward.rewardType === "fixed" ? "₹" : ""}
                </div>
                <div className="text-sm text-gray-600">{reward.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-blue-600" size={20} />
          <p className="text-sm text-gray-700">
            {exam?.status === "resultPublished" ? (
              <span className="text-green-600 font-medium">✓ Results have been published</span>
            ) : (
              "Enter marks and attendance, then publish results for students to view"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Marks"}
          </button>
          {exam?.status !== "resultPublished" && (
            <button
              onClick={handlePublishResults}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={20} />
              {saving ? "Publishing..." : "Publish Results"}
            </button>
          )}
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg. No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attended</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Marks (/{exam?.totalMarks})
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRegistrations.map((reg, index) => {
                const currentMarks = marks[reg._id] || { attended: false, marks: 0 };
                const percentage = currentMarks.attended ? ((currentMarks.marks / (exam?.totalMarks || 100)) * 100).toFixed(1) : "-";

                return (
                  <tr key={reg._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{reg.registrationNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{reg.studentName}</div>
                      <div className="text-xs text-gray-500">{reg.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{reg.currentClass}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={currentMarks.attended}
                        onChange={(e) => handleAttendanceChange(reg._id, e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={currentMarks.marks}
                        onChange={(e) => handleMarksChange(reg._id, e.target.value)}
                        disabled={!currentMarks.attended}
                        min={0}
                        max={exam?.totalMarks || 100}
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          currentMarks.attended && currentMarks.marks >= (exam?.passingMarks || 40)
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {percentage}
                        {percentage !== "-" && "%"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.rank ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                          {reg.rank}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.result === "pass" && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">Pass</span>
                      )}
                      {reg.result === "fail" && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">Fail</span>
                      )}
                      {reg.result === "absent" && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Absent</span>
                      )}
                      {!reg.result && <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.rewardEligible ? (
                        <div className="flex flex-col items-center">
                          <Award className="text-purple-600 mb-1" size={16} />
                          <span className="text-xs text-purple-600 font-medium">
                            {reg.rewardDetails?.rewardValue}
                            {reg.rewardDetails?.rewardType === "percentage" && "%"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Upload Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Upload className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Bulk Upload via CSV (Coming Soon)</h4>
            <p className="text-sm text-blue-700 mb-3">
              Download the sample CSV template, fill in the marks, and upload to save time on data entry.
            </p>
            <p className="text-xs text-blue-600">
              CSV Format: Registration Number, Attended (yes/no), Marks Obtained
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
