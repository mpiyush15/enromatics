"use client";

import { useState} from "react";
import { useParams } from "next/navigation";

export default function UpdateSocialStats() {
  const { tenantId } = useParams(); // 👈 get tenant ID from URL
  const [form, setForm] = useState({
    facebookFollowers: "",
    facebookLikes: "",
    instagramFollowers: "",
    instagramLikes: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Updating...");

    const res = await fetch(`/api/social/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: tenantId, ...form }),
    });

    const result = await res.json();

    if (res.ok) {
      setStatus("✅ Updated successfully!");
    } else {
      setStatus("❌ " + result.error || "Update failed.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-xl font-bold mb-4">📢 Update Social Stats for Tenant ID: {tenantId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="facebookFollowers"
          type="number"
          placeholder="Facebook Followers"
          value={form.facebookFollowers}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="facebookLikes"
          type="number"
          placeholder="Facebook Likes"
          value={form.facebookLikes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="instagramFollowers"
          type="number"
          placeholder="Instagram Followers"
          value={form.instagramFollowers}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="instagramLikes"
          type="number"
          placeholder="Instagram Likes"
          value={form.instagramLikes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Stats
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{status}</p>
    </div>
  );
}