"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";

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
        
        const res = await fetch(`${API_BASE_URL}/api/leads`, {
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

  if (loading) return <p className="text-gray-500 p-6">Loading leads...</p>;
  if (error) return <p className="text-red-500 p-6">Error: {error}</p>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">📋 Leads Submitted</h1>
      
      {/* Mobile-friendly scrollable table wrapper */}
      <div className="overflow-x-auto -mx-4 md:mx-0 shadow-md rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Institute
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {lead.institute}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {lead.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {leads.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">No leads found.</p>
      )}
    </div>
  );
}
