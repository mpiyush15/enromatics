import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

/**
 * Hook to fetch AI Dashboard insights from backend
 * Returns: alerts, kpis, recommendations, dailyActions
 */
export const useAIDashboardInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        console.log("🧠 Fetching AI dashboard insights...");
        
        const response = await api.get("ai/dashboard/insights");
        
        console.log("✅ AI Insights loaded:", response?.data);
        setData(response?.data);
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
