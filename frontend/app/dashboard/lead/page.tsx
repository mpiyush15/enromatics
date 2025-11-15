"use client";
import { useEffect, useState } from "react";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  plan: string;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        console.log("🔵 Fetching leads from API...");
        const res = await fetch("http://localhost:5050/api/leads", {
          method: "GET",
          credentials: "include", // ✅ Send httpOnly cookie with request
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📍 Leads API response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("❌ Leads API error:", errorData);
          throw new Error("Failed to fetch leads");
        }

        const data = await res.json();
        console.log("🟢 Leads fetched successfully:", data.length, "leads");
        setLeads(data);
      } catch (err: any) {
        console.error("❌ Error fetching leads:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) return <p>Loading leads...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Leads Submitted</h1>
      <table className="w-full text-left border border-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-left">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Institute</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="p-2 border">{lead.name}</td>
              <td className="p-2 border">{lead.email}</td>
              <td className="p-2 border">{lead.phone}</td>
              <td className="p-2 border">{lead.institute}</td>
              <td className="p-2 border">{lead.plan}</td>
              <td className="p-2 border">
                {new Date(lead.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
