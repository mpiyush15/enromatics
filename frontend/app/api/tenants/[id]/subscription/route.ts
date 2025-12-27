/**
 * BFF Tenant Subscription Route
 * GET /api/tenants/[id]/subscription - Get subscription details
 */

import { NextRequest, NextResponse } from "next/server";
import { redisCache, CACHE_TTL } from "@/lib/redis";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

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

    // Check Redis cache first
    const cacheKey = `subscription:${tenantId}`;
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    // Forward to backend
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
        { success: false, message: data.message || "Failed to fetch subscription" },
        { status: response.status }
      );
    }

    // Calculate days remaining for trial
    const tenant = data.tenant || data;
    const subscription = tenant.subscription || {};
    
    let daysRemaining = 0;
    let calculatedEndDate = subscription.endDate;
    
    // If endDate is missing but trialStartDate exists, calculate endDate (14 days from start)
    if (!subscription.endDate && subscription.trialStartDate) {
      const trialStart = new Date(subscription.trialStartDate);
      calculatedEndDate = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }
    // If both endDate and trialStartDate are missing, use tenant createdAt for trial calculation
    else if (!subscription.endDate && !subscription.trialStartDate && tenant.createdAt) {
      const createdAt = new Date(tenant.createdAt);
      calculatedEndDate = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    if (calculatedEndDate) {
      const endDate = new Date(calculatedEndDate);
      const now = new Date();
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    const isTrialActive = (tenant.plan === "trial" || tenant.plan === "basic") && daysRemaining > 0;

    // Determine effective status:
    // - If status is "pending" but plan is still "trial", show "trial" not "pending"
    // - Pending status should only be internal, user sees trial until payment succeeds
    let effectiveStatus = subscription.status || "inactive";
    if (effectiveStatus === "pending" && (tenant.plan === "trial" || !subscription.startDate)) {
      effectiveStatus = "trial";
    }

    // Build response data
    const responseData = {
      success: true,
      tenant: {
        instituteName: tenant.instituteName,
        email: tenant.email,
        plan: tenant.plan || "free",
        subscription: {
          status: effectiveStatus,
          startDate: subscription.startDate || null,
          endDate: calculatedEndDate || null,
          trialStartDate: subscription.trialStartDate || null,
          billingCycle: subscription.billingCycle || "monthly",
          amount: subscription.amount || 0,
          currency: subscription.currency || "INR",
          daysRemaining: Math.max(0, daysRemaining), // Never show negative
          isTrialActive,
          pendingPlan: subscription.pendingPlan || null, // Show if there's a pending upgrade
        },
      },
    };

    // Cache the response for 2 minutes
    await redisCache.set(cacheKey, responseData, CACHE_TTL.SHORT);

    // Return with cache headers
    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Type': redisCache.isConnected() ? 'REDIS' : 'MEMORY',
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
