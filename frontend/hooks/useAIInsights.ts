/**
 * 🤖 AI INSIGHTS HOOKS
 * Real-time AI predictions and recommendations for dashboards
 * ✅ Connected to /api/ai/dashboard/insights
 * ✅ Synced with useConsistentData system
 */

'use client';

import useConsistentData from './useConsistentData';
import { CACHE_KEYS, SYNC_EVENTS } from '@/lib/syncManager';

// Mock AI data for fallback (no data available message)
const MOCK_AI_DATA = {
  alerts: [
    {
      id: 1,
      type: 'info',
      severity: 'info',
      message: '📊 AI Suggestions: No real data available yet. Create tenants and add data to see insights.',
      actionable: false,
    },
  ],
  predictions: {
    revenueNextMonth: 0,
    revenueGrowth: 0,
    expectedNewLeads: 0,
    leadConversionRate: 0,
    studentRetentionRate: 0,
  },
  recommendations: [
    {
      id: 1,
      type: 'onboarding',
      priority: 'high',
      title: 'Get started by adding your first tenant',
      description: 'AI insights will appear once you create a tenant and add student/lead/payment data.',
      estimatedImpact: 'Unlock full AI capabilities',
    },
  ],
  anomalies: [],
};

// Cache keys for AI data
export const AI_CACHE_KEYS = {
  AI_INSIGHTS: 'cache:ai:insights',
  AI_PREDICTIONS: 'cache:ai:predictions',
  AI_RECOMMENDATIONS: 'cache:ai:recommendations',
  AI_ALERTS: 'cache:ai:alerts',
};

/**
 * 🤖 HOOK 1: useAIInsights
 * Get all AI insights (alerts + predictions + recommendations)
 * Auto-updates when data changes via SYNC_EVENTS
 */
export function useAIInsights() {
  const { data, loading, error, refresh } = useConsistentData({
    endpoint: '/api/ai/dashboard/insights',
    cacheKey: AI_CACHE_KEYS.AI_INSIGHTS,
    fallbackData: MOCK_AI_DATA,
    syncEvents: [
      SYNC_EVENTS.PAYMENT_RECORDED,
      SYNC_EVENTS.LEAD_CREATED,
      SYNC_EVENTS.STUDENT_CREATED,
      SYNC_EVENTS.TEST_RESULT_RECORDED,
    ],
    autoRefreshInterval: 120000, // 2 min - AI predictions don't need frequent refresh
  });

  return {
    insights: {
      alerts: data?.alerts || [],
      predictions: data?.predictions || MOCK_AI_DATA.predictions,
      recommendations: data?.recommendations || [],
      anomalies: data?.anomalies || [],
    },
    predictions: data?.predictions || MOCK_AI_DATA.predictions,
    recommendations: data?.recommendations || [],
    anomalies: data?.anomalies || [],
    loading,
    error,
    refresh,
  };
}

/**
 * 🤖 HOOK 2: useAIAlerts
 * Get AI-generated alerts
 * Real-time warnings about critical issues
 */
export function useAIAlerts() {
  const { data, loading, error, refresh } = useConsistentData({
    endpoint: '/api/ai/dashboard/insights',
    cacheKey: `${AI_CACHE_KEYS.AI_ALERTS}`,
    fallbackData: { alerts: MOCK_AI_DATA.alerts },
    syncEvents: [
      SYNC_EVENTS.PAYMENT_RECORDED,
      SYNC_EVENTS.LEAD_CREATED,
      SYNC_EVENTS.PAYMENT_FAILED,
    ],
    autoRefreshInterval: 60000, // 1 min - alerts need faster refresh
  });

  return {
    alerts: data?.alerts || [],
    loading,
    error,
    refresh,
  };
}

/**
 * 🤖 HOOK 3: useAIPredictions
 * Get AI predictions for KPIs
 * Forecasts: revenue, leads, retention, etc.
 */
export function useAIPredictions() {
  const { data, loading, error, refresh } = useConsistentData({
    endpoint: '/api/ai/dashboard/insights',
    cacheKey: `${AI_CACHE_KEYS.AI_PREDICTIONS}`,
    fallbackData: { predictions: MOCK_AI_DATA.predictions },
    syncEvents: [SYNC_EVENTS.PAYMENT_RECORDED, SYNC_EVENTS.STUDENT_CREATED],
    autoRefreshInterval: 300000, // 5 min - predictions are less frequent
  });

  return {
    predictions: data?.predictions || {},
    loading,
    error,
    refresh,
  };
}

/**
 * 🤖 HOOK 4: useAIRecommendations
 * Get AI-generated actionable recommendations
 * Prioritized suggestions for business growth
 */
export function useAIRecommendations() {
  const { data, loading, error, refresh } = useConsistentData({
    endpoint: '/api/ai/dashboard/insights',
    cacheKey: `${AI_CACHE_KEYS.AI_RECOMMENDATIONS}`,
    fallbackData: { recommendations: MOCK_AI_DATA.recommendations },
    syncEvents: [
      SYNC_EVENTS.LEAD_CREATED,
      SYNC_EVENTS.PAYMENT_RECORDED,
      SYNC_EVENTS.STUDENT_CREATED,
    ],
    autoRefreshInterval: 300000, // 5 min
  });

  return {
    recommendations: data?.recommendations || [],
    loading,
    error,
    refresh,
  };
}

/**
 * 🤖 HOOK 5: useAIPredictedRevenue
 * Specific hook for revenue forecasting
 */
export function useAIPredictedRevenue() {
  const { predictions, loading, error } = useAIPredictions();

  return {
    nextMonthRevenue: predictions?.revenueNextMonth || 0,
    growthPercentage: predictions?.revenueGrowth || 0,
    loading,
    error,
  };
}

/**
 * 🤖 HOOK 6: useAILeadAnalysis
 * Specific hook for lead analytics
 */
export function useAILeadAnalysis() {
  const { predictions, loading, error } = useAIPredictions();

  return {
    expectedNewLeads: predictions?.expectedNewLeads || 0,
    conversionRate: predictions?.leadConversionRate || 0,
    loading,
    error,
  };
}

/**
 * 🤖 HOOK 7: useAIStudentAnalysis
 * Specific hook for student success predictions
 */
export function useAIStudentAnalysis() {
  const { predictions, loading, error } = useAIPredictions();

  return {
    retentionRate: predictions?.studentRetentionRate || 0,
    performanceScore: 85, // Static score - from AI model baseline
    loading,
    error,
  };
}

export default {
  useAIInsights,
  useAIAlerts,
  useAIPredictions,
  useAIRecommendations,
  useAIPredictedRevenue,
  useAILeadAnalysis,
  useAIStudentAnalysis,
};
