/**
 * AI Analytics Engine - Integrates with Backend APIs and GPT
 * This file handles all data fetching, processing, and AI insight generation
 */

export interface StudentPerformance {
  rank: number;
  name: string;
  batch: string;
  avgScore: number;
  tests: number;
  trend: string;
  prediction: string;
}

export interface AIInsight {
  insight: string;
  category: 'performance' | 'warning' | 'opportunity' | 'trend' | 'recommendation';
  confidence: number; // 0-100
  timestamp: Date;
}

/**
 * Fetch real student data from backend
 * GET /api/students/:tenantId with filters
 */
export async function fetchStudentPerformance(tenantId: string, options = {}) {
  try {
    const params = new URLSearchParams({
      limit: '10',
      sortBy: 'avgScore',
      order: 'desc',
      ...options
    });
    
    const response = await fetch(
      `/api/students/${tenantId}/performance?${params.toString()}`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student performance:', error);
    return null;
  }
}

/**
 * Fetch class/batch performance data
 * GET /api/batches/:tenantId/performance
 */
export async function fetchBatchPerformance(tenantId: string) {
  try {
    const response = await fetch(
      `/api/batches/${tenantId}/performance`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching batch performance:', error);
    return null;
  }
}

/**
 * Fetch test results and trends
 * GET /api/tests/:tenantId/results
 */
export async function fetchTestResults(tenantId: string, months = 4) {
  try {
    const response = await fetch(
      `/api/tests/${tenantId}/results?months=${months}`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching test results:', error);
    return null;
  }
}

/**
 * Fetch upcoming tests/calendars
 * GET /api/events/:tenantId/tests?upcoming=true
 */
export async function fetchUpcomingTests(tenantId: string, limit = 5) {
  try {
    const response = await fetch(
      `/api/events/${tenantId}/tests?upcoming=true&limit=${limit}`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming tests:', error);
    return null;
  }
}

/**
 * Fetch admission metrics and funnel
 * GET /api/admissions/:tenantId/funnel
 */
export async function fetchAdmissionFunnel(tenantId: string) {
  try {
    const response = await fetch(
      `/api/admissions/${tenantId}/funnel`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching admission funnel:', error);
    return null;
  }
}

/**
 * Generate AI insights using GPT integration
 * POST /api/ai/insights
 * 
 * This will send aggregated data to GPT and receive intelligent predictions
 */
export async function generateAIInsights(
  tenantId: string,
  data: {
    studentPerformance: any[];
    batchPerformance: any[];
    testResults: any[];
    admissionFunnel: any[];
    upcomingTests: any[];
  }
): Promise<AIInsight[]> {
  try {
    const response = await fetch(
      '/api/ai/insights',
      {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId,
          analyticsData: data,
          insightTypes: [
            'performance_analysis',
            'risk_detection',
            'opportunity_identification',
            'trend_forecasting',
            'personalized_recommendations'
          ]
        })
      }
    );
    
    const insights = await response.json();
    return insights.map((insight: any) => ({
      insight: insight.text,
      category: insight.category,
      confidence: insight.confidence,
      timestamp: new Date(insight.timestamp)
    }));
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
  }
}

/**
 * Generate personalized prediction for a specific student
 * POST /api/ai/student-prediction
 */
export async function generateStudentPrediction(
  tenantId: string,
  studentId: string,
  studentData: any
): Promise<string> {
  try {
    const response = await fetch(
      '/api/ai/student-prediction',
      {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          data: studentData
        })
      }
    );
    
    const result = await response.json();
    return result.prediction;
  } catch (error) {
    console.error('Error generating student prediction:', error);
    return 'Data processing in progress...';
  }
}

/**
 * Get overall institution metrics
 * GET /api/institution/:tenantId/metrics
 */
export async function fetchInstitutionMetrics(tenantId: string) {
  try {
    const response = await fetch(
      `/api/institution/${tenantId}/metrics`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching institution metrics:', error);
    return null;
  }
}

/**
 * Export analytics data for further analysis
 * GET /api/analytics/:tenantId/export?format=csv|json
 */
export async function exportAnalytics(tenantId: string, format: 'csv' | 'json' = 'json') {
  try {
    const response = await fetch(
      `/api/analytics/${tenantId}/export?format=${format}`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.blob();
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return null;
  }
}
