"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function AddStudentPage() {
  const { user } = useAuth();
  const { tenantId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    course: "",
    batch: "",
    address: "",
    fees: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Adding student...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Sends httpOnly cookie automatically
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add student");

      setStatus("✅ Student added successfully!");
      
      // If password was auto-generated, show it
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
        setStatus(`✅ Student added! Generated Password: ${data.generatedPassword} (Share this with the student)`);
      }
      
      setTimeout(() => router.push(`/dashboard/client/${tenantId}/students`), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow rounded-xl p-8 mt-8">
      <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Student Name"
          className="p-3 border rounded"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="p-3 border rounded"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="p-3 border rounded"
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="p-3 border rounded"
        >
          
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input
          name="course"
          value={form.course}
          onChange={handleChange}
          placeholder="Course"
          className="p-3 border rounded"
          required
        />
        <input
          name="batch"
          value={form.batch}
          onChange={handleChange}
          placeholder="Batch"
          className="p-3 border rounded"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="p-3 border rounded col-span-2"
        />
        <input
          name="fees"
          value={form.fees}
          onChange={handleChange}
          placeholder="Total Fees (number)"
          className="p-3 border rounded"
          type="number"
          min={0}
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Set Password (leave empty to auto-generate)"
          className="p-3 border rounded"
        />
        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Student
        </button>
      </form>
      {generatedPassword && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border-2 border-green-500 rounded-xl">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-100 mb-2">
            🔑 Generated Password
          </h3>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-green-300 rounded-lg text-lg font-mono font-bold text-green-700 dark:text-green-300">
              {generatedPassword}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(generatedPassword)}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              📋 Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-200">
            ⚠️ Share this password with the student. They can change it later.
          </p>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-600">{status}</p>
    </div>
  );
}
