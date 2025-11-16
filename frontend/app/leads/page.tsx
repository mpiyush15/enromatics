"use client";
import { useState } from "react";

export default function LeadFormPage() {
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch("`${API_BASE_URL}/api/leads/add`", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Lead added successfully!");
        setForm({ name: "", mobile: "" });
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Error connecting to backend");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <h1 className="text-3xl font-bold mb-6">Add New Lead</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Enter Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />
        <input
          name="mobile"
          type="text"
          placeholder="Enter Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
      <p className="mt-4">{status}</p>
    </div>
  );
}
