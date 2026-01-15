#!/usr/bin/env node

/**
 * Test script to verify subscription upgrade payment flow
 * Tests: handleUpgrade → /api/payment/initiate-subscription → Cashfree
 */

import axios from 'axios';

// Test data - existing tenant upgrading from dashboard
const testData = {
  tenantId: '4b778ad5', // From your test earlier
  planId: 'pro',
  email: 'test@example.com',
  phone: '9999999999',
  name: 'Test Institute',
  instituteName: 'Test Institute Academy',
  billingCycle: 'annual', // or 'monthly'
  amount: 14999, // Annual price for Pro plan
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testUpgradePayment() {
  console.log('\n🧪 Testing Subscription Upgrade Payment Flow\n');
  console.log('📋 Test Data:', testData);
  console.log('🌐 Backend URL:', BACKEND_URL);

  try {
    console.log('\n1️⃣ Calling /api/payment/initiate-subscription...');
    
    const response = await axios.post(
      `${BACKEND_URL}/api/payment/initiate-subscription`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('\n✅ SUCCESS! Payment session created\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Extract key data
    const { 
      paymentSessionId, 
      paymentLink, 
      orderId, 
      tenantId: returnedTenantId,
      plan,
      billingCycle
    } = response.data;

    console.log('\n📊 Key Data for Frontend:');
    console.log(`  • paymentSessionId: ${paymentSessionId}`);
    console.log(`  • orderId: ${orderId}`);
    console.log(`  • tenantId: ${returnedTenantId}`);
    console.log(`  • plan: ${plan.name} (${plan.id})`);
    console.log(`  • billingCycle: ${billingCycle}`);
    console.log(`  • amount: ₹${plan.priceMonthly || plan.priceAnnual}`);

    if (paymentLink) {
      console.log(`\n🔗 Payment Link (if needed):\n  ${paymentLink}`);
    }

    console.log('\n✨ Frontend will now:');
    console.log('  1. Initialize Cashfree SDK');
    console.log('  2. Call cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" })');
    console.log('  3. Modal opens on dashboard');
    console.log('  4. User completes payment');
    console.log('  5. Webhook updates tenant subscription');
    console.log('  6. Page refreshes to show new plan\n');

  } catch (error) {
    console.error('\n❌ ERROR!\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }

    console.log('\n🔍 Debugging Tips:');
    console.log('  • Check if backend is running: npm run dev');
    console.log('  • Verify CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET are set');
    console.log('  • Check backend logs for detailed error messages');
    console.log('  • Verify tenantId exists in database\n');
  }
}

testUpgradePayment();
