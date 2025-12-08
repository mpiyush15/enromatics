"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Features {
  socialMedia?: boolean;
  waba?: boolean;
  fees?: boolean;
  rbac?: boolean;
  aiGenerators?: boolean;
  [key: string]: boolean | string | undefined;
}

interface UseFeatureGateResult {
  features: Features;
  plan: string;
  loading: boolean;
  hasFeature: (featureKey: string) => boolean;
}

export function useFeatureGate(): UseFeatureGateResult {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [features, setFeatures] = useState<Features>({});
  const [plan, setPlan] = useState<string>("trial");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchFeatures();
    }
  }, [tenantId]);

  const fetchFeatures = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/features`, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.success) {
        setFeatures(data.features || {});
        setPlan(data.plan || "trial");
      }
    } catch (error) {
      console.error("Error fetching features:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    return Boolean(features[featureKey]);
  };

  return { features, plan, loading, hasFeature };
}
