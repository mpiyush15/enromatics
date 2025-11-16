"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Logging in...");
    try {
      const res = await fetch("`${API_BASE_URL}/api/student-auth/login`", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setStatus("Logged in");
      setTimeout(() => router.push("/student/dashboard"), 500);
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Student Login</h1>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="p-3 border rounded" required />
        <button className="bg-blue-600 text-white p-3 rounded">Login</button>
      </form>
      <p className="mt-3 text-sm text-gray-600">{status}</p>
    </div>
  );
}
