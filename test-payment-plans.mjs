#!/usr/bin/env node

/**
 * Quick test for PaymentLinkCard - Plans Fetching
 * Tests if the /api/payment-links/plans endpoint is working
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function testPlansEndpoint() {
  console.log("\n🔍 Testing Payment Links Plans Endpoint\n");
  console.log("Backend URL:", BACKEND_URL);
  console.log("Endpoint: GET /api/payment-links/plans\n");

  try {
    const response = await fetch(`${BACKEND_URL}/api/payment-links/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Response Status:", response.status, response.statusText);
    console.log("Response Headers:", {
      "content-type": response.headers.get("content-type"),
      "content-length": response.headers.get("content-length"),
    });

    const text = await response.text();
    console.log("\n📝 Raw Response (first 500 chars):");
    console.log(text.substring(0, 500));

    if (!response.ok) {
      console.log("\n❌ ERROR: Response is not OK");
      console.log("Full response:");
      console.log(text);
      return;
    }

    try {
      const data = JSON.parse(text);
      console.log("\n✅ Response is valid JSON");
      console.log("📊 Parsed Data:", JSON.stringify(data, null, 2));

      if (data.success) {
        console.log(`\n✅ SUCCESS: Found ${data.plans?.length || 0} plans`);
        data.plans?.forEach((plan) => {
          console.log(
            `   • ${plan.name} (${plan.id}): ₹${plan.priceMonthly}/mo, ₹${plan.priceAnnual}/yr`
          );
        });
      } else {
        console.log("\n⚠️ Response successful but data.success = false");
        console.log("Message:", data.message);
      }
    } catch (e) {
      console.log("\n❌ ERROR: Failed to parse JSON");
      console.log("Parse error:", e.message);
      console.log("Response was HTML:", text.includes("<!DOCTYPE"));
    }
  } catch (error) {
    console.log("\n❌ CONNECTION ERROR:", error.message);
    console.log("Make sure backend is running at:", BACKEND_URL);
    console.log("Run: npm run dev (in backend directory)");
  }
}

testPlansEndpoint();
