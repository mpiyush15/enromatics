"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Batch {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  status: string;
  createdAt: string;
}

export default function BatchesPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [message, setMessage] = useState("");
  const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    capacity: "",
    status: "active",
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      // Use BFF route instead of direct Express call
      const res = await fetch(`/api/academics/batches`, {
        credentials: "include",
      });
      
      // Check cache header from BFF
      const cacheHit = res.headers.get('X-Cache');
      if (cacheHit) {
        setCacheStatus(cacheHit as 'HIT' | 'MISS');
      }
      
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving...");

    try {
      // Use BFF route instead of direct Express call
      const url = editingBatch
        ? `/api/academics/batches/${editingBatch._id}`
        : `/api/academics/batches`;
      const method = editingBatch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? parseInt(form.capacity) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(editingBatch ? "✅ Batch updated!" : "✅ Batch created!");
        fetchBatches();
        resetForm();
        setShowModal(false);
      } else {
        setMessage("❌ " + (data.message || "Operation failed"));
      }
    } catch (error) {
      console.error("Error saving batch:", error);
      setMessage("❌ Server error");
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setForm({
      name: batch.name,
      description: batch.description || "",
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split("T")[0] : "",
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "",
      capacity: batch.capacity?.toString() || "",
      status: batch.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this batch? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/academics/batches/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Batch deleted!");
        fetchBatches();
      } else {
        setMessage("❌ Delete failed");
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      setMessage("❌ Server error");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      capacity: "",
      status: "active",
    });
    setEditingBatch(null);
    setMessage("");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">📚 Batches Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage batches for student enrollment
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Add Batch
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
          {message}
        </div>
      )}

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <div
            key={batch._id}
            className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {batch.name}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  batch.status === "active"
                    ? "bg-green-100 text-green-800"
                    : batch.status === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {batch.status}
              </span>
            </div>

            {batch.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {batch.description}
              </p>
            )}

            <div className="space-y-2 text-sm mb-4">
              {batch.startDate && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📅 Start:</span>
                  <span>{new Date(batch.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {batch.capacity && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">👥 Capacity:</span>
                  <span>
                    {batch.enrolledCount || 0} / {batch.capacity}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(batch)}
                className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(batch._id)}
                className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {batches.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No Batches Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first batch to start organizing students
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Create Batch
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium">Batch Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Batch 2024, Morning Batch"
                  className="w-full p-2 border rounded dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full p-2 border rounded dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleInputChange}
                    placeholder="Max students"
                    className="w-full p-2 border rounded dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  {editingBatch ? "Update" : "Create"} Batch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
