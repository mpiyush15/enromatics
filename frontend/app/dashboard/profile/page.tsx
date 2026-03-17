"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    tenantId: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        tenantId: user.tenantId || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setStatusMessage("Saving...");
    const res = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatusMessage("✅ Profile updated!");
      setEditing(false);
    } else {
      setStatusMessage("❌ Update failed.");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        tenantId: user.tenantId || "",
      });
    }
  };

  if (authLoading) return <p className="p-6">Loading profile...</p>;
  if (!user) return <p className="p-6 text-red-600">You are not logged in.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {statusMessage && (
        <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
          {statusMessage}
        </div>
      )}

      <div className="space-y-4 bg-gray-900 p-6 rounded border border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          {editing ? (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          ) : (
            <p className="text-gray-100">{form.name || "N/A"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <p className="text-gray-100">{form.email || "N/A"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
          {editing ? (
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          ) : (
            <p className="text-gray-100">{form.phone || "N/A"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <p className="text-gray-100 capitalize">{form.role || "N/A"}</p>
        </div>

        {form.tenantId && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tenant ID</label>
            <p className="text-gray-100">{form.tenantId}</p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-gray-700">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                💾 Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard/home" className="text-blue-400 hover:text-blue-300">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
