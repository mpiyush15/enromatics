"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useAuth from "./useAuth";

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
  const { user, loading: authLoading } = useAuth();
  
  // Try to get tenantId from URL params first, then from user context
  const tenantId = (params?.tenantId as string) || user?.tenantId;
  
  const [features, setFeatures] = useState<Features>({});
  const [plan, setPlan] = useState<string>("trial");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load first
    if (authLoading) {
      return;
    }
    
    if (tenantId) {
      fetchFeatures();
    } else {
      // No tenantId means SuperAdmin or error - allow all features by default
      console.log('⚠️ No tenantId found, allowing all features');
      setFeatures({
        socialMedia: true,
        waba: true,
        fees: true,
        rbac: true,
        aiGenerators: true,
      });
      setLoading(false);
    }
  }, [tenantId, authLoading]);

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
