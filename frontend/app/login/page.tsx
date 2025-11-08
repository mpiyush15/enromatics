"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setStatus("✅ You are already logged in. Redirecting...");
      setTimeout(() => router.push("/dashboard/home"), 3000);
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "authenticated") {
    return (
      <div className="text-center text-green-600 mt-10">
        ✅ You are already logged in.<br /> Redirecting to dashboard...
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Logging in...");

    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    if (res?.ok) {
      setStatus("✅ Logged in!");
      router.push("/dashboard/home");
    } else {
      setStatus("❌ Invalid credentials");
    }
  };

  return (
    <div className="flex h-fit min-h-screen">
      {/* Image side */}
      <div className="hidden md:block w-1/2 h-auto">
<Image
  src="https://ik.imagekit.io/qitfmo5b1q/Login.1?updatedAt=1747978837528"
  alt="Forte Studioz Login Visual"
  width={800}
  height={1200}
  className="w-full h-full object-cover"
  priority
/>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 py-12 bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Enro Matics</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-300">Already subscribed? Login here</p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded dark:bg-gray-800 dark:text-white"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{status}</p>

        <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">Explore plans for your needs</p>
      </div>
    </div>
  );
}