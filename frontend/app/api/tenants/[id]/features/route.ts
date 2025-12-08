/**
 * BFF Tenant Features Route
 * GET /api/tenants/[id]/features - Get features available for tenant's plan
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

// Plan features matrix (mirrors backend planMatrix.json)
const planFeatures: Record<string, Record<string, boolean | string>> = {
  trial: {
    subdomain: true,
    brandingBasic: true,
    rbac: false,
    onlineTestV1: true,
    studyMaterials: true,
    attendance: true,
    fees: false,
    notifications: true,
    secureVideo: true,
    aiGenerators: false,
    youtubeLive: false,
    whiteLabelApk: false,
    multiBranch: false,
    socialMedia: false,
    waba: false,
  },
  basic: {
    subdomain: true,
    brandingBasic: true,
    rbac: true,
    onlineTestV1: true,
    studyMaterials: true,
    attendance: true,
    fees: true,
    notifications: true,
    secureVideo: true,
    aiGenerators: false,
    youtubeLive: false,
    whiteLabelApk: false,
    multiBranch: false,
    socialMedia: true,
    waba: true,
  },
  pro: {
    subdomain: true,
    brandingBasic: true,
    rbac: true,
    onlineTestV1: true,
    studyMaterials: true,
    attendance: true,
    fees: true,
    notifications: true,
    secureVideo: true,
    aiGenerators: true,
    notesToQuestions: true,
    pyq: true,
    onlineTestV2: true,
    youtubeLive: false,
    whiteLabelApk: false,
    multiBranch: false,
    socialMedia: true,
    waba: true,
  },
  enterprise: {
    subdomain: true,
    brandingBasic: true,
    rbac: true,
    onlineTestV1: true,
    studyMaterials: true,
    attendance: true,
    fees: true,
    notifications: true,
    secureVideo: true,
    aiGenerators: true,
    notesToQuestions: true,
    pyq: true,
    onlineTestV2: true,
    youtubeLive: true,
    whiteLabelApk: true,
    multiBranch: true,
    marketingFunnel: true,
    teacherAnalytics: true,
    feePrediction: true,
    videoToNotes: true,
    socialMedia: true,
    waba: true,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is required" },
        { status: 400 }
      );
    }

    // Fetch tenant from backend to get their plan
    const response = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch tenant" },
        { status: response.status }
      );
    }

    const tenant = data.tenant || data;
    const plan = tenant.plan || "trial";
    
    // Get features for the plan
    const features = planFeatures[plan] || planFeatures.trial;

    return NextResponse.json({
      success: true,
      plan,
      features,
    });
  } catch (error) {
    console.error("Features fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch features" },
      { status: 500 }
    );
  }
}
