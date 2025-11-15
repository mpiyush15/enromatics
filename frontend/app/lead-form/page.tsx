"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function LeadFormPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    plan: "monthly",
  });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus("✅ Lead saved successfully!");
        setForm({ name: "", email: "", phone: "", institute: "", plan: "monthly" });
      } else {
        setStatus(`❌ Error: ${result.message}`);
      }
    } catch {
      setStatus("❌ Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Submit a Lead</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full p-2 border" />
        <input name="institute" placeholder="Institute" value={form.institute} onChange={handleChange} className="w-full p-2 border" />
        <select name="plan" value={form.plan} onChange={handleChange} className="w-full p-2 border">
          <option value="monthly">Monthly</option>
          <option value="onetime">One-time</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
      <p className="mt-4">{status}</p>
    </div>
  );
}