"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams?.get("plan") || "trial";

  useEffect(() => {
    // Immediately redirect to checkout with the plan
    const isTrial = planId === "trial" || planId === "free";
    
    if (isTrial) {
      // For trial/free plans, redirect to checkout with trial plan
      router.push("/subscription/checkout?planId=trial");
    } else {
      // For other paid plans, redirect to checkout with that plan
      router.push(`/subscription/checkout?planId=${planId}`);
    }
  }, [planId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}
