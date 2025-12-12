"use client";

import { useEffect, useState } from "react";

export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [sidebarResponse, setSidebarResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking auth status...");
        const authRes = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        const authData = await authRes.json();
        console.log("Auth response:", authData);
        setAuthStatus(authData);

        if (authData.user) {
          console.log("🔍 Fetching sidebar...");
          const sidebarRes = await fetch("/api/ui/sidebar", {
            credentials: "include",
          });
          
          console.log("Sidebar response status:", sidebarRes.status);
          const sidebarText = await sidebarRes.text();
          console.log("Sidebar response text:", sidebarText);
          
          try {
            const sidebarData = JSON.parse(sidebarText);
            setSidebarResponse(sidebarData);
          } catch(e) {
            setSidebarResponse({ error: "Failed to parse JSON", body: sidebarText });
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setAuthStatus({ error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Auth & Sidebar</h1>

      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Auth Status (/api/auth/me)</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sidebar Response (/api/ui/sidebar)</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(sidebarResponse, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Browser Console</h2>
          <p className="text-gray-400">Open browser DevTools (F12) and check the Console tab for detailed logs starting with 🚀, 🔄, ✅, ❌</p>
        </div>
      </div>
    </div>
  );
}
