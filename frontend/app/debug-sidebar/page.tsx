"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function SidebarDebugPage() {
  const { user, loading } = useAuth();
  const [sidebarData, setSidebarData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [fetchStatus, setFetchStatus] = useState<string>("idle");

  const testSidebarFetch = async () => {
    setFetchStatus("fetching");
    setError("");
    
    try {
      console.log("🔍 Testing sidebar fetch...");
      const res = await fetch("/api/ui/sidebar", {
        method: "GET",
        credentials: "include",
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        setSidebarData(data);
        setFetchStatus("success");
      } else {
        setError(`Error ${res.status}: ${data.error || data.message}`);
        setFetchStatus("error");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
      setFetchStatus("error");
    }
  };

  useEffect(() => {
    if (user && !loading) {
      testSidebarFetch();
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Sidebar Debug Panel</h1>

      <div className="space-y-6">
        {/* Auth Status */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
            <p><strong>User:</strong> {user ? "Authenticated" : "Not authenticated"}</p>
            {user && (
              <>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Tenant ID:</strong> {user.tenantId || "N/A"}</p>
                <p><strong>User ID:</strong> {user._id}</p>
              </>
            )}
          </div>
        </div>

        {/* Fetch Status */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sidebar Fetch Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-3 py-1 rounded ${
                fetchStatus === "success" ? "bg-green-600" :
                fetchStatus === "error" ? "bg-red-600" :
                fetchStatus === "fetching" ? "bg-yellow-600" :
                "bg-gray-600"
              }`}>
                {fetchStatus}
              </span>
            </p>
            {error && (
              <div className="bg-red-900 p-4 rounded mt-4">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          <button
            onClick={testSidebarFetch}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? "Fetching..." : "Retry Fetch"}
          </button>
        </div>

        {/* Sidebar Data */}
        {sidebarData && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sidebar Data</h2>
            <div className="space-y-2">
              <p><strong>Success:</strong> {sidebarData.success ? "Yes" : "No"}</p>
              <p><strong>Role:</strong> {sidebarData.role}</p>
              <p><strong>Tenant ID:</strong> {sidebarData.tenantId || "N/A"}</p>
              <p><strong>Links Count:</strong> {sidebarData.sidebar?.length || 0}</p>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">View Raw Data</summary>
              <pre className="bg-gray-900 p-4 rounded mt-2 overflow-auto text-xs">
                {JSON.stringify(sidebarData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Environment Info */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2">
            <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>API Base:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
            <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}</p>
          </div>
        </div>

        {/* Browser Console Logs */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check the browser console (F12) for detailed logs</li>
            <li>Look for console logs with 🚀, 🔄, ✅, or ❌ emojis</li>
            <li>Check the Network tab for the /api/ui/sidebar request</li>
            <li>Verify cookies are being sent with the request</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
