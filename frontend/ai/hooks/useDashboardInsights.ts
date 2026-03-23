import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

interface DashboardData {
  kpis?: {
    instituteName?: string;
    revenue?: { today: number; pending: number };
    admissions?: { activeLeads: number };
    [key: string]: any;
  };
  alerts?: any[];
  recommendations?: any[];
  [key: string]: any;
}

/**
 * Hook to fetch AI Dashboard insights from backend
 * ✅ Multi-tenant ready - backend filters by tenant
 * Returns: alerts, kpis, recommendations, dailyActions
 */
export const useAIDashboardInsights = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        console.log("🧠 Fetching AI dashboard insights...");
        
        const response = await api.get("ai/dashboard/insights");
        
        console.log("✅ AI Insights loaded:", response?.data);
        // Response structure: { success, data: { alerts, kpis, ... }, message }
        setData(response?.data?.data || response?.data);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching AI insights:", err);
        setError(err?.message || "Failed to fetch insights");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();

    // Refresh every 5 minutes
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

/**
 * Refetch insights manually
 */
export const useRefreshAIInsights = () => {
  const refetch = async () => {
    try {
      console.log("🔄 Refetching AI insights...");
      const response = await api.get("ai/dashboard/insights");
      return response?.data;
    } catch (err) {
      console.error("❌ Error refetching AI insights:", err);
      throw err;
    }
  };

  return { refetch };
};
