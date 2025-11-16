"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { authService } from "@/lib/authService";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function FacebookBusinessSettings() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const { tenantId } = useParams();

  useEffect(() => {
    // Refresh current user to read facebookBusiness status
    const load = async () => {
      try {
        const u = await authService.getCurrentUser();
        setUser(u || null);
      } catch (err: any) {
        console.error("Error fetching user for facebook settings:", err);
        setError(err.message || "Failed to load user");
      }
    };
    load();
  }, []);

  // If redirected back from backend after connect
  useEffect(() => {
    if (params?.get("connected") === "1") {
      // refresh user
      (async () => {
        const u = await authService.getCurrentUser();
        setUser(u || null);
        // remove query param (stay on same page)
        router.replace(`/dashboard/client/${tenantId}/settings/facebook`);
      })();
    }
    if (params?.get("error")) {
      setError(params.get("error"));
    }
  }, [params, router, tenantId]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Redirect to backend route that starts Facebook OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || `${API_BASE_URL}`}/api/facebook/connect`;
    } catch (err: any) {
      console.error("Failed to start Facebook connect:", err);
      setError(err.message || "Failed to start connect");
      setLoading(false);
    }
  };

  const isConnected = !!user?.facebookBusiness?.connected;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Facebook Business Connection</h1>

      {error && <p className="text-red-600 mb-4">Error: {error}</p>}

      {!isConnected ? (
        <div className="card p-6">
          <h2 className="text-xl mb-4">Connect Your Facebook Business</h2>
          <p className="mb-4 text-gray-600">
            Connect your Facebook Business account to enable:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>WhatsApp Business Messaging</li>
            <li>Meta Ads Manager</li>
            <li>Business Analytics</li>
          </ul>


          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn bg-blue-300 m-3 px-3 p-3 rounded-xl"
          >
            {loading ? 'Connecting...' : 'Connect Facebook Business'}
          </button>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="text-xl mb-4">✓ Connected</h2>
          <p className="mb-4">Facebook User ID: {user.facebookBusiness.facebookUserId}</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">WhatsApp Access</h3>
              <p className={user.facebookBusiness.permissions?.includes('whatsapp_business_messaging') ? 'text-green-600' : 'text-red-600'}>
                {user.facebookBusiness.permissions?.includes('whatsapp_business_messaging') ? '✓ Enabled' : '✗ Not enabled'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Meta Ads Access</h3>
              <p className={user.facebookBusiness.permissions?.includes('ads_management') ? 'text-green-600' : 'text-red-600'}>
                {user.facebookBusiness.permissions?.includes('ads_management') ? '✓ Enabled' : '✗ Not enabled'}
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="btn btn--secondary mt-6"
          >
            Reconnect
          </button>
  
        </div>
      )}
    </div>
  );
}
