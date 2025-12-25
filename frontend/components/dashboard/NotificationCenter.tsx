"use client";

import { useState, useEffect } from "react";
import { api, safeApiCall } from "@/lib/apiClient";

interface NotificationCenterProps {
  tenantId?: string;
}

export default function NotificationCenter({ tenantId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(undefined);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch batches when modal opens
  const fetchBatches = async () => {
    if (!tenantId) return;
    setLoadingBatches(true);
    try {
      const [data, err] = await safeApiCall(() =>
        api.get<any>(`/api/batches?tenantId=${tenantId}`)
      );
      if (!err && data?.batches) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoadingBatches(false);
    }
  };

  // Fetch students when batch is selected or modal opens
  const fetchStudents = async (batchId?: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      let url = `/api/students?tenantId=${tenantId}`;
      if (batchId) {
        url += `&batchId=${batchId}`;
        console.log(`🔍 Fetching students for batch: ${batchId}`);
      } else {
        console.log('🔍 Fetching all students (no batch filter)');
      }
      const [data, err] = await safeApiCall(() =>
        api.get<any>(url)
      );
      if (!err && data?.students) {
        console.log(`✅ Fetched ${data.students.length} students`);
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSendModal) {
      fetchBatches();
      // Don't fetch students initially - wait for batch selection
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [showSendModal, tenantId]);

  // Fetch students when batch changes
  useEffect(() => {
    if (showSendModal && selectedBatch !== undefined) {
      console.log(`📊 Batch changed to: ${selectedBatch}`);
      if (selectedBatch === "all") {
        // "All Batches" selected
        fetchStudents();
      } else {
        // Specific batch selected
        fetchStudents(selectedBatch);
      }
      setSelectedStudents([]); // Clear selected students when batch changes
    }
  }, [selectedBatch, showSendModal]);

  const handleSendNotification = async () => {
    if (!title || !message) {
      alert("Please fill in title and message");
      return;
    }

    if (!sendToAll && selectedStudents.length === 0) {
      alert("Please select at least one student or choose 'Send to All'");
      return;
    }

    setSending(true);
    try {
      const [data, err] = await safeApiCall(() =>
        api.post<any>(`/api/notifications/create`, {
          title,
          message,
          type,
          priority,
          studentIds: sendToAll ? [] : selectedStudents,
          tenantId
        })
      );

      if (err) {
        alert("Failed to send notification: " + err.message);
        return;
      }

      if (data?.success) {
        alert(`✅ Notification sent to ${data.count} student(s)!`);
        setShowSendModal(false);
        resetForm();
      }
    } catch (error: any) {
      console.error("Send notification error:", error);
      alert("Error sending notification");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("general");
    setPriority("medium");
    setSelectedBatch(undefined);
    setSelectedStudents([]);
    setSendToAll(false);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  // Quick notification templates
  const quickTemplates = [
    {
      name: "Fee Reminder",
      title: "Fee Payment Reminder",
      message: "Your monthly fee is due. Please pay at the earliest to avoid late charges.",
      type: "fee",
      priority: "high"
    },
    {
      name: "Test Alert",
      title: "Test Scheduled",
      message: "A test has been scheduled. Please check your schedule for details.",
      type: "test",
      priority: "high"
    },
    {
      name: "Low Attendance",
      title: "Attendance Alert",
      message: "Your attendance is below 75%. Please attend regularly to be eligible for exams.",
      type: "attendance",
      priority: "high"
    },
    {
      name: "General Announcement",
      title: "Important Notice",
      message: "This is an important announcement from the institute.",
      type: "announcement",
      priority: "medium"
    }
  ];

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setTitle(template.title);
    setMessage(template.message);
    setType(template.type);
    setPriority(template.priority);
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowSendModal(true)}
        className="relative p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
        title="Send Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-700 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📢 Send Notifications
              </h2>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {quickTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyTemplate(template)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-left transition"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter notification message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Batch *
                </label>
                <select
                  value={selectedBatch ?? ""}
                  onChange={(e) => setSelectedBatch(e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-- Select a batch --</option>
                  <option value="all">All Batches</option>
                  {loadingBatches ? (
                    <option value="" disabled>Loading batches...</option>
                  ) : (
                    batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name} {batch.course ? `- ${batch.course}` : ''}
                      </option>
                    ))
                  )}
                </select>
                {selectedBatch && selectedBatch !== "all" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Showing students from selected batch only
                  </p>
                )}
                {selectedBatch === "all" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Showing all students from all batches
                  </p>
                )}
              </div>

              {/* Student Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recipients
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendToAll}
                      onChange={(e) => {
                        setSendToAll(e.target.checked);
                        if (e.target.checked) {
                          setSelectedStudents([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Send to All Students</span>
                  </label>
                </div>

                {!sendToAll && (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-60 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedStudents.length} of {students.length} selected
                      </span>
                      <button
                        onClick={selectAllStudents}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    {loading ? (
                      <p className="text-sm text-gray-500 text-center py-4">Loading students...</p>
                    ) : students.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedBatch === undefined ? "Please select a batch to view students" : "No students found in this batch"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <label
                            key={student._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => toggleStudentSelection(student._id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {student.name} - {student.rollNumber}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {sendToAll && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      📣 This notification will be sent to all students in your institute
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  resetForm();
                }}
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={!title || !message || sending || (!sendToAll && selectedStudents.length === 0)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
