#!/usr/bin/env node

/**
 * Complete Template Fetch Test
 * Tests template fetching from:
 * 1. WhatsApp Platform API
 * 2. Backend endpoint
 * 3. Frontend API route
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env' });

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';
const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

console.log('\n' + '='.repeat(60));
console.log('🧪 TEMPLATE FETCH - COMPLETE TEST SUITE');
console.log('='.repeat(60) + '\n');

console.log('📋 Configuration:');
console.log(`   Backend URL: ${BACKEND_URL}`);
console.log(`   Platform URL: ${WHATSAPP_PLATFORM_URL || '❌ Missing'}`);
console.log(`   Platform API Key: ${WHATSAPP_PLATFORM_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);

/**
 * Test 1: Platform API Connection
 */
async function testPlatformConnection() {
  console.log('📡 TEST 1: WhatsApp Platform Connection');
  console.log('-'.repeat(60));

  try {
    const response = await axios.get(`${WHATSAPP_PLATFORM_URL}/api/templates`, {
      headers: {
        'x-api-key': WHATSAPP_PLATFORM_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    console.log(`✅ Platform API Connected`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates found: ${response.data.templates?.length || response.data.data?.length || 0}`);
    return true;
  } catch (error) {
    console.error(`❌ Platform API Error:`);
    console.error(`   ${error.message}`);
    if (error.response?.status) {
      console.error(`   Status: ${error.response.status}`);
    }
    return false;
  }
}

/**
 * Test 2: Backend Templates Endpoint
 */
async function testBackendTemplates(tenantId = 'test-tenant') {
  console.log('\n📦 TEST 2: Backend Template Endpoint');
  console.log('-'.repeat(60));

  try {
    const response = await axios.get(`${BACKEND_URL}/api/whatsapp/templates?tenantId=${tenantId}`, {
      timeout: 5000,
    });

    console.log(`✅ Backend API Connected`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates found: ${response.data.templates?.length || 0}`);
    console.log(`   Tenant: ${response.data.tenantId}`);
    
    if (response.data.templates?.length > 0) {
      console.log(`   Sample template: ${response.data.templates[0].templateName}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Backend API Error:`);
    console.error(`   ${error.message}`);
    if (error.response?.data) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

/**
 * Test 3: Template Sync Endpoint (Protected)
 */
async function testTemplateSync(tenantId = 'test-tenant', token = null) {
  console.log('\n🔄 TEST 3: Template Sync Endpoint');
  console.log('-'.repeat(60));

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`   Using token: ${token.substring(0, 10)}...`);
    } else {
      console.log(`   ⚠️ No token provided (endpoint requires authentication)`);
    }

    const response = await axios.post(
      `${BACKEND_URL}/api/whatsapp/templates/sync`,
      { tenantId },
      { headers, timeout: 10000 }
    );

    console.log(`✅ Sync Endpoint Connected`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates synced: ${response.data.syncedCount || 0}`);
    return true;
  } catch (error) {
    console.error(`❌ Sync Endpoint Error:`);
    console.error(`   ${error.message}`);
    if (error.response?.status === 401) {
      console.error(`   ⚠️ Authentication failed (401)`);
    } else if (error.response?.data) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

/**
 * Test 4: Frontend API Route
 */
async function testFrontendRoute(tenantId = 'test-tenant') {
  console.log('\n🌐 TEST 4: Frontend API Route');
  console.log('-'.repeat(60));

  try {
    // Frontend route is typically at http://localhost:3000
    const frontendUrl = 'http://localhost:3000';
    const response = await axios.get(
      `${frontendUrl}/api/whatsapp/templates?tenantId=${tenantId}`,
      { timeout: 5000 }
    );

    console.log(`✅ Frontend Route Connected`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates found: ${response.data.templates?.length || 0}`);
    return true;
  } catch (error) {
    console.error(`❌ Frontend Route Error:`);
    console.error(`   ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error(`   ⚠️ Frontend not running on port 3000`);
    }
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const results = {
    platform: false,
    backend: false,
    sync: false,
    frontend: false,
  };

  // Test Platform
  results.platform = await testPlatformConnection();

  // Test Backend - Using Shree Coaching Classes (mpiyush2727@gmail.com)
  results.backend = await testBackendTemplates('4b778ad5');

  // Test Sync (without token - will fail with 401)
  results.sync = await testTemplateSync('4b778ad5');

  // Test Frontend
  results.frontend = await testFrontendRoute('4b778ad5');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Platform API:     ${results.platform ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`✅ Backend API:      ${results.backend ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`✅ Sync Endpoint:    ${results.sync ? '✓ PASS' : '✗ FAIL (expected 401 without token)'}`);
  console.log(`✅ Frontend Route:   ${results.frontend ? '✓ PASS' : '✗ FAIL (expected if not running)'}`);
  console.log('\n' + '='.repeat(60) + '\n');

  // Return status
  const passed = Object.values(results).filter(r => r).length;
  console.log(`Result: ${passed}/4 tests passed\n`);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite error:', error.message);
  process.exit(1);
});
