"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

type Props = {
  planName: string;
  price: string;
  planId?: string; // Optional, if you need to pass planId
};

export default function SubscriptionForm({ planName, price }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    business: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Processing...");

    const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plan: planName, price }),
    });

    const result = await res.json();

    if (res.ok) {
      setStatus("✅ Subscribed & Registered! Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setStatus(`❌ ${result.error}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Subscribe to {planName}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" placeholder="Name" value={form.username} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="business" placeholder="Business Name" value={form.business} onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Subscribe</button>
      </form>

      {status.includes("exists") && (
        <button onClick={() => router.push("/login")} className="w-full mt-4 bg-gray-600 text-white py-2 rounded">Login Instead</button>
      )}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{status}</p>
    </div>
  );
}