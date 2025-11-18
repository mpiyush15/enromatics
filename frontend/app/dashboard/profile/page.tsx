"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    username: "",
    email: "",
    facebookPage: "",
    instagramHandle: "",
    whatsappNumber: "",
    plan: "",
    planExpiry: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        setForm(data.user);
        setLoading(false);
      };
      fetchData();
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Basic social link validation
    const fbRegex = /^https:\/\/(www\.)?facebook\.com\/(profile\.php\?id=\d+|[A-Za-z0-9_.-]+)$/;
    //const instaRegex = /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.-]+$/;
    const instaRegex = /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.-]+\/?$/;
  if (form.facebookPage && !fbRegex.test(form.facebookPage)) {
    setStatusMessage("❌ Invalid Facebook page URL");
    return;
  }

  if (form.instagramHandle && !instaRegex.test(form.instagramHandle)) {
    setStatusMessage("❌ Invalid Instagram profile URL");
    return;
  }


    setStatusMessage("Saving...");
    const res = await fetch("/api/user/update-profile", {
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
    // Optionally re-fetch data to reset form
  };

  if (status === "loading" || loading) return <p>Loading profile...</p>;
  if (!session) return <p className="text-red-600">You are not logged in.</p>;

  // Check if user is tenantAdmin
  const isTenantAdmin = (session?.user as any)?.role === "tenantAdmin";

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">👤 My Profile</h1>

      {/* View Mode or Edit Mode */}
      <div className="space-y-4">
        <ProfileField label="Username" value={form.username} />
        <ProfileField label="Email" value={form.email} />
        <ProfileField label="Plan" value={form.plan} />
        <ProfileField label="Plan Expiry" value={form.planExpiry ? new Date(form.planExpiry).toLocaleDateString() : "N/A"} />

        {editing ? (
          <>
            <EditableField label="Facebook Page" name="facebookPage" value={form.facebookPage} onChange={handleChange} />
            <EditableField label="Instagram Handle" name="instagramHandle" value={form.instagramHandle} onChange={handleChange} />
            <EditableField label="WhatsApp Number" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} />

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <ProfileField label="Facebook Page" value={form.facebookPage} />
            <ProfileField label="Instagram Handle" value={form.instagramHandle} />
            <ProfileField label="WhatsApp Number" value={form.whatsappNumber} />

            <button
              onClick={() => setEditing(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {statusMessage && <p className="text-sm text-gray-500">{statusMessage}</p>}
    </div>
  );
}

// Reusable components
function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800 dark:text-gray-200">{value || "-"}</p>
    </div>
  );
}

function EditableField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-500">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}